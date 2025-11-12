export type JSONSchemaType =
  | "object"
  | "array"
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null";

export interface JSONSchema {
  $schema?: string;
  title?: string;
  type?: JSONSchemaType | JSONSchemaType[];
  required?: string[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  additionalProperties?: boolean | JSONSchema;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  default?: unknown;
}

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): Logger;
}

export interface SupabaseFunctionsLike {
  invoke<T = unknown>(
    name: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
    }
  ): Promise<{ data: T | null; error: { message: string } | null }>;
}

export interface SupabaseStorageBucketLike {
  createSignedUrl(
    path: string,
    expiresIn: number,
    options?: { download?: boolean }
  ): Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
  upload(
    path: string,
    body: ArrayBuffer | Uint8Array,
    options?: { contentType?: string; metadata?: Record<string, string>; upsert?: boolean }
  ): Promise<{ data: { path?: string; id?: string } | null; error: { message: string } | null }>;
}

export interface SupabaseStorageLike {
  from(bucket: string): SupabaseStorageBucketLike;
}

export interface SupabaseClientLike {
  rpc<T = unknown>(
    fn: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T | null; error: { message: string } | null }>;
  functions: SupabaseFunctionsLike;
  storage: SupabaseStorageLike;
}

export interface Config {
  mode: "mock" | "live";
  port: number;
  bearerToken: string;
  logLevel?: string;
  enableMetrics: boolean;
  enableTracing: boolean;
  sentryDsn?: string;
  supabase: {
    url?: string;
    anonKey?: string;
    serviceRoleKey?: string;
    functionJwt?: string;
    schema: string;
  };
  allowlistedSql: Record<string, string>;
  sqlRunnerRpc: string;
  sqlDefaultLimit: number;
  allowlistedRpcs: Record<
    string,
    | { type: "edge"; name: string }
    | { type: "postgres"; name: string }
  >;
  storageBuckets: string[];
  storageDefaultExpirySeconds: number;
  crossmint: {
    apiKey?: string;
    projectId?: string;
    baseUrl: string;
    dryRun: boolean;
  };
  wallet: {
    maxSol: number;
    confirmationSecret?: string;
    confirmationTtlSeconds: number;
    transferFunctionName: string;
    defaultMemoPrefix: string;
  };
  kb: {
    matchRpc: string;
    listRpc: string;
    getRpc: string;
    table: string;
    embeddingModel: string;
    embeddingEndpoint?: string;
    embeddingApiKey?: string;
    defaultTopK: number;
    defaultThreshold: number;
  };
  webSearch: {
    provider: "tavily" | "custom";
    endpoint?: string;
    apiKey?: string;
    safe: boolean;
    maxResultsDefault: number;
  };
  idempotency: {
    rpcName?: string;
    ttlSeconds: number;
  };
}

export interface ToolContext {
  config: Config;
  supabase: SupabaseClientLike;
  fetch: typeof fetch;
  logger: Logger;
  correlationId: string;
  now(): Date;
}

export interface ToolDefinition<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  idempotent: boolean;
  handler(context: ToolContext, input: Input): Promise<Output>;
}

export interface ResourceItem {
  id: string;
  uri: string;
  title: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface ResourceListResponse {
  items: ResourceItem[];
  nextCursor: string | null;
}

export interface ResourceGetResponse {
  id: string;
  uri: string;
  title: string;
  body: string;
  contentType: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  embedding?: number[];
}

export interface ResourceDefinition {
  uri: string;
  list(
    context: ToolContext,
    params?: Record<string, string | string[] | undefined>
  ): Promise<ResourceListResponse>;
  get(context: ToolContext, id: string): Promise<ResourceGetResponse>;
}

export interface PromptDefinition<TParams = unknown> {
  name: string;
  description: string;
  parametersSchema: JSONSchema;
  render(params: TParams): Promise<string> | string;
}
