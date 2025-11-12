import { Config, Logger, SupabaseClientLike, ToolContext } from "../types";

export function createMockConfig(): Config {
  return {
    mode: "mock",
    port: 0,
    bearerToken: "test-token",
    logLevel: "debug",
    enableMetrics: false,
    enableTracing: false,
    sentryDsn: undefined,
    supabase: {
      url: "",
      anonKey: "",
      serviceRoleKey: "",
      functionJwt: "",
      schema: "public"
    },
    allowlistedSql: {
      list_creator_assets: "select 1",
      treasury_balances: "select 1"
    },
    sqlRunnerRpc: "run_allowlisted_sql",
    sqlDefaultLimit: 50,
    allowlistedRpcs: {
      "create-wallet": { type: "edge", name: "create-wallet" },
      "transfer-sol": { type: "edge", name: "transfer-sol" },
      log_agent_activity: { type: "postgres", name: "log_agent_activity" }
    },
    storageBuckets: ["agent-artifacts"],
    storageDefaultExpirySeconds: 300,
    crossmint: {
      apiKey: "mock",
      projectId: "mock",
      baseUrl: "https://example.com",
      dryRun: true
    },
    wallet: {
      maxSol: 10,
      confirmationSecret: "test-secret",
      confirmationTtlSeconds: 600,
      transferFunctionName: "transfer-sol",
      defaultMemoPrefix: "TEST"
    },
    kb: {
      matchRpc: "match_kb_chunks",
      listRpc: "list_kb_items",
      getRpc: "get_kb_item",
      table: "knowledge_chunks",
      embeddingModel: "mock-model",
      embeddingEndpoint: "https://example.com/embed",
      embeddingApiKey: "mock",
      defaultTopK: 5,
      defaultThreshold: 0.2
    },
    webSearch: {
      provider: "tavily",
      endpoint: "https://example.com/search",
      apiKey: "mock",
      safe: true,
      maxResultsDefault: 5
    },
    idempotency: {
      rpcName: "ensure_idempotency_key",
      ttlSeconds: 86_400
    }
  };
}

function createMockLogger(): Logger {
  return {
    debug() {},
    info() {},
    warn() {},
    error() {},
    child() {
      return createMockLogger();
    }
  };
}

export function createMockSupabase(): SupabaseClientLike {
  return {
    async rpc(fn: string) {
      if (fn === "ensure_idempotency_key") {
        return { data: false, error: null };
      }
      if (fn === "run_allowlisted_sql") {
        return {
          data: { rows: [{ id: "mock-row" }] },
          error: null
        };
      }
      if (fn === "match_kb_chunks") {
        return {
          data: [
            {
              id: "kb-1",
              similarity: 0.9,
              chunk: "Mock chunk",
              source_uri: "kb://universalai/mock",
              metadata: {}
            }
          ],
          error: null
        };
      }
      if (fn === "get_kb_item") {
        return {
          data: {
            id: "kb-1",
            uri: "kb://universalai/mock",
            title: "Mock KB Item",
            body: "Mock body",
            content_type: "text/markdown",
            summary: "Mock summary",
            metadata: {}
          },
          error: null
        };
      }
      return { data: null, error: { message: `rpc ${fn} not mocked` } };
    },
    functions: {
      async invoke(name: string) {
        return {
          data: { name, ok: true, signature: `mock-${name}` },
          error: null
        };
      }
    },
    storage: {
      from(bucket: string) {
        return {
          async createSignedUrl(path: string) {
            return {
              data: {
                signedUrl: `https://example.com/${bucket}/${path}?mock=true`
              },
              error: null
            };
          },
          async upload(path: string) {
            return {
              data: { path, id: `mock-${path}` },
              error: null
            };
          }
        };
      }
    }
  };
}

export function createMockContext(
  overrides?: Partial<ToolContext>
): ToolContext {
  const config = overrides?.config ?? createMockConfig();
  return {
    config,
    supabase: overrides?.supabase ?? createMockSupabase(),
    fetch:
      overrides?.fetch ?? (async () =>
        new globalThis.Response(
          JSON.stringify({
            data: [{ embedding: [0.1, 0.2, 0.3] }]
          })
        )) as typeof fetch,
    logger: overrides?.logger ?? createMockLogger(),
    correlationId: overrides?.correlationId ?? "test-correlation",
    now: overrides?.now ?? (() => new Date())
  };
}
