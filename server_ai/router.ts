import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  ProviderState,
  AIRouterSettings,
  FallbackEvent
} from '../src/types/ai_providers';
import {
  INITIAL_PROVIDERS_CONFIG,
  DEFAULT_ROUTER_SETTINGS
} from './providers_registry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const CREDENTIALS_FILE = path.resolve(DATA_DIR, 'ai_credentials.json');
const SETTINGS_FILE = path.resolve(DATA_DIR, 'ai_router_settings.json');
const STATS_FILE = path.resolve(DATA_DIR, 'ai_provider_stats.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export class AIRouterManager {
  private providers: Map<string, ProviderState> = new Map();
  private credentials: Record<string, string> = {};
  private settings: AIRouterSettings = DEFAULT_ROUTER_SETTINGS;
  private fallbackHistory: FallbackEvent[] = [];
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    this.loadState();
    this.initGemini();
  }

  private loadState() {
    // 1. Initialize providers map from registry
    for (const p of INITIAL_PROVIDERS_CONFIG) {
      this.providers.set(p.id, JSON.parse(JSON.stringify(p)));
    }

    // 2. Load stored credentials securely
    if (fs.existsSync(CREDENTIALS_FILE)) {
      try {
        this.credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
      } catch (e) {
        this.credentials = {};
      }
    }

    // 3. Load stored settings
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        this.settings = { ...DEFAULT_ROUTER_SETTINGS, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) };
      } catch (e) {
        this.settings = DEFAULT_ROUTER_SETTINGS;
      }
    }

    // 4. Load stats
    if (fs.existsSync(STATS_FILE)) {
      try {
        const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        if (stats.history) this.fallbackHistory = stats.history;
        if (stats.providers) {
          for (const [id, st] of Object.entries(stats.providers as Record<string, any>)) {
            const p = this.providers.get(id);
            if (p) {
              p.requestsCountToday = st.requestsCountToday || 0;
              p.tokensConsumedToday = st.tokensConsumedToday || 0;
              p.lastSuccessfulRequest = st.lastSuccessfulRequest;
              p.lastErrorMessage = st.lastErrorMessage;
              p.cooldownUntil = st.cooldownUntil;
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 5. Check environment variables
    this.syncEnvironmentKeys();
  }

  private syncEnvironmentKeys() {
    const envMappings: Record<string, string | undefined> = {
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      cerebras: process.env.CEREBRAS_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      mistral: process.env.MISTRAL_API_KEY,
      huggingface: process.env.HUGGINGFACE_API_KEY
    };

    for (const [providerId, envKey] of Object.entries(envMappings)) {
      const p = this.providers.get(providerId);
      if (!p) continue;

      const customKey = this.credentials[providerId];
      const effectiveKey = customKey || envKey;

      if (effectiveKey && effectiveKey.trim().length > 0) {
        p.isConfigured = true;
        p.hasCustomKey = Boolean(customKey);
        p.status = 'active';
        p.maskedKey = this.maskKey(effectiveKey);
      } else {
        p.isConfigured = false;
        p.hasCustomKey = false;
        p.status = 'missing_key';
        p.maskedKey = undefined;
      }
    }
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 3)}••••••••${key.slice(-4)}`;
  }

  private initGemini() {
    const key = this.getKey('gemini');
    if (key) {
      try {
        this.geminiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (e) {
        console.error('Error instantiating GoogleGenAI:', e);
      }
    }
  }

  public getKey(providerId: string): string | undefined {
    return this.credentials[providerId] || process.env[`${providerId.toUpperCase()}_API_KEY`];
  }

  public setKey(providerId: string, apiKey: string) {
    if (!apiKey || apiKey.trim().length === 0) {
      delete this.credentials[providerId];
    } else {
      this.credentials[providerId] = apiKey.trim();
    }
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(this.credentials, null, 2));
    this.syncEnvironmentKeys();
    if (providerId === 'gemini') this.initGemini();
    this.saveStats();
  }

  public getProvidersList(): ProviderState[] {
    return Array.from(this.providers.values());
  }

  public getSettings(): AIRouterSettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<AIRouterSettings>) {
    this.settings = { ...this.settings, ...updates };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
    return this.settings;
  }

  public getFallbackHistory(): FallbackEvent[] {
    return this.fallbackHistory.slice(-50);
  }

  private saveStats() {
    const providersStats: Record<string, any> = {};
    for (const [id, p] of this.providers.entries()) {
      providersStats[id] = {
        requestsCountToday: p.requestsCountToday,
        tokensConsumedToday: p.tokensConsumedToday,
        lastSuccessfulRequest: p.lastSuccessfulRequest,
        lastErrorMessage: p.lastErrorMessage,
        cooldownUntil: p.cooldownUntil
      };
    }
    fs.writeFileSync(STATS_FILE, JSON.stringify({
      history: this.fallbackHistory.slice(-50),
      providers: providersStats
    }, null, 2));
  }

  // Test provider connection
  public async testProviderConnection(providerId: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const p = this.providers.get(providerId);
    if (!p) return { success: false, message: 'Proveedor no encontrado' };

    const key = this.getKey(providerId);
    if (!key) return { success: false, message: 'Falta la API Key del proveedor' };

    const start = Date.now();
    try {
      if (p.type === 'gemini') {
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: 'Ping test Editorial Code. Responde "OK".',
        });
        const latencyMs = Date.now() - start;
        p.status = 'active';
        p.lastSuccessfulRequest = new Date().toISOString();
        p.lastErrorMessage = undefined;
        this.saveStats();
        return { success: true, message: `Conexión exitosa con Google Gemini (${latencyMs}ms): ${resp.text?.trim()}`, latencyMs };
      } else if (p.baseUrl) {
        // OpenAI-compatible format (Groq, Cerebras, OpenRouter, DeepSeek, Mistral, HuggingFace)
        const modelId = p.defaultModel;
        const res = await fetch(p.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: 'Ping test Editorial Code. Responde "OK".' }],
            max_tokens: 15
          })
        });

        const latencyMs = Date.now() - start;
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        const data: any = await res.json();
        const reply = data.choices?.[0]?.message?.content || 'OK';
        p.status = 'active';
        p.lastSuccessfulRequest = new Date().toISOString();
        p.lastErrorMessage = undefined;
        this.saveStats();
        return { success: true, message: `Conexión exitosa con ${p.name} (${latencyMs}ms): ${reply.trim()}`, latencyMs };
      }

      return { success: false, message: 'Tipo de proveedor no reconocido' };
    } catch (err: any) {
      p.lastErrorMessage = err.message;
      if (err.message.includes('429')) p.status = 'rate_limited';
      else p.status = 'error';
      this.saveStats();
      return { success: false, message: `Fallo de conexión con ${p.name}: ${err.message}` };
    }
  }

  // ---------------- INTELLIGENT FALLBACK EXECUTION ---------------- //
  public async executeWithFallback(params: {
    systemPrompt: string;
    userPrompt: string;
    taskType?: keyof AIRouterSettings['taskMapping'];
    preferredProvider?: string;
    preferredModel?: string;
    projectId: string;
  }): Promise<{
    result: any;
    providerUsed: string;
    modelUsed: string;
    fallbackChain: FallbackEvent[];
  }> {
    const { systemPrompt, userPrompt, taskType = 'agentTools', preferredProvider, preferredModel, projectId } = params;

    // Determine candidate providers sequence
    const candidateSequence: { providerId: string; modelId: string }[] = [];

    if (this.settings.mode === 'manual' && preferredProvider) {
      candidateSequence.push({
        providerId: preferredProvider,
        modelId: preferredModel || this.providers.get(preferredProvider)?.defaultModel || 'gemini-3.8-flash'
      });
    } else {
      // Free first / Custom priority
      // 1. If task mapping has a specific preference and that provider is configured:
      const mapped = this.settings.taskMapping[taskType];
      if (mapped && mapped.provider) {
        candidateSequence.push({ providerId: mapped.provider, modelId: mapped.model });
      }

      // 2. Append all configured and enabled providers in priority order
      for (const provId of this.settings.priorityOrder) {
        if (!candidateSequence.some(c => c.providerId === provId)) {
          const prov = this.providers.get(provId);
          if (prov && prov.enabled) {
            candidateSequence.push({ providerId: provId, modelId: prov.defaultModel });
          }
        }
      }
    }

    const fallbackChain: FallbackEvent[] = [];
    let lastError: Error | null = null;

    // Iterate through candidates
    for (let i = 0; i < candidateSequence.length; i++) {
      const { providerId, modelId } = candidateSequence[i];
      const provider = this.providers.get(providerId);

      // Check if provider is configured
      const key = this.getKey(providerId);
      if (!provider || !key || !provider.enabled) {
        continue;
      }

      // Check if in cooldown
      if (provider.cooldownUntil && new Date(provider.cooldownUntil) > new Date()) {
        continue;
      }

      // Check paid restrictions
      if (this.settings.mode === 'free_only' && !this.settings.allowPaidModels) {
        const modelSpec = provider.models.find(m => m.id === modelId);
        if (modelSpec && modelSpec.tier === 'paid') {
          continue;
        }
      }

      try {
        console.log(`[AIRouter] Attempting generation with provider=${providerId}, model=${modelId}`);
        const parsedJson = await this.callProviderModel({
          provider,
          modelId,
          key,
          systemPrompt,
          userPrompt
        });

        // Success!
        provider.status = 'active';
        provider.lastSuccessfulRequest = new Date().toISOString();
        provider.requestsCountToday = (provider.requestsCountToday || 0) + 1;
        provider.cooldownUntil = undefined;
        provider.lastErrorMessage = undefined;
        this.saveStats();

        return {
          result: parsedJson,
          providerUsed: provider.name,
          modelUsed: modelId,
          fallbackChain
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[AIRouter] Provider ${providerId} failed: ${err.message}`);

        const isQuotaOrRateLimit =
          err.message.includes('429') ||
          err.message.includes('RESOURCE_EXHAUSTED') ||
          err.message.includes('ResourceExhausted') ||
          err.message.includes('503') ||
          err.message.includes('UNAVAILABLE') ||
          err.message.includes('high demand') ||
          err.message.includes('quota') ||
          err.message.includes('Quota') ||
          err.message.includes('rate limit') ||
          err.message.includes('Rate limit');

        if (isQuotaOrRateLimit) {
          provider.status = 'rate_limited';
          // 60-second cooldown
          provider.cooldownUntil = new Date(Date.now() + 60000).toISOString();
        } else {
          provider.status = 'error';
        }
        provider.lastErrorMessage = err.message;
        this.saveStats();

        // Record fallback event if there's a next candidate
        const nextCandidate = candidateSequence[i + 1];
        if (nextCandidate) {
          const nextProv = this.providers.get(nextCandidate.providerId);
          const event: FallbackEvent = {
            timestamp: new Date().toISOString(),
            fromProvider: provider.name,
            toProvider: nextProv?.name || nextCandidate.providerId,
            fromModel: modelId,
            toModel: nextCandidate.modelId,
            reason: isQuotaOrRateLimit
              ? `Límite de peticiones/cuota alcanzado (429/ResourceExhausted)`
              : `Error temporal: ${err.message.slice(0, 80)}`,
            projectId
          };
          fallbackChain.push(event);
          this.fallbackHistory.push(event);
          this.saveStats();
        }
      }
    }

    // If all providers failed or none configured, throw or allow caller to use deterministic engine
    throw new Error(
      lastError
        ? `Todos los proveedores de IA fallaron. Último error (${lastError.message}).`
        : 'No hay proveedores de IA configurados con API Key activa.'
    );
  }

  private async callProviderModel(args: {
    provider: ProviderState;
    modelId: string;
    key: string;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<any> {
    const { provider, modelId, key, systemPrompt, userPrompt } = args;

    if (provider.type === 'gemini') {
      const ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      const response = await ai.models.generateContent({
        model: modelId || 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });

      const raw = response.text || '{}';
      return JSON.parse(raw);
    } else if (provider.baseUrl) {
      // OpenAI compatible chat completions
      const res = await fetch(provider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: `${systemPrompt}\n\nIMPORTANTE: Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido según las instrucciones sin formato markdown adicional.` },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data: any = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      // Clean up markdown block if model wrapped in ```json
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    }

    throw new Error(`Proveedor ${provider.name} no soportado.`);
  }
}

export const aiRouter = new AIRouterManager();
