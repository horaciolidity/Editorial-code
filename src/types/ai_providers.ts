export interface ModelCapability {
  longWriting: boolean;       // Excelente redacción y desarrollo extenso
  longContext: boolean;       // Ventana > 32k tokens
  deepReasoning: boolean;     // Pensamiento paso a paso / Plot construction
  toolCalling: boolean;       // Capacidad de invocar funciones/herramientas JSON
  structuredOutput: boolean;  // Salida JSON schema estricta
  fastSpeed: boolean;         // Respuestas sub-segundo (ej. Groq / Cerebras)
  research: boolean;          // Búsqueda / Verificación de datos
}

export interface ModelSpec {
  id: string;
  name: string;
  tier: 'permanent_free' | 'limited_free' | 'promotional_credits' | 'paid';
  contextTokens: number;
  rpmLimit?: number;          // Peticiones por minuto
  rpdLimit?: number;          // Peticiones por día
  tpmLimit?: number;          // Tokens por minuto
  capabilities: ModelCapability;
  description: string;
}

export interface QuotaPolicy {
  hasFreeTier: boolean;
  freeTierType: 'permanent_daily' | 'permanent_rate_limited' | 'promotional_credits' | 'none';
  renewalFrequency: 'daily_utc' | 'rolling_minute' | 'rolling_hour' | 'no_automatic_renewal';
  resetScheduleDescription: string;
  creditsExpire: boolean;
  replenishesAutomatically: boolean;
  officialDocUrl: string;
}

export interface ProviderState {
  id: string;
  name: string;
  type: 'gemini' | 'groq' | 'cerebras' | 'openrouter' | 'deepseek' | 'mistral' | 'huggingface' | 'qwen' | 'local';
  baseUrl?: string;
  apiKeyUrl?: string;
  docsUrl?: string;
  isConfigured: boolean;
  hasCustomKey: boolean;
  maskedKey?: string;
  enabled: boolean;
  status: 'active' | 'configured' | 'missing_key' | 'rate_limited' | 'quota_exhausted' | 'error';
  lastStatusCheck?: string;
  lastSuccessfulRequest?: string;
  lastErrorMessage?: string;
  cooldownUntil?: string;
  requestsCountToday: number;
  tokensConsumedToday: number;
  quotaPolicy: QuotaPolicy;
  models: ModelSpec[];
  defaultModel: string;
}

export interface AIRouterSettings {
  mode: 'free_first' | 'free_only' | 'manual' | 'custom_priority';
  priorityOrder: string[]; // ['gemini', 'groq', 'cerebras', 'openrouter', 'mistral', 'deepseek', 'qwen', 'huggingface']
  taskMapping: {
    writing: { provider: string; model: string };
    research: { provider: string; model: string };
    editing: { provider: string; model: string };
    proofreading: { provider: string; model: string };
    agentTools: { provider: string; model: string };
    documentAnalysis: { provider: string; model: string };
  };
  allowPaidModels: boolean;
}

export interface FallbackEvent {
  timestamp: string;
  fromProvider: string;
  toProvider: string;
  fromModel: string;
  toModel: string;
  reason: string;
  projectId: string;
}

export interface DeploymentDiagnostics {
  environment: 'development' | 'production';
  backendConnected: boolean;
  deploymentPlatform: string;
  registryLoaded: boolean;
  totalRegisteredProviders: number;
  configuredProvidersCount: number;
  configuredProviderIds: string[];
  missingEnvironmentVariables: string[];
  detectedEnvironmentVariables: string[];
  lastProviderError?: string;
  hasServerGeminiKey: boolean;
  diagnosticTimestamp: string;
  warnings: string[];
  deploymentRecommendations: string[];
}

