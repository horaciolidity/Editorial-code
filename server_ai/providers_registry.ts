import { ProviderState, AIRouterSettings } from '../src/types/ai_providers';

export const INITIAL_PROVIDERS_CONFIG: ProviderState[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/docs',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'active',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_daily',
      renewalFrequency: 'daily_utc',
      resetScheduleDescription: 'La cuota gratuita se restablece automáticamente cada 24 horas a las 00:00 UTC (15 RPM / 1.500 peticiones diarias).',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://ai.google.dev/docs'
    },
    defaultModel: 'gemini-3.8-flash',
    models: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash (Recomendado)',
        tier: 'permanent_free',
        contextTokens: 1048576,
        rpmLimit: 15,
        rpdLimit: 1500,
        tpmLimit: 1000000,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'Excelente para redacción editorial, memoria a gran escala y ejecución de herramientas de agentes.'
      },
      {
        id: 'gemini-3.1-flash-lite',
        name: 'Gemini 3.1 Flash Lite',
        tier: 'permanent_free',
        contextTokens: 1048576,
        rpmLimit: 15,
        rpdLimit: 1500,
        tpmLimit: 1000000,
        capabilities: {
          longWriting: false,
          longContext: true,
          deepReasoning: false,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: false
        },
        description: 'Modelo ultraligero y rápido para correcciones rápidas y resúmenes breves.'
      },
      {
        id: 'gemini-4-argon',
        name: 'Gemini 4 Argon (Pro)',
        tier: 'paid',
        contextTokens: 2097152,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: false,
          research: true
        },
        description: 'Capacidad máxima de razonamiento para análisis profundos (requiere autorización de pago).'
      }
    ]
  },
  {
    id: 'groq',
    name: 'Groq (LPU Inference)',
    type: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKeyUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_daily',
      renewalFrequency: 'daily_utc',
      resetScheduleDescription: 'Free Tier oficial permanente con ~30 RPM y 14.400 peticiones diarias. Los límites por minuto se restablecen cada 60 segundos; la cuota diaria a las 00:00 UTC.',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://console.groq.com/docs'
    },
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        tier: 'permanent_free',
        contextTokens: 128000,
        rpmLimit: 30,
        rpdLimit: 14400,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'Inferencia ultraveloz (>300 t/s) con excelente coherencia narrativa en español y soporte de herramientas.'
      },
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        tier: 'permanent_free',
        contextTokens: 128000,
        rpmLimit: 30,
        rpdLimit: 14400,
        capabilities: {
          longWriting: false,
          longContext: true,
          deepReasoning: false,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: false
        },
        description: 'Respuesta instantánea para corrección ortotipográfica y detección de inconsistencias menores.'
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B MoE',
        tier: 'permanent_free',
        contextTokens: 32768,
        rpmLimit: 30,
        rpdLimit: 14400,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: false,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'Modelo de mezcla de expertos con rica prosa narrativa y análisis literario.'
      }
    ]
  },
  {
    id: 'cerebras',
    name: 'Cerebras Inference',
    type: 'cerebras',
    baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
    apiKeyUrl: 'https://cloud.cerebras.ai/',
    docsUrl: 'https://inference-docs.cerebras.ai/',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_rate_limited',
      renewalFrequency: 'rolling_minute',
      resetScheduleDescription: 'Free tier oficial con 30 RPM y 60.000 TPM. Los límites se renuevan en ventana deslizante cada minuto y diariamente a las 00:00 UTC.',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://inference-docs.cerebras.ai/'
    },
    defaultModel: 'llama3.1-70b',
    models: [
      {
        id: 'llama3.1-70b',
        name: 'Llama 3.1 70B (Cerebras CS-3)',
        tier: 'permanent_free',
        contextTokens: 8192,
        rpmLimit: 30,
        capabilities: {
          longWriting: true,
          longContext: false,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'La inferencia más rápida del mercado (hasta 1.800 tokens/segundo) en hardware wafer-scale.'
      },
      {
        id: 'llama3.1-8b',
        name: 'Llama 3.1 8B (Cerebras CS-3)',
        tier: 'permanent_free',
        contextTokens: 8192,
        rpmLimit: 30,
        capabilities: {
          longWriting: false,
          longContext: false,
          deepReasoning: false,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: false
        },
        description: 'Generación instantánea para edición de estilo y diálogos breves.'
      }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter (Modelos Libres)',
    type: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKeyUrl: 'https://openrouter.ai/keys',
    docsUrl: 'https://openrouter.ai/docs',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_daily',
      renewalFrequency: 'daily_utc',
      resetScheduleDescription: 'Permite acceder a modelos con sufijo :free con 200 peticiones gratuitas diarias por cuenta registrada, restableciéndose en ventana móvil de 24h.',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://openrouter.ai/docs'
    },
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: [
      {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B Instruct (Free)',
        tier: 'permanent_free',
        contextTokens: 128000,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: false,
          research: true
        },
        description: 'El modelo libre insignia de Meta accesible sin coste a través de OpenRouter.'
      },
      {
        id: 'mistralai/mistral-small-24b-instruct-2501:free',
        name: 'Mistral Small 24B Instruct (Free)',
        tier: 'permanent_free',
        contextTokens: 32768,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'Gran capacidad literaria y sintaxis pulida para prosa narrativa en español.'
      },
      {
        id: 'qwen/qwen-2.5-72b-instruct:free',
        name: 'Qwen 2.5 72B Instruct (Free)',
        tier: 'permanent_free',
        contextTokens: 32768,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: false,
          research: true
        },
        description: 'Excelente para construcción de mundos complejos, mitologías y coherencia estructural.'
      }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Official API',
    type: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    docsUrl: 'https://platform.deepseek.com/api-docs',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'promotional_credits',
      renewalFrequency: 'no_automatic_renewal',
      resetScheduleDescription: 'Otorga saldo promocional gratuito inicial al registrarse. NO se renueva automáticamente al agotarse (los tokens consumidos no se regeneran; requiere recarga económica posterior de bajo coste).',
      creditsExpire: true,
      replenishesAutomatically: false,
      officialDocUrl: 'https://platform.deepseek.com/api-docs'
    },
    defaultModel: 'deepseek-chat',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3 (Chat)',
        tier: 'promotional_credits',
        contextTokens: 64000,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: false,
          research: true
        },
        description: 'Puntero en redacción literaria y coherencia contextual con costo por token extremadamente bajo.'
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek R1 (Reasoning)',
        tier: 'promotional_credits',
        contextTokens: 64000,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: false,
          structuredOutput: false,
          fastSpeed: false,
          research: true
        },
        description: 'Razonamiento profundo con cadena de pensamiento explícita para resolver agujeros de guion y misterios.'
      }
    ]
  },
  {
    id: 'mistral',
    name: 'Mistral AI (La Plateforme)',
    type: 'mistral',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    apiKeyUrl: 'https://console.mistral.ai/api-keys/',
    docsUrl: 'https://docs.mistral.ai/',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_rate_limited',
      renewalFrequency: 'rolling_minute',
      resetScheduleDescription: 'Cuentas con tier de experimentación gratuito oficial (1 RPS). Los límites por segundo se renuevan continuamente sin cuota monetaria fija.',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://docs.mistral.ai/'
    },
    defaultModel: 'mistral-small-latest',
    models: [
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small Latest',
        tier: 'permanent_free',
        contextTokens: 32768,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: true
        },
        description: 'Modelo equilibrado para edición de capítulos, pulido de prosa y diálogos.'
      },
      {
        id: 'codestral-latest',
        name: 'Codestral Latest',
        tier: 'permanent_free',
        contextTokens: 32768,
        capabilities: {
          longWriting: false,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: true,
          research: false
        },
        description: 'Óptimo para estructurar libros técnicos, manuales y validación de formatos markdown/html.'
      }
    ]
  },
  {
    id: 'huggingface',
    name: 'Hugging Face (Inference API)',
    type: 'huggingface',
    baseUrl: 'https://api-inference.huggingface.co/v1/chat/completions',
    apiKeyUrl: 'https://huggingface.co/settings/tokens',
    docsUrl: 'https://huggingface.co/docs/api-inference/',
    isConfigured: false,
    hasCustomKey: false,
    enabled: true,
    status: 'missing_key',
    requestsCountToday: 0,
    tokensConsumedToday: 0,
    quotaPolicy: {
      hasFreeTier: true,
      freeTierType: 'permanent_rate_limited',
      renewalFrequency: 'rolling_hour',
      resetScheduleDescription: 'Tier serverless gratuito oficial para modelos abiertos. El rate limit se renueva automáticamente tras ventanas de enfriamiento horarias.',
      creditsExpire: false,
      replenishesAutomatically: true,
      officialDocUrl: 'https://huggingface.co/docs/api-inference/'
    },
    defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
    models: [
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen 2.5 72B Instruct (HF)',
        tier: 'permanent_free',
        contextTokens: 32768,
        capabilities: {
          longWriting: true,
          longContext: true,
          deepReasoning: true,
          toolCalling: true,
          structuredOutput: true,
          fastSpeed: false,
          research: true
        },
        description: 'Acceso directo a pesos abiertos de Qwen 2.5 en servidores Hugging Face.'
      }
    ]
  }
];

export const DEFAULT_ROUTER_SETTINGS: AIRouterSettings = {
  mode: 'free_first',
  priorityOrder: ['gemini', 'groq', 'cerebras', 'openrouter', 'mistral', 'deepseek', 'huggingface'],
  taskMapping: {
    writing: { provider: 'gemini', model: 'gemini-3.8-flash' },
    research: { provider: 'groq', model: 'llama-3.3-70b-versatile' },
    editing: { provider: 'mistral', model: 'mistral-small-latest' },
    proofreading: { provider: 'groq', model: 'llama-3.1-8b-instant' },
    agentTools: { provider: 'gemini', model: 'gemini-3.8-flash' },
    documentAnalysis: { provider: 'gemini', model: 'gemini-3.8-flash' }
  },
  allowPaidModels: false
};
