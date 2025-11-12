import { createHmac, timingSafeEqual } from "node:crypto";
import { Config, ToolContext, ToolDefinition } from "../types";
import { assertSchema } from "../utils/schema";

const inputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "wallet_transfer.input",
  type: "object",
  required: ["fromWallet", "toWallet", "amountSol", "confirmationToken", "idempotencyKey"],
  properties: {
    fromWallet: { type: "string" },
    toWallet: { type: "string" },
    amountSol: { type: "number", exclusiveMinimum: 0 },
    memo: { type: "string", maxLength: 120 },
    confirmationToken: { type: "string", minLength: 32 },
    idempotencyKey: { type: "string", minLength: 24 }
  },
  additionalProperties: false
} as const;

const outputSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "wallet_transfer.output",
  type: "object",
  required: ["status", "idempotencyKey", "submittedAt", "wasDuplicate"],
  properties: {
    status: { type: "string" },
    idempotencyKey: { type: "string" },
    submittedAt: { type: "string", format: "date-time" },
    wasDuplicate: { type: "boolean" },
    transactionSignature: { type: ["string", "null"] }
  },
  additionalProperties: false
} as const;

type Input = {
  fromWallet: string;
  toWallet: string;
  amountSol: number;
  memo?: string;
  confirmationToken: string;
  idempotencyKey: string;
};

type Output = {
  status: "submitted" | "duplicate" | "mocked";
  idempotencyKey: string;
  submittedAt: string;
  wasDuplicate: boolean;
  transactionSignature: string | null;
};

const memoryIdempotency = new Map<string, string>();
const IDEMPOTENCY_SALT = "wallet-transfer-idempotency";

interface ConfirmationPayload {
  fromWallet: string;
  toWallet: string;
  amountSol: number;
  memo?: string;
}

function computePayloadHash(payload: ConfirmationPayload): string {
  return createHmac("sha256", IDEMPOTENCY_SALT)
    .update(JSON.stringify(payload))
    .digest("hex");
}

