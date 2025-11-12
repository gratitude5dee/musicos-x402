import http from "node:http";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Config, PromptDefinition, ResourceDefinition, ToolContext, ToolDefinition } from "./types";
import { loadConfig } from "./utils/config";
import { createLogger } from "./utils/logger";
import { assertSchema } from "./utils/schema";
import { createWalletCreateTool } from "./tools/wallet_create";
import { createWalletTransferTool } from "./tools/wallet_transfer";
import { createKbSearchTool } from "./tools/kb_search";
import { createWebSearchTool } from "./tools/web_search";
import { createSupabaseQuerySqlTool } from "./tools/supabase_query_sql";
import { createSupabaseCallRpcTool } from "./tools/supabase_call_rpc";
import { createStorageGetTool } from "./tools/storage_get";
import { createStoragePutTool } from "./tools/storage_put";
import { createKnowledgeResource } from "./resources/kb";
import { answerWithContextPrompt } from "./prompts/answer_with_context";
import { summarizeAndCitePrompt } from "./prompts/summarize_and_cite";
import { mintTransactionPlanPrompt } from "./prompts/mint_transaction_plan";

interface InvokeRequest {
  tool: string;
  input: unknown;
}

interface PromptRequest {
  prompt: string;
  params: unknown;
}

const config: Config = loadConfig();
const logger = createLogger({ level: config.logLevel ?? "info" });

const supabase =
  config.supabase.url && config.supabase.serviceRoleKey
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { persistSession: false },
        global: {
          headers: { apikey: config.supabase.serviceRoleKey }
        }
      })
    : null;

const fallbackSupabase: ToolContext["supabase"] = {
  async rpc() {
    return { data: null, error: { message: "Supabase not configured" } };
  },
  functions: {
    async invoke() {
      return { data: null, error: { message: "Supabase not configured" } };
    }
  },
  storage: {
    from() {
      return {
        async createSignedUrl() {
          return { data: null, error: { message: "Supabase not configured" } };
        },
        async upload() {
          return { data: null, error: { message: "Supabase not configured" } };
        }
      };
    }
  }
};

const tools: Record<string, ToolDefinition<any, any>> = {
  wallet_create: createWalletCreateTool(config),
  wallet_transfer: createWalletTransferTool(config),
  kb_search: createKbSearchTool(config),
  web_search: createWebSearchTool(config),
  supabase_query_sql: createSupabaseQuerySqlTool(config),
  supabase_call_rpc: createSupabaseCallRpcTool(config),
  storage_get: createStorageGetTool(config),
  storage_put: createStoragePutTool(config)
};

const prompts: Record<string, PromptDefinition> = {
  answer_with_context: answerWithContextPrompt,
  summarize_and_cite: summarizeAndCitePrompt,
  mint_transaction_plan: mintTransactionPlanPrompt
};

const resources: Record<string, ResourceDefinition> = {
  kb: createKnowledgeResource(config)
};

function authenticate(req: http.IncomingMessage): boolean {
  if (req.method === "GET" && req.url === "/health") {
    return true;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || token !== config.bearerToken) {
    return false;
  }

  return true;
}

function createContext(correlationId: string, toolName?: string): ToolContext {
  const toolLogger = logger.child({ correlationId, tool: toolName });
  return {
    config,
    supabase: supabase ?? fallbackSupabase,
    fetch: globalThis.fetch.bind(globalThis),
    logger: toolLogger,
    correlationId,
    now: () => new Date()
  };
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    req.on("error", (error) => {
      reject(error);
    });
  });
}

function writeJson(res: http.ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  const correlationId = req.headers["x-correlation-id"]?.toString() ?? randomUUID();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Correlation-Id"
  );

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const requestLogger = logger.child({ correlationId, path: req.url, method: req.method });

  if (!authenticate(req)) {
    requestLogger.warn("Unauthorized request");
    writeJson(res, 401, { error: "Unauthorized" });
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    writeJson(res, 200, {
      status: "healthy",
      mode: config.mode,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    if (req.method === "GET" && req.url === "/tools") {
      const toolList = Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema
      }));

      writeJson(res, 200, { tools: toolList });
      return;
    }

    if (req.method === "POST" && req.url === "/invoke") {
      const rawBody = await readBody(req);
      const body = rawBody ? (JSON.parse(rawBody) as InvokeRequest) : ({ tool: "", input: {} } as InvokeRequest);

      const tool = tools[body.tool];
      if (!tool) {
        requestLogger.warn("Tool not found", { tool: body.tool });
        writeJson(res, 404, { error: `Tool not found: ${body.tool}` });
        return;
      }

      const context = createContext(correlationId, body.tool);
      requestLogger.info("Tool invocation started", { tool: body.tool });

      const start = Date.now();
      const output = await tool.handler(context, body.input as never);
      const latencyMs = Date.now() - start;

      requestLogger.info("Tool invocation completed", {
        tool: body.tool,
        latencyMs,
        success: true
      });

      writeJson(res, 200, { output, latencyMs });
      return;
    }

    if (req.method === "POST" && req.url === "/prompt") {
      const rawBody = await readBody(req);
      const body = rawBody ? (JSON.parse(rawBody) as PromptRequest) : ({ prompt: "", params: {} } as PromptRequest);

      const prompt = prompts[body.prompt];
      if (!prompt) {
        requestLogger.warn("Prompt not found", { prompt: body.prompt });
        writeJson(res, 404, { error: `Prompt not found: ${body.prompt}` });
        return;
      }

      assertSchema(prompt.parametersSchema, body.params, `${prompt.name}.params`);
      const rendered = await prompt.render(body.params as never);
      writeJson(res, 200, { messages: rendered });
      return;
    }

    if (req.method === "GET" && req.url?.startsWith("/resources")) {
      const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
      const uri = url.searchParams.get("uri");

      if (!uri) {
        writeJson(res, 400, { error: "Missing uri parameter" });
        return;
      }

      const [protocol, path] = uri.split("://");
      const resource = resources[protocol];

      if (!resource) {
        requestLogger.warn("Resource protocol not found", { protocol });
        writeJson(res, 404, { error: `Resource protocol not found: ${protocol}` });
        return;
      }

      const context = createContext(correlationId, `resource:${protocol}`);

      const id = url.searchParams.get("id");
      if (id) {
        const item = await resource.get(context, id);
        writeJson(res, 200, { item, path });
        return;
      }

      const contents = await resource.list(context, Object.fromEntries(url.searchParams));
      writeJson(res, 200, { contents, path });
      return;
    }

    writeJson(res, 404, { error: "Not found" });
  } catch (error) {
    requestLogger.error("Request failed", {
      error: (error as Error).message,
      stack: (error as Error).stack
    });
    writeJson(res, 500, { error: (error as Error).message, correlationId });
  }
});

server.listen(config.port, () => {
  logger.info("MCP Server started", {
    port: config.port,
    mode: config.mode,
    pid: process.pid
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export { server };
