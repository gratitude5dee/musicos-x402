import { Config } from "../types";

function parseJsonEnv<T>(name: string, fallback: T): T {
  const value = process.env[name];
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`Failed to parse ${name}: ${(error as Error).message}`);
    return fallback;
  }
}

function parseNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return fallback;
}

export function loadConfig(): Config {
  const mode = (process.env.MCP_MODE ?? "mock").toLowerCase() === "live" ? "live" : "mock";

  const kbDefaultLimit = parseNumberEnv(
    "MCP_KB_DEFAULT_LIMIT",
    parseNumberEnv("MCP_KB_DEFAULT_TOPK", 5)
  );
  const kbThresholdEnv =
    process.env.MCP_KB_SIMILARITY_THRESHOLD ?? process.env.MCP_KB_DEFAULT_THRESHOLD ?? "0.25";

  const allowlistedSql = parseJsonEnv<Record<string, string>>("MCP_ALLOWLISTED_SQL", {
    list_creator_assets: "select * from creator_assets where creator_id = :creator_id limit :limit",
    treasury_balances: "select symbol, balance from treasury_balances where creator_id = :creator_id"
  });

  const allowlistedRpcs = parseJsonEnv<Config["allowlistedRpcs"]>("MCP_ALLOWLISTED_RPCS", {
    "create-wallet": { type: "edge", name: "create-wallet" },
    "transfer-sol": { type: "edge", name: "transfer-sol" },
    log_agent_activity: { type: "postgres", name: "log_agent_activity" }
  });

  const storageBuckets = parseJsonEnv<string[]>("MCP_STORAGE_BUCKETS", [
    "agent-artifacts",
    "wzrd-renders",
    "analytics-exports"
  ]);

  const config: Config = {
    mode,
    port: parseNumberEnv("MCP_PORT", 8974),
    bearerToken: process.env.MCP_BEARER_TOKEN ?? "dev-secret",
    logLevel: process.env.MCP_LOG_LEVEL,
    enableMetrics: parseBooleanEnv("MCP_ENABLE_METRICS", false),
    enableTracing: parseBooleanEnv("MCP_ENABLE_TRACING", false),
    sentryDsn: process.env.MCP_SENTRY_DSN,
    supabase: {
      url: process.env.MCP_SUPABASE_URL,
      anonKey: process.env.MCP_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.MCP_SUPABASE_SERVICE_ROLE_KEY,
      functionJwt: process.env.MCP_SUPABASE_FUNCTION_JWT,
      schema: process.env.MCP_SUPABASE_SCHEMA ?? "public"
    },
    allowlistedSql,
    sqlRunnerRpc: process.env.MCP_SQL_RUNNER_RPC ?? "run_allowlisted_sql",
    sqlDefaultLimit: parseNumberEnv("MCP_SQL_DEFAULT_LIMIT", 50),
    allowlistedRpcs,
    storageBuckets,
    storageDefaultExpirySeconds: parseNumberEnv("MCP_STORAGE_DEFAULT_EXPIRY", 300),
    crossmint: {
      apiKey: process.env.MCP_CROSSMINT_API_KEY,
      projectId: process.env.MCP_CROSSMINT_PROJECT_ID,
      baseUrl: process.env.MCP_CROSSMINT_BASE_URL ?? "https://staging.crossmint.com",
      dryRun: mode === "mock" || process.env.MCP_CROSSMINT_DRY_RUN === "true"
    },
    wallet: {
      maxSol: Number.parseFloat(process.env.MCP_WALLET_MAX_SOL ?? "10"),
      confirmationSecret: process.env.MCP_WALLET_CONFIRMATION_SECRET,
      confirmationTtlSeconds: parseNumberEnv("MCP_WALLET_CONFIRMATION_TTL", 600),
      transferFunctionName: process.env.MCP_WALLET_TRANSFER_FUNCTION ?? "transfer-sol",
      defaultMemoPrefix: process.env.MCP_WALLET_MEMO_PREFIX ?? "UNIVAI"
    },
    kb: {
      matchRpc: process.env.MCP_KB_MATCH_RPC ?? "match_kb_chunks",
      listRpc: process.env.MCP_KB_LIST_RPC ?? "list_kb_items",
      getRpc: process.env.MCP_KB_GET_RPC ?? "get_kb_item",
      table: process.env.MCP_KB_TABLE ?? "agent_memory_chunks",
      embeddingModel: process.env.MCP_KB_EMBEDDING_MODEL ?? "text-embedding-3-small",
      embeddingEndpoint: process.env.MCP_EMBEDDING_ENDPOINT,
      embeddingApiKey: process.env.MCP_EMBEDDING_API_KEY,
      defaultTopK: kbDefaultLimit,
      defaultThreshold: Number.parseFloat(kbThresholdEnv)
    },
    webSearch: {
      provider: (process.env.MCP_WEB_SEARCH_PROVIDER as "tavily" | "custom" | undefined) ?? "tavily",
      endpoint: process.env.MCP_WEB_SEARCH_ENDPOINT,
      apiKey: process.env.MCP_WEB_SEARCH_API_KEY,
      safe: process.env.MCP_WEB_SEARCH_SAFE !== "false",
      maxResultsDefault: parseNumberEnv("MCP_WEB_SEARCH_MAX_RESULTS", 5)
    },
    idempotency: {
      rpcName: process.env.MCP_IDEMPOTENCY_RPC ?? "ensure_idempotency_key",
      ttlSeconds: parseNumberEnv("MCP_IDEMPOTENCY_TTL", 86_400)
    }
  };

  return config;
}