export function generateConfirmationToken(
  secret: string,
  payload: ConfirmationPayload,
  now: Date = new Date()
): string {
  const timestamp = Math.floor(now.getTime() / 1000).toString();
  const payloadHash = computePayloadHash(payload);
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${payloadHash}`)
    .digest("hex");
  return `${timestamp}.${payloadHash}.${signature}`;
}

function verifyConfirmationToken(
  config: Config,
  token: string,
  payload: ConfirmationPayload,
  now: Date
) {
  if (!config.wallet.confirmationSecret) {
    if (config.mode === "mock") return;
    throw new Error("Wallet confirmation secret is not configured");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid confirmation token format");
  }
  const [timestampStr, payloadHash, signature] = parts;
  const timestamp = Number.parseInt(timestampStr, 10);
  if (!Number.isFinite(timestamp)) {
    throw new Error("Invalid confirmation token timestamp");
  }
  const currentSeconds = Math.floor(now.getTime() / 1000);
  if (currentSeconds - timestamp > config.wallet.confirmationTtlSeconds) {
    throw new Error("Confirmation token expired");
  }

  const expectedHash = computePayloadHash(payload);
  const expectedSignature = createHmac("sha256", config.wallet.confirmationSecret)
    .update(`${timestampStr}.${expectedHash}`)
    .digest("hex");

  if (!timingSafeEqual(Buffer.from(payloadHash), Buffer.from(expectedHash))) {
    throw new Error("Confirmation token payload mismatch");
  }
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Confirmation token signature mismatch");
  }
}

async function ensureIdempotency(
  context: ToolContext,
  key: string,
  payloadHash: string
): Promise<boolean> {
  if (context.config.mode === "mock" || !context.config.idempotency.rpcName) {
    const existing = memoryIdempotency.get(key);
    if (existing && existing !== payloadHash) {
      throw new Error("Idempotency key already used with a different payload");
    }
    const duplicate = existing === payloadHash;
    memoryIdempotency.set(key, payloadHash);
    return duplicate;
  }

  const { data, error } = await context.supabase.rpc(
    context.config.idempotency.rpcName!,
    {
      p_idempotency_key: key,
      p_payload_hash: payloadHash,
      p_tool_name: "wallet_transfer"
    }
  );

  if (error) {
    throw new Error(`Idempotency RPC failed: ${error.message}`);
  }

  if (typeof data === "boolean") {
    return data;
  }

  if (data && typeof data === "object" && "was_processed" in data) {
    return Boolean((data as { was_processed: boolean }).was_processed);
  }

  return false;
}

export function createWalletTransferTool(
  config: Config
): ToolDefinition<Input, Output> {
  return {
    name: "wallet_transfer",
    description: "Submit a guarded Solana transfer via Crossmint/Supabase function",
    inputSchema,
    outputSchema,
    idempotent: false,
    async handler(context: ToolContext, rawInput: Input): Promise<Output> {
      assertSchema(inputSchema, rawInput, "wallet_transfer.input");

      if (rawInput.amountSol > config.wallet.maxSol) {
        throw new Error(`Amount exceeds configured max (${config.wallet.maxSol} SOL)`);
      }

      const payload: ConfirmationPayload = {
        fromWallet: rawInput.fromWallet,
        toWallet: rawInput.toWallet,
        amountSol: rawInput.amountSol,
        memo: rawInput.memo
      };

      verifyConfirmationToken(config, rawInput.confirmationToken, payload, context.now());

      const payloadHash = computePayloadHash(payload);
      const wasDuplicate = await ensureIdempotency(context, rawInput.idempotencyKey, payloadHash);
      const submittedAt = context.now().toISOString();

      if (wasDuplicate) {
        context.logger.warn("Duplicate wallet transfer detected", {
          idempotencyKey: rawInput.idempotencyKey
        });
        return {
          status: "duplicate",
          idempotencyKey: rawInput.idempotencyKey,
          wasDuplicate: true,
          transactionSignature: null,
          submittedAt
        };
      }

      if (config.mode === "mock" || config.crossmint.dryRun) {
        context.logger.info("Wallet transfer executed in mock mode", {
          fromWallet: rawInput.fromWallet.slice(0, 8),
          toWallet: rawInput.toWallet.slice(0, 8),
          amountSol: rawInput.amountSol
        });
        return {
          status: "mocked",
          idempotencyKey: rawInput.idempotencyKey,
          wasDuplicate: false,
          transactionSignature: `mock-signature-${Date.now()}`,
          submittedAt
        };
      }

      const headers: Record<string, string> = {
        "Idempotency-Key": rawInput.idempotencyKey,
        "X-Correlation-Id": context.correlationId
      };

      if (config.supabase.functionJwt) {
        headers.Authorization = `Bearer ${config.supabase.functionJwt}`;
      } else if (config.supabase.serviceRoleKey) {
        headers.apikey = config.supabase.serviceRoleKey;
      } else if (config.supabase.anonKey) {
        headers.apikey = config.supabase.anonKey;
      }

      const { data, error } = await context.supabase.functions.invoke<{
        signature: string;
      }>(config.wallet.transferFunctionName, {
        body: {
          fromWallet: rawInput.fromWallet,
          toWallet: rawInput.toWallet,
          amount: rawInput.amountSol,
          memo: rawInput.memo ?? `${config.wallet.defaultMemoPrefix}-${context.correlationId}`
        },
        headers
      });

      if (error) {
        throw new Error(`transfer function failed: ${error.message}`);
      }

      context.logger.info("Wallet transfer submitted", {
        fromWallet: rawInput.fromWallet.slice(0, 8),
        toWallet: rawInput.toWallet.slice(0, 8),
        amountSol: rawInput.amountSol,
        signature: data?.signature
      });

      return {
        status: "submitted",
        idempotencyKey: rawInput.idempotencyKey,
        wasDuplicate: false,
        transactionSignature: data?.signature ?? null,
        submittedAt
      };
    }
  };
}

