import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  BarChart3,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Clock,
  Layers,
  HelpCircle,
  Cpu,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import {
  ProviderState,
  AIRouterSettings,
  FallbackEvent,
  ModelSpec
} from '../types/ai_providers';
import {
  fetchAIProviders,
  saveProviderApiKey,
  testProviderApi,
  updateAIRouterSettings,
  fetchAIFallbackHistory
} from '../services/api';

interface AIProviderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectActiveModel?: (providerId: string, modelId: string) => void;
  onLogActivity?: (level: 'info' | 'warn' | 'success' | 'tool', msg: string) => void;
}

export const AIProviderManager: React.FC<AIProviderManagerProps> = ({
  isOpen,
  onClose,
  onSelectActiveModel,
  onLogActivity
}) => {
  const [activeTab, setActiveTab] = useState<'providers' | 'router' | 'tracker' | 'matrix' | 'fallbacks'>('providers');
  const [providers, setProviders] = useState<ProviderState[]>([]);
  const [settings, setSettings] = useState<AIRouterSettings | null>(null);
  const [fallbackHistory, setFallbackHistory] = useState<FallbackEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // Key editing inputs per provider
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [savingKeyId, setSavingKeyId] = useState<string | null>(null);
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAIProviders();
      setProviders(data.providers || []);
      setSettings(data.settings);
      const history = await fetchAIFallbackHistory();
      setFallbackHistory(history || []);
    } catch (err: any) {
      console.warn('Error loading providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (providerId: string) => {
    const key = editingKeys[providerId] || '';
    setSavingKeyId(providerId);
    try {
      const res = await saveProviderApiKey(providerId, key);
      setProviders(res.providers || []);
      setEditingKeys(prev => ({ ...prev, [providerId]: '' }));
      if (onLogActivity) onLogActivity('success', `API Key guardada para ${providerId}.`);
    } catch (err: any) {
      alert(`Error al guardar clave: ${err.message}`);
    } finally {
      setSavingKeyId(null);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    setTestResult(null);
    try {
      const res = await testProviderApi(providerId);
      setTestResult({ id: providerId, message: res.message, success: res.success });
      if (res.success && onLogActivity) {
        onLogActivity('success', `Test exitoso con ${providerId}: ${res.message}`);
      }
      // reload providers to refresh status
      const data = await fetchAIProviders();
      setProviders(data.providers || []);
    } catch (err: any) {
      setTestResult({ id: providerId, message: err.message, success: false });
    } finally {
      setTestingId(null);
    }
  };

  const handleUpdateMode = async (mode: AIRouterSettings['mode']) => {
    if (!settings) return;
    try {
      const updated = await updateAIRouterSettings({ mode });
      setSettings(updated);
      if (onLogActivity) onLogActivity('info', `Modo de enrutamiento IA cambiado a: ${mode}`);
    } catch (err: any) {
      alert(`Error al actualizar modo: ${err.message}`);
    }
  };

  const handleMovePriority = async (index: number, direction: 'up' | 'down') => {
    if (!settings) return;
    const list = [...settings.priorityOrder];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    try {
      const updated = await updateAIRouterSettings({ priorityOrder: list });
      setSettings(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTaskMappingChange = async (task: keyof AIRouterSettings['taskMapping'], provider: string, model: string) => {
    if (!settings) return;
    const newMapping = {
      ...settings.taskMapping,
      [task]: { provider, model }
    };
    try {
      const updated = await updateAIRouterSettings({ taskMapping: newMapping });
      setSettings(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 select-none">
      <div className="bg-[#0e111a] border border-[#242e42] rounded-xl max-w-4xl w-full flex flex-col max-h-[92dvh] overflow-hidden shadow-2xl text-xs text-slate-200 font-sans">
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-[#131722] border-b border-[#1f283b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-lime-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <span>GESTOR DE PROVEEDORES DE IA</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-lime-950 text-lime-300 border border-lime-800/40 font-mono">
                  Multi-Modelo Autónomo
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fallback automático entre modelos gratuitos con cuotas independientes y tolerancia a fallos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1f283b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-[#0a0c12] border-b border-[#1c2233] overflow-x-auto no-scrollbar flex-nowrap shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'providers'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-lime-400" />
            <span>Proveedores & Claves ({providers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('router')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'router'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enrutador Free-First</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Monitor de Cuotas & Resets</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Matriz de Capacidades</span>
          </button>

          <button
            onClick={() => setActiveTab('fallbacks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
              activeTab === 'fallbacks'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>Historial Fallbacks ({fallbackHistory.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* TAB 1: PROVIDERS & KEYS */}
          {activeTab === 'providers' && (
            <div className="space-y-3">
              <div className="p-3 bg-violet-950/25 border border-violet-800/40 rounded-lg text-[11px] text-violet-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-violet-100 font-semibold">Seguridad y Privacidad de Credenciales</strong>
                  Todas las API keys se almacenan cifradas en el backend del servidor y nunca se exponen en el navegador. Cuando un proveedor agota su cuota de peticiones o rate limit (429), el enrutador conmuta al siguiente proveedor sin interrumpir tu trabajo.
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>{testResult.message}</span>
                  </div>
                  <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {providers.map(p => {
                  const isExpanded = expandedProviderId === p.id;
                  const hasKey = p.isConfigured;

                  return (
                    <div
                      key={p.id}
                      className={`bg-[#121622] border rounded-lg overflow-hidden transition-all ${
                        p.status === 'active'
                          ? 'border-[#27344c]'
                          : p.status === 'rate_limited'
                          ? 'border-amber-700/60'
                          : 'border-[#1e2536]'
                      }`}
                    >
                      {/* Provider Header Card */}
                      <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            p.id === 'gemini'
                              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                              : p.id === 'groq'
                              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                              : p.id === 'cerebras'
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                              : p.id === 'openrouter'
                              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                              : p.id === 'deepseek'
                              ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-100 text-xs sm:text-sm">{p.name}</span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-semibold ${
                                p.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : p.status === 'rate_limited'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                  : p.status === 'error'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {p.status === 'active' ? 'Conectado' : p.status === 'rate_limited' ? 'Rate Limit (Cooldown)' : p.status === 'missing_key' ? 'Requiere Key' : p.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span className="text-lime-400 font-mono">
                                {p.quotaPolicy.freeTierType === 'permanent_daily'
                                  ? 'Free Tier Permanente'
                                  : p.quotaPolicy.freeTierType === 'permanent_rate_limited'
                                  ? 'Free Tier (Por Minuto)'
                                  : 'Créditos Promocionales'}
                              </span>
                              <span>•</span>
                              <span>{p.models.length} modelos disponibles</span>
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {hasKey && (
                            <button
                              onClick={() => handleTestConnection(p.id)}
                              disabled={testingId === p.id}
                              className="px-2.5 py-1 rounded bg-[#1a2130] hover:bg-[#252f44] text-slate-300 border border-[#29354d] text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <RefreshCw className={`w-3 h-3 ${testingId === p.id ? 'animate-spin' : ''}`} />
                              <span>Probar</span>
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedProviderId(isExpanded ? null : p.id)}
                            className="px-2.5 py-1 rounded bg-violet-950/60 hover:bg-violet-900 border border-violet-800/60 text-violet-300 text-[11px] flex items-center gap-1"
                          >
                            <Key className="w-3 h-3" />
                            <span>{hasKey ? 'Configurado' : 'Añadir Key'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Key & Models Panel */}
                      {isExpanded && (
                        <div className="p-3.5 bg-[#0b0e14] border-t border-[#1a2233] space-y-3">
                          {/* Key Input Form */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-slate-400 block font-semibold uppercase">
                              API Key de {p.name}:
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={editingKeys[p.id] !== undefined ? editingKeys[p.id] : ''}
                                onChange={e => setEditingKeys({ ...editingKeys, [p.id]: e.target.value })}
                                placeholder={p.maskedKey ? `Configurada (${p.maskedKey}) — ingresa nueva para cambiar` : 'Pega tu API Key oficial...'}
                                className="flex-1 bg-[#121622] border border-[#263147] rounded px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-violet-500 font-mono"
                              />
                              <button
                                onClick={() => handleSaveKey(p.id)}
                                disabled={savingKeyId === p.id}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium text-xs flex items-center gap-1 shrink-0"
                              >
                                <Check className="w-3 h-3" />
                                <span>{savingKeyId === p.id ? 'Guardando...' : 'Guardar'}</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>Almacenada con cifrado local en el backend.</span>
                              <a
                                href={p.quotaPolicy.officialDocUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                Obtener clave oficial <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>

                          {/* Reset Schedule Info Banner */}
                          <div className="p-2.5 rounded bg-[#121622] border border-[#212b3e] text-[11px] text-slate-300 space-y-1">
                            <div className="font-semibold text-slate-200 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-lime-400" />
                              <span>Ciclo de Renovación de Cuota:</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed">
                              {p.quotaPolicy.resetScheduleDescription}
                            </p>
                          </div>

                          {/* Models list */}
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1.5">
                              Modelos Disponibles de {p.name}:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {p.models.map(m => (
                                <div key={m.id} className="p-2 rounded bg-[#131724] border border-[#20293b] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-200 text-xs font-mono">{m.name}</span>
                                    <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                                      m.tier === 'permanent_free'
                                        ? 'bg-lime-950 text-lime-300 border border-lime-800'
                                        : m.tier === 'promotional_credits'
                                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                                    }`}>
                                      {m.tier.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 line-clamp-2">{m.description}</p>
                                  <div className="text-[9px] text-slate-500 font-mono pt-1 border-t border-[#1a2233]">
                                    Contexto: {m.contextTokens.toLocaleString()} tokens {m.rpmLimit ? `• ${m.rpmLimit} RPM` : ''}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FREE-FIRST ROUTER & PRIORITIES */}
          {activeTab === 'router' && settings && (
            <div className="space-y-4">
              {/* Routing Mode Selector */}
              <div className="bg-[#121622] p-4 rounded-lg border border-[#232d42] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Modo de Enrutamiento Inteligente
                  </span>
                  <span className="text-[10px] text-lime-400 font-mono uppercase bg-lime-950/60 px-2 py-0.5 rounded border border-lime-800/40">
                    Por Defecto: FREE FIRST
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'free_first',
                      title: 'FREE FIRST (Recomendado)',
                      desc: 'Prioriza modelos gratuitos. Si uno agota cuota (429), conmuta automáticamente al siguiente sin perder contexto.'
                    },
                    {
                      id: 'free_only',
                      title: 'FREE ONLY (Estricto)',
                      desc: 'Bloquea estrictamente cualquier petición a modelos de pago. Solo permite cuotas gratuitas.'
                    },
                    {
                      id: 'manual',
                      title: 'MANUAL',
                      desc: 'Tú seleccionas manualmente el proveedor y modelo específicos para cada tarea.'
                    }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleUpdateMode(m.id as any)}
                      className={`p-3 rounded-lg border text-left transition-all space-y-1 ${
                        settings.mode === m.id
                          ? 'bg-violet-950/60 border-violet-500 text-violet-100 shadow-lg shadow-violet-500/10'
                          : 'bg-[#0d1017] border-[#1f283a] text-slate-400 hover:text-slate-200 hover:bg-[#161c28]'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{m.title}</span>
                        {settings.mode === m.id && <Check className="w-3.5 h-3.5 text-lime-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Fallback Cascade Order */}
              <div className="bg-[#121622] p-4 rounded-lg border border-[#232d42] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-lime-400" />
                    Cascada de Fallback Automático (Orden de Prioridad)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Usa las flechas para reordenar la secuencia de conmutación
                  </span>
                </div>

                <div className="space-y-1.5">
                  {settings.priorityOrder.map((provId, idx) => {
                    const p = providers.find(x => x.id === provId);
                    if (!p) return null;

                    return (
                      <div
                        key={provId}
                        className="flex items-center justify-between p-2.5 rounded bg-[#0d1017] border border-[#1f283a]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-violet-950 text-violet-300 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-100 text-xs">{p.name}</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">
                              ({p.defaultModel})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                            p.isConfigured ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {p.isConfigured ? 'Listo' : 'Sin Key'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMovePriority(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-[#1f273b] disabled:opacity-30 text-slate-400"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMovePriority(idx, 'down')}
                              disabled={idx === settings.priorityOrder.length - 1}
                              className="p-1 rounded hover:bg-[#1f273b] disabled:opacity-30 text-slate-400"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Task-Specific Model Routing */}
              <div className="bg-[#121622] p-4 rounded-lg border border-[#232d42] space-y-3">
                <span className="font-semibold text-slate-100 text-sm block">
                  Asignación de Modelos por Tarea Editorial
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: 'writing', label: 'Escritura y Capítulos Creativos', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' },
                    { key: 'research', label: 'Investigación Histórica y Fuentes', defaultP: 'groq', defaultM: 'llama-3.3-70b-versatile' },
                    { key: 'editing', label: 'Edición Literaria y Tensión', defaultP: 'mistral', defaultM: 'mistral-small-latest' },
                    { key: 'proofreading', label: 'Corrección Ortotipográfica Rápida', defaultP: 'groq', defaultM: 'llama-3.1-8b-instant' },
                    { key: 'agentTools', label: 'Agente y Llamada a Herramientas', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' },
                    { key: 'documentAnalysis', label: 'Análisis y Contexto Extenso', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' }
                  ].map(task => {
                    const current = settings.taskMapping[task.key as keyof typeof settings.taskMapping];

                    return (
                      <div key={task.key} className="p-2.5 rounded bg-[#0d1017] border border-[#1f283a] space-y-1.5">
                        <span className="font-semibold text-slate-200 block text-[11px]">{task.label}</span>
                        <div className="flex gap-2">
                          <select
                            value={current?.provider || task.defaultP}
                            onChange={e => {
                              const newP = e.target.value;
                              const prov = providers.find(x => x.id === newP);
                              handleTaskMappingChange(task.key as any, newP, prov?.defaultModel || 'gemini-3.8-flash');
                            }}
                            className="bg-[#141824] border border-[#273247] rounded p-1 text-slate-200 text-xs flex-1"
                          >
                            {providers.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUOTA & RESET TIMETABLE TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/25 border border-amber-800/40 rounded-lg text-[11px] text-amber-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-100 font-semibold">¿Vuelven las cuotas y créditos gratis tras agotarse?</strong>
                  A diferencia de las suscripciones de chat de pago, las APIs distinguen estrictamente entre límites de velocidad (RPM/RPD) que **se restablecen automáticamente a cero cada día o cada minuto**, y saldos promocionales únicos que no se renuevan. Esta tabla detalla las reglas exactas por proveedor.
                </div>
              </div>

              <div className="space-y-3">
                {providers.map(p => (
                  <div key={p.id} className="bg-[#121622] border border-[#232d42] rounded-lg p-3 sm:p-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#1b2333] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{p.name}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                          p.quotaPolicy.replenishesAutomatically
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {p.quotaPolicy.replenishesAutomatically ? '✓ Se renueva automáticamente' : '✗ No se renueva automáticamente'}
                        </span>
                      </div>
                      <a
                        href={p.quotaPolicy.officialDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1"
                      >
                        Docs oficiales de cuota <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Frecuencia de Reset:</span>
                        <span className="text-lime-300 font-medium">
                          {p.quotaPolicy.renewalFrequency === 'daily_utc' ? 'Diario a las 00:00 UTC' : p.quotaPolicy.renewalFrequency === 'rolling_minute' ? 'Ventana por minuto' : 'Por hora'}
                        </span>
                      </div>

                      <div className="p-2 rounded bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Peticiones Hoy:</span>
                        <span className="text-violet-300 font-mono font-bold">{p.requestsCountToday} llamadas</span>
                      </div>

                      <div className="p-2 rounded bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Último Éxito:</span>
                        <span className="text-slate-300 font-mono">
                          {p.lastSuccessfulRequest ? new Date(p.lastSuccessfulRequest).toLocaleTimeString() : 'Sin actividad aún'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed bg-[#0e121b] p-2.5 rounded">
                      <strong className="text-slate-200">Detalle de Cuota:</strong> {p.quotaPolicy.resetScheduleDescription}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CAPABILITY MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-[#20293b] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#121622] text-slate-300 border-b border-[#20293b] text-[10px] uppercase font-mono">
                      <th className="p-2.5">Modelo / Proveedor</th>
                      <th className="p-2.5 text-center">Escritura</th>
                      <th className="p-2.5 text-center">Contexto Extenso</th>
                      <th className="p-2.5 text-center">Razonamiento</th>
                      <th className="p-2.5 text-center">Herramientas (Agent)</th>
                      <th className="p-2.5 text-center">Velocidad</th>
                      <th className="p-2.5 text-center">Tier Gratis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182030] text-slate-300">
                    {providers.flatMap(p => p.models.map(m => (
                      <tr key={m.id} className="hover:bg-[#121620]">
                        <td className="p-2.5 font-mono text-slate-100">
                          <div className="font-semibold text-xs">{m.name}</div>
                          <div className="text-[10px] text-slate-500">{p.name}</div>
                        </td>
                        <td className="p-2.5 text-center">{m.capabilities.longWriting ? '✅' : '➖'}</td>
                        <td className="p-2.5 text-center">{m.capabilities.longContext ? '✅ (>32k)' : '➖'}</td>
                        <td className="p-2.5 text-center">{m.capabilities.deepReasoning ? '✅' : '➖'}</td>
                        <td className="p-2.5 text-center">{m.capabilities.toolCalling ? '✅' : '❌'}</td>
                        <td className="p-2.5 text-center">{m.capabilities.fastSpeed ? '⚡ Ultra' : 'Normal'}</td>
                        <td className="p-2.5 text-center font-mono text-[10px] text-lime-400">
                          {m.tier.replace('_', ' ')}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FALLBACK HISTORY LOG */}
          {activeTab === 'fallbacks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Registro de Conmutaciones Automáticas (Resiliencia ante Límites de Cuota)
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  Total eventos: {fallbackHistory.length}
                </span>
              </div>

              {fallbackHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#10141f] rounded-lg border border-[#1e2536] text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                  No se han producido errores de cuota o caídas de proveedor hasta el momento.
                </div>
              ) : (
                <div className="space-y-2">
                  {fallbackHistory.slice().reverse().map((ev, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#121622] border border-amber-800/40 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-amber-400 font-semibold flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          FALLBACK AUTOMÁTICO
                        </span>
                        <span className="text-slate-500 font-mono">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-200 font-mono text-[11px]">
                        <span className="text-rose-400 font-bold">{ev.fromProvider}</span>
                        <span>➔</span>
                        <span className="text-lime-400 font-bold">{ev.toProvider}</span>
                        <span className="text-slate-500 text-[10px]">({ev.toModel})</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{ev.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131722] border-t border-[#1f283b] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>Enrutador Free-First activo con cascada multi-proveedor</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium transition-colors"
          >
            Cerrar Gestor
          </button>
        </div>
      </div>
    </div>
  );
};
