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
  X,
  Eye,
  EyeOff,
  Power,
  Globe,
  BookOpen,
  Trash2,
  ShieldCheck,
  Activity,
  Server,
  Lock,
  FileCode,
  Info
} from 'lucide-react';
import {
  ProviderState,
  AIRouterSettings,
  FallbackEvent,
  ModelSpec,
  DeploymentDiagnostics
} from '../types/ai_providers';
import {
  fetchAIProviders,
  saveProviderApiKey,
  testProviderApi,
  updateAIRouterSettings,
  updateProviderConfig,
  fetchAIFallbackHistory,
  fetchAIDiagnostics
} from '../services/api';
import {
  PROVIDER_OFFICIAL_LINKS,
  getDefaultProviders
} from '../shared/ai_providers_registry';

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
  const [activeTab, setActiveTab] = useState<'providers' | 'router' | 'tracker' | 'matrix' | 'fallbacks' | 'diagnostics'>('providers');
  const [providers, setProviders] = useState<ProviderState[]>(getDefaultProviders());
  const [settings, setSettings] = useState<AIRouterSettings | null>(null);
  const [fallbackHistory, setFallbackHistory] = useState<FallbackEvent[]>([]);
  const [diagnostics, setDiagnostics] = useState<DeploymentDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('gemini');

  // Key editing & viewing state
  const [editingKeys, setEditingKeys] = useState<Record<string, string>>({});
  const [showKeyText, setShowKeyText] = useState<Record<string, boolean>>({});
  const [savingKeyId, setSavingKeyId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean; latencyMs?: number } | null>(null);
  const [updatingConfigId, setUpdatingConfigId] = useState<string | null>(null);

  // UTC Countdown calculation for live reset timetable
  const [utcCountdown, setUtcCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextUtcMidnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
      ));
      const diffMs = nextUtcMidnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setUtcCountdown(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAIProviders();
      const provList: ProviderState[] = (data.providers && data.providers.length > 0)
        ? data.providers
        : getDefaultProviders();
      setProviders(provList);
      setSettings(data.settings);
      if (provList.length > 0 && (!selectedProviderId || !provList.some(p => p.id === selectedProviderId))) {
        setSelectedProviderId(provList[0].id);
      }
      const history = await fetchAIFallbackHistory();
      setFallbackHistory(history || []);

      const diag = await fetchAIDiagnostics();
      setDiagnostics(diag);
    } catch (err: any) {
      console.warn('Error loading providers, applying portable fallback:', err);
      setProviders(getDefaultProviders());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async (providerId: string) => {
    const key = editingKeys[providerId] || '';
    setSavingKeyId(providerId);
    setSaveSuccessId(null);
    try {
      const res = await saveProviderApiKey(providerId, key);
      if (res.providers && res.providers.length > 0) {
        setProviders(res.providers);
      }
      setEditingKeys(prev => ({ ...prev, [providerId]: '' }));
      setSaveSuccessId(providerId);
      setTimeout(() => setSaveSuccessId(null), 3500);
      if (onLogActivity) onLogActivity('success', `API Key guardada con éxito para ${providerId.toUpperCase()}.`);

      // Refresh diagnostics
      const diag = await fetchAIDiagnostics();
      setDiagnostics(diag);
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
      setTestResult({
        id: providerId,
        message: res.message,
        success: res.success,
        latencyMs: res.latencyMs
      });
      if (res.success && onLogActivity) {
        onLogActivity('success', `Test exitoso con ${providerId.toUpperCase()}: ${res.message}`);
      }
      // Reload providers to refresh status
      const data = await fetchAIProviders();
      if (data.providers && data.providers.length > 0) {
        setProviders(data.providers);
      }
    } catch (err: any) {
      setTestResult({
        id: providerId,
        message: err.message,
        success: false
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleProviderEnabled = async (providerId: string, currentEnabled: boolean) => {
    setUpdatingConfigId(providerId);
    try {
      const res = await updateProviderConfig(providerId, { enabled: !currentEnabled });
      if (res.providers && res.providers.length > 0) setProviders(res.providers);
      if (onLogActivity) {
        onLogActivity('info', `Proveedor ${providerId.toUpperCase()} ${!currentEnabled ? 'habilitado' : 'deshabilitado'}.`);
      }
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    } finally {
      setUpdatingConfigId(null);
    }
  };

  const handleSetDefaultModel = async (providerId: string, modelId: string) => {
    setUpdatingConfigId(providerId);
    try {
      const res = await updateProviderConfig(providerId, { defaultModel: modelId });
      if (res.providers && res.providers.length > 0) setProviders(res.providers);
      if (onSelectActiveModel) {
        onSelectActiveModel(providerId, modelId);
      }
      if (onLogActivity) {
        onLogActivity('success', `Modelo predeterminado de ${providerId.toUpperCase()} fijado en: ${modelId}`);
      }
    } catch (err: any) {
      alert(`Error al fijar modelo predeterminado: ${err.message}`);
    } finally {
      setUpdatingConfigId(null);
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

  const currentProvider = providers.find(p => p.id === selectedProviderId) || providers[0];
  const officialInfo = selectedProviderId ? (PROVIDER_OFFICIAL_LINKS[selectedProviderId] || PROVIDER_OFFICIAL_LINKS.gemini) : PROVIDER_OFFICIAL_LINKS.gemini;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 select-none">
      <div className="bg-[#0d1017] border border-[#222c3f] rounded-2xl max-w-6xl w-full flex flex-col h-[94vh] sm:h-[88vh] overflow-hidden shadow-2xl text-xs text-slate-200 font-sans">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-[#111520] border-b border-[#1c2436] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-lime-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base tracking-wide">
                  GESTOR DE PROVEEDORES DE IA
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-lime-950 text-lime-300 border border-lime-800/50 font-mono font-semibold">
                  Multi-Modelo Autónomo • 8 Proveedores Portables
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  <Clock className="w-3 h-3" />
                  Próximo Reset UTC: <span className="font-mono font-bold text-lime-400">{utcCountdown}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 hidden xs:block">
                Arquitectura portable para Google AI Studio, GitHub, Vercel y Cloud Run: 8 proveedores oficiales con conmutación autónoma y tolerancia a fallos.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              title="Recargar estado y diagnóstico"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1c2436] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1c2436] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-[#090b10] border-b border-[#1b2233] overflow-x-auto no-scrollbar flex-nowrap shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'providers'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-lime-400" />
            <span>Proveedores & Claves ({providers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'diagnostics'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Diagnóstico de Despliegue</span>
            {diagnostics && (
              <span className={`w-2 h-2 rounded-full ${diagnostics.backendConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('router')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'router'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Enrutador Free-First</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'tracker'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Monitor de Cuotas & Resets</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'matrix'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Matriz de Capacidades</span>
          </button>

          <button
            onClick={() => setActiveTab('fallbacks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'fallbacks'
                ? 'bg-violet-950/80 text-violet-200 font-semibold border border-violet-700/60 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151924]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
            <span>Historial Fallbacks ({fallbackHistory.length})</span>
          </button>
        </div>

        {/* Global Feedback Banner (Tests / Alerts) */}
        {testResult && (
          <div className={`mx-3 sm:mx-4 mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 shrink-0 ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="truncate">
                <strong className="mr-1">{testResult.success ? 'Conexión Exitosa' : 'Fallo de Conexión'}:</strong>
                <span>{testResult.message}</span>
                {testResult.latencyMs && (
                  <span className="ml-2 font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-lime-300 border border-lime-800/40">
                    {testResult.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200 p-1 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB 1: PROVIDERS & KEYS (Full Desktop Split-Pane + Mobile Selector) */}
        {activeTab === 'providers' && (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
            
            {/* Mobile Horizontal Provider Bar (< 1024px) */}
            <div className="lg:hidden p-2 bg-[#090c13] border-b border-[#1b2334] overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {providers.map(p => {
                const isSelected = p.id === selectedProviderId;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProviderId(p.id);
                      setTestResult(null);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border shrink-0 ${
                      isSelected
                        ? 'bg-violet-950 border-violet-500 text-white font-semibold shadow-xs'
                        : 'bg-[#121622] border-[#20293b] text-slate-300 hover:bg-[#181d2c]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: p.status === 'active' ? '#34d399' : p.status === 'rate_limited' ? '#f59e0b' : p.status === 'error' ? '#f43f5e' : '#94a3b8'
                    }} />
                    <span>{p.name.split(' ')[0]}</span>
                    {p.isConfigured && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Desktop Left Sidebar: Provider Master List (>= 1024px) */}
            <div className="hidden lg:flex w-72 xl:w-80 border-r border-[#1e2638] bg-[#090b10] flex-col overflow-y-auto shrink-0 select-none">
              <div className="p-3 border-b border-[#1b2233] bg-[#0d1017]">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Proveedores Integrados ({providers.length})
                </span>
                <span className="text-[10px] text-slate-500">
                  Selecciona uno para configurar credenciales y modelos
                </span>
              </div>

              <div className="p-2 space-y-1.5 flex-1">
                {providers.map(p => {
                  const isSelected = p.id === selectedProviderId;
                  const links = PROVIDER_OFFICIAL_LINKS[p.id] || PROVIDER_OFFICIAL_LINKS.gemini;

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProviderId(p.id);
                        setTestResult(null);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-violet-950/60 border-violet-500 text-white shadow-md shadow-violet-900/20'
                          : 'bg-[#10141f] border-[#1c2436] text-slate-300 hover:bg-[#161c2b] hover:border-[#2a364e]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Logo avatar */}
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${links.badgeColor} flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs`}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs truncate text-slate-100">{p.name}</span>
                            {!p.enabled && (
                              <span className="text-[8px] bg-rose-950 text-rose-300 px-1 rounded border border-rose-800">
                                Off
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-mono text-lime-400 truncate max-w-[130px]">
                              {p.defaultModel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator badge */}
                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold ${
                          p.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : p.status === 'rate_limited'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60 animate-pulse'
                            : p.status === 'error'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {p.status === 'active' ? 'Conectado' : p.status === 'rate_limited' ? 'Rate Limit' : p.status === 'missing_key' ? 'Sin Key' : p.status}
                        </span>
                        {p.isConfigured && (
                          <span className="text-[8px] text-emerald-400 font-mono flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Clave lista
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Free-First policy banner in desktop sidebar */}
              <div className="p-3 m-2 rounded-xl bg-violet-950/30 border border-violet-800/40 text-[10px] text-slate-400 space-y-1">
                <div className="text-violet-200 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                  <span>Enrutador Free-First</span>
                </div>
                <p className="leading-relaxed">
                  Si un modelo satura su cuota (HTTP 429), el motor conmuta automáticamente al siguiente proveedor activo sin perder tu contexto.
                </p>
              </div>
            </div>

            {/* Main Detail Configuration View (Selected Provider) */}
            {currentProvider && (
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#0d1017]">
                
                {/* 1. Header Card with Official Links and Enable/Disable Switch */}
                <div className="p-4 rounded-xl bg-[#121623] border border-[#222c40] space-y-3 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${officialInfo.badgeColor} flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-lg`}>
                        {currentProvider.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-base font-bold text-slate-100">{currentProvider.name}</h2>
                          <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-mono font-bold ${
                            currentProvider.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : currentProvider.status === 'rate_limited'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                              : currentProvider.status === 'error'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {currentProvider.status === 'active' ? '● Conectado y Activo' : currentProvider.status === 'rate_limited' ? '● Rate Limit (En Cooldown)' : currentProvider.status === 'missing_key' ? '○ Clave Requerida' : currentProvider.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {officialInfo.guide}
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Provider in Router Toggle */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => handleToggleProviderEnabled(currentProvider.id, currentProvider.enabled)}
                        disabled={updatingConfigId === currentProvider.id}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          currentProvider.enabled
                            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                        }`}
                        title="Habilitar o inhabilitar este proveedor dentro de la cascada de conmutación automática"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{currentProvider.enabled ? 'Habilitado en Cascada' : 'Deshabilitado'}</span>
                      </button>
                    </div>
                  </div>

                  {/* OFFICIAL DIRECT HYPERLINKS (Get API Key & Official Docs) */}
                  <div className="pt-2 border-t border-[#1c2438] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Acceso oficial para generar credenciales oficiales:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct API Key creation link */}
                      <a
                        href={officialInfo.apiKeyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors group cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        <span>Obtener API Key Oficial</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>

                      {/* Official API Documentation Link */}
                      <a
                        href={officialInfo.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#19202f] hover:bg-[#222c3f] border border-[#2b374f] text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Documentación Oficial</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 2. API Key Configuration Card */}
                <div className="p-4 rounded-xl bg-[#121623] border border-[#222c40] space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-violet-400" />
                      Configuración de Clave API (Almacenamiento Cifrado en Backend y Cache Portable)
                    </span>
                    {currentProvider.isConfigured && (
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Clave Activa: {currentProvider.maskedKey}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 block font-medium">
                      Introduce tu clave oficial para <strong className="text-slate-200">{currentProvider.name}</strong>:
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeyText[currentProvider.id] ? 'text' : 'password'}
                          value={editingKeys[currentProvider.id] !== undefined ? editingKeys[currentProvider.id] : ''}
                          onChange={e => setEditingKeys({ ...editingKeys, [currentProvider.id]: e.target.value })}
                          placeholder={
                            currentProvider.maskedKey
                              ? `Configurada (${currentProvider.maskedKey}) — escribe aquí para reemplazarla`
                              : `Pega tu API Key de ${currentProvider.name}...`
                          }
                          className="w-full bg-[#0a0d14] border border-[#26334a] rounded-lg px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-violet-500 font-mono pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeyText(prev => ({ ...prev, [currentProvider.id]: !prev[currentProvider.id] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                          title={showKeyText[currentProvider.id] ? 'Ocultar clave' : 'Mostrar clave'}
                        >
                          {showKeyText[currentProvider.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Save Button */}
                        <button
                          onClick={() => handleSaveKey(currentProvider.id)}
                          disabled={savingKeyId === currentProvider.id}
                          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          {savingKeyId === currentProvider.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : saveSuccessId === currentProvider.id ? (
                            <Check className="w-3.5 h-3.5 text-lime-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>{savingKeyId === currentProvider.id ? 'Guardando...' : saveSuccessId === currentProvider.id ? '¡Guardada!' : 'Guardar Clave'}</span>
                        </button>

                        {/* Test Connection Button */}
                        <button
                          onClick={() => handleTestConnection(currentProvider.id)}
                          disabled={testingId === currentProvider.id || (!currentProvider.isConfigured && !editingKeys[currentProvider.id])}
                          className="px-3.5 py-2 rounded-lg bg-[#192233] hover:bg-[#232f47] disabled:opacity-40 text-slate-200 border border-[#2b3a54] text-xs flex items-center gap-1.5 transition-colors"
                          title="Realiza una llamada ping real con la API para verificar latencia y validez de la clave"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${testingId === currentProvider.id ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>{testingId === currentProvider.id ? 'Probando...' : 'Probar Conexión'}</span>
                        </button>

                        {/* Clear / Edit option */}
                        {currentProvider.isConfigured && (
                          <button
                            onClick={() => {
                              setEditingKeys(prev => ({ ...prev, [currentProvider.id]: '' }));
                              handleSaveKey(currentProvider.id);
                            }}
                            className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 transition-colors"
                            title="Eliminar clave personalizada y volver a estado por defecto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>✓ Cifrada en el backend (y respaldada en navegador para garantizar portabilidad en GitHub/Vercel).</span>
                      <span className="font-mono text-slate-400">Endpoint: {currentProvider.baseUrl || 'SDK Nativo'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Available Models and Default Model Selection */}
                <div className="p-4 rounded-xl bg-[#121623] border border-[#222c40] space-y-3 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-semibold text-slate-100 text-xs sm:text-sm block">
                        Modelos Disponibles de {currentProvider.name} ({currentProvider.models.length})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Selecciona el modelo predeterminado para este proveedor o actívalo para el agente editorial.
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 bg-[#0a0d14] px-2.5 py-1 rounded border border-[#1f293d]">
                      Predeterminado Actual: <strong className="text-lime-300 font-bold">{currentProvider.defaultModel}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentProvider.models.map(m => {
                      const isDefault = currentProvider.defaultModel === m.id;

                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                            isDefault
                              ? 'bg-violet-950/40 border-violet-500 shadow-sm'
                              : 'bg-[#0d1017] border-[#1e2638] hover:border-[#2d3a54]'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-xs text-slate-100 block font-mono">
                                  {m.name}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block">
                                  ID: {m.id}
                                </span>
                              </div>

                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                m.tier === 'permanent_free'
                                  ? 'bg-lime-950 text-lime-300 border border-lime-800'
                                  : m.tier === 'promotional_credits'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {m.tier.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {m.description}
                            </p>

                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1 border-t border-[#1a2233]">
                              <span>Contexto: <strong className="text-slate-200">{(m.contextTokens / 1000).toFixed(0)}k</strong> tokens</span>
                              {m.rpmLimit && <span>• Límite: <strong className="text-slate-200">{m.rpmLimit} RPM</strong></span>}
                              {m.rpdLimit && <span>• <strong className="text-slate-200">{m.rpdLimit.toLocaleString()} RPD</strong></span>}
                            </div>
                          </div>

                          {/* Model Action Buttons */}
                          <div className="pt-2 border-t border-[#1a2233] flex items-center justify-between gap-2">
                            {isDefault ? (
                              <span className="text-[10px] text-lime-400 font-semibold flex items-center gap-1 font-mono">
                                <Check className="w-3.5 h-3.5" /> Predeterminado
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultModel(currentProvider.id, m.id)}
                                disabled={updatingConfigId === currentProvider.id}
                                className="px-2.5 py-1 rounded bg-[#182030] hover:bg-[#222d44] border border-[#28364f] text-slate-300 text-[10px] font-medium transition-colors"
                              >
                                Fijar como Predeterminado
                              </button>
                            )}

                            {onSelectActiveModel && (
                              <button
                                onClick={() => {
                                  onSelectActiveModel(currentProvider.id, m.id);
                                  if (onLogActivity) onLogActivity('info', `Modelo ${m.id} activado en la sesión de trabajo.`);
                                }}
                                className="px-2.5 py-1 rounded bg-violet-600/80 hover:bg-violet-600 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Usar con Agente Ahora</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Quota, Usage Limits & Reset Timetable Breakdown */}
                <div className="p-4 rounded-xl bg-[#121623] border border-[#222c40] space-y-3 shadow-md">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Cuotas, Límites de Petición y Política de Renovación
                    </span>
                    <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${
                      currentProvider.quotaPolicy.replenishesAutomatically
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {currentProvider.quotaPolicy.replenishesAutomatically ? '✓ Se restablece automáticamente' : '✗ Saldo promocional fijo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#1b2436]">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Tipo de Cuota:</span>
                      <span className="text-lime-300 font-semibold">
                        {currentProvider.quotaPolicy.freeTierType === 'permanent_daily'
                          ? 'Free Tier Diario'
                          : currentProvider.quotaPolicy.freeTierType === 'permanent_rate_limited'
                          ? 'Ventana por Minuto'
                          : 'Créditos Promocionales'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#1b2436]">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Próximo Reset UTC:</span>
                      <span className="text-cyan-300 font-mono font-bold">
                        {utcCountdown}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#1b2436]">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Peticiones Hoy:</span>
                      <span className="text-violet-300 font-mono font-bold">
                        {currentProvider.requestsCountToday} llamadas
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#1b2436]">
                      <span className="text-slate-500 block text-[10px] uppercase font-mono">Último Éxito:</span>
                      <span className="text-slate-300 font-mono">
                        {currentProvider.lastSuccessfulRequest ? new Date(currentProvider.lastSuccessfulRequest).toLocaleTimeString() : 'Sin actividad aún'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1c2438] text-[11px] text-slate-300 space-y-1">
                    <span className="text-slate-400 font-semibold block">Regla Oficial de Reinicio de Cuota:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {currentProvider.quotaPolicy.resetScheduleDescription}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB: DEPLOYMENT DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#0d1017]">
            {/* Diagnostics Header Banner */}
            <div className="p-4 rounded-xl bg-[#121623] border border-[#222c40] space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                      <span>PANEL DE DIAGNÓSTICO DE DESPLIEGUE</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        diagnostics?.backendConnected
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {diagnostics?.backendConnected ? 'Backend Activo & Conectado' : 'Modo Standalone Portable'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Verificación en tiempo real del estado de los proveedores, variables de entorno y compatibilidad con GitHub, Vercel y Cloud Run.
                    </p>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    setIsLoading(true);
                    const d = await fetchAIDiagnostics();
                    setDiagnostics(d);
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#192233] hover:bg-[#232f47] border border-[#2b3a54] text-slate-200 text-xs flex items-center gap-1.5 self-start sm:self-center transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Re-evaluar Entorno</span>
                </button>
              </div>

              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#1c2438]">
                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1b2436] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Entorno Detectado:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-slate-200 capitalize">
                      {diagnostics?.environment || 'Production'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {diagnostics?.deploymentPlatform || 'Node.js Express'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1b2436] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Registro Central:</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                    <span className="font-bold text-lime-300">
                      {diagnostics?.totalRegisteredProviders || providers.length} Proveedores
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    100% Portables en Desktop & Mobile
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1b2436] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Claves Configuradas:</span>
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-violet-400" />
                    <span className="font-bold text-violet-300">
                      {diagnostics?.configuredProvidersCount ?? providers.filter(p => p.isConfigured).length} de {diagnostics?.totalRegisteredProviders || providers.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {providers.filter(p => p.isConfigured).length > 0 ? 'Listas para inferencia' : 'Requieren ingreso de clave'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1b2436] space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-mono block">Estado de Conexión:</span>
                  <div className="flex items-center gap-1.5">
                    {diagnostics?.backendConnected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span className={`font-bold ${diagnostics?.backendConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {diagnostics?.backendConnected ? 'API OK (200)' : 'Modo Standalone'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {diagnostics?.backendConnected ? 'Proxy seguro activo' : 'Cache local activa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Environment Variables Checklist (Safe inspection without exposing secrets) */}
            <div className="p-4 rounded-xl bg-[#121622] border border-[#232d42] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    Auditoría de Variables de Entorno del Servidor
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Las claves configuradas en el entorno se detectan de forma segura sin revelar los valores secretos.
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Auditoría: {new Date(diagnostics?.diagnosticTimestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { name: 'GEMINI_API_KEY', provider: 'Google Gemini' },
                  { name: 'GROQ_API_KEY', provider: 'Groq LPU' },
                  { name: 'CEREBRAS_API_KEY', provider: 'Cerebras' },
                  { name: 'OPENROUTER_API_KEY', provider: 'OpenRouter' },
                  { name: 'DEEPSEEK_API_KEY', provider: 'DeepSeek' },
                  { name: 'MISTRAL_API_KEY', provider: 'Mistral AI' },
                  { name: 'QWEN_API_KEY', provider: 'Qwen DashScope' },
                  { name: 'HUGGINGFACE_API_KEY', provider: 'Hugging Face' }
                ].map(env => {
                  const isDetected = diagnostics?.detectedEnvironmentVariables.includes(env.name);
                  const prov = providers.find(p => p.id === env.provider.toLowerCase().split(' ')[0]) || providers.find(p => env.name.toLowerCase().includes(p.id));
                  const hasCustom = prov?.hasCustomKey;

                  return (
                    <div
                      key={env.name}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        isDetected || hasCustom
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                          : 'bg-[#0d1017] border-[#1e2538] text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold truncate">{env.name}</span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold ${
                          isDetected || hasCustom
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isDetected ? 'En Servidor' : hasCustom ? 'Web Key' : 'No Definida'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{env.provider}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deployment Recommendations & Troubleshooting Guide */}
            <div className="p-4 rounded-xl bg-[#121622] border border-[#232d42] space-y-3">
              <h4 className="font-semibold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-violet-400" />
                Guía de Despliegue en Producción (GitHub / Vercel / Cloud Run / Docker)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-300">
                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1d2638] space-y-2">
                  <div className="flex items-center gap-1.5 text-violet-300 font-bold">
                    <span>1. Despliegue en Vercel (Automático con GitHub)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Conecta tu repositorio de GitHub a tu cuenta de Vercel.</li>
                    <li>Vercel construirá automáticamente el frontend Vite mediante <code className="text-lime-300">npm run build</code>.</li>
                    <li>Ve a <strong>Project Settings &gt; Environment Variables</strong> y añade tus claves (ej. <code className="text-cyan-300">GEMINI_API_KEY</code>, <code className="text-cyan-300">GROQ_API_KEY</code>).</li>
                    <li>Las rutas <code className="text-violet-300">/api/*</code> están configuradas en el archivo <code className="text-lime-300">vercel.json</code>.</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-[#0a0d14] border border-[#1d2638] space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <span>2. Despliegue en Docker, Cloud Run o Railway</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>El comando de arranque de producción es <code className="text-lime-300">npm start</code> (ejecuta el servidor Express con Vite integrado).</li>
                    <li>El puerto se toma dinámicamente de <code className="text-cyan-300">process.env.PORT</code> o por defecto en el puerto 3000.</li>
                    <li>Copia el archivo <code className="text-lime-300">.env.example</code> a <code className="text-lime-300">.env</code> o inyecta las variables en tu orquestador.</li>
                    <li>Los 8 proveedores cargan del registro compartido incluso si no configuras claves en el servidor.</li>
                  </ul>
                </div>
              </div>

              {diagnostics?.warnings && diagnostics.warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-800/40 text-amber-200 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Avisos de Configuración:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 text-[11px]">
                    {diagnostics.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: FREE-FIRST ROUTER & PRIORITIES */}
        {activeTab === 'router' && settings && (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#0d1017]">
            {/* Routing Mode Selector */}
            <div className="bg-[#121622] p-4 rounded-xl border border-[#232d42] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
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
                    desc: 'Prioriza modelos gratuitos. Si uno agota cuota (429), conmuta automáticamente al siguiente proveedor activo sin perder memoria narrativa.'
                  },
                  {
                    id: 'free_only',
                    title: 'FREE ONLY (Estricto)',
                    desc: 'Bloquea estrictamente cualquier petición a modelos o niveles de pago. Trabaja exclusivamente con cuotas gratuitas.'
                  },
                  {
                    id: 'manual',
                    title: 'MANUAL',
                    desc: 'El autor selecciona directamente el proveedor y modelo específicos para cada tarea sin conmutación automática.'
                  }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleUpdateMode(m.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
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
            <div className="bg-[#121622] p-4 rounded-xl border border-[#232d42] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-lime-400" />
                  Cascada de Fallback Automático (Orden de Conmutación)
                </span>
                <span className="text-[10px] text-slate-400">
                  Usa las flechas para reordenar la secuencia de proveedores en caso de límite de cuota
                </span>
              </div>

              <div className="space-y-1.5">
                {settings.priorityOrder.map((provId, idx) => {
                  const p = providers.find(x => x.id === provId);
                  if (!p) return null;

                  return (
                    <div
                      key={provId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1017] border border-[#1f283a]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-violet-950 text-violet-300 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-100 text-xs">{p.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2 font-mono">
                            (Predeterminado: {p.defaultModel})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${
                          p.isConfigured ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {p.isConfigured ? 'Listo' : 'Sin Clave'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMovePriority(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-[#1f273b] disabled:opacity-20 text-slate-300"
                            title="Subir prioridad"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => handleMovePriority(idx, 'down')}
                            disabled={idx === settings.priorityOrder.length - 1}
                            className="p-1 rounded hover:bg-[#1f273b] disabled:opacity-20 text-slate-300"
                            title="Bajar prioridad"
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
            <div className="bg-[#121622] p-4 rounded-xl border border-[#232d42] space-y-3">
              <span className="font-semibold text-slate-100 text-sm block">
                Asignación de Modelos por Tarea Editorial Especializada
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'writing', label: 'Escritura y Capítulos Creativos', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' },
                  { key: 'research', label: 'Investigación Histórica y Fuentes', defaultP: 'groq', defaultM: 'openai/gpt-oss-20b' },
                  { key: 'editing', label: 'Edición Literaria y Tensión', defaultP: 'mistral', defaultM: 'mistral-small-latest' },
                  { key: 'proofreading', label: 'Corrección Ortotipográfica Rápida', defaultP: 'groq', defaultM: 'openai/gpt-oss-20b' },
                  { key: 'agentTools', label: 'Agente y Ejecución de Herramientas', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' },
                  { key: 'documentAnalysis', label: 'Análisis y Contexto Extenso (>32k)', defaultP: 'gemini', defaultM: 'gemini-3.8-flash' }
                ].map(task => {
                  const current = settings.taskMapping[task.key as keyof typeof settings.taskMapping];

                  return (
                    <div key={task.key} className="p-3 rounded-xl bg-[#0d1017] border border-[#1f283a] space-y-1.5">
                      <span className="font-semibold text-slate-200 block text-[11px]">{task.label}</span>
                      <div className="flex gap-2">
                        <select
                          value={current?.provider || task.defaultP}
                          onChange={e => {
                            const newP = e.target.value;
                            const prov = providers.find(x => x.id === newP);
                            handleTaskMappingChange(task.key as any, newP, prov?.defaultModel || 'gemini-3.8-flash');
                          }}
                          className="bg-[#141824] border border-[#273247] rounded-lg p-1.5 text-slate-200 text-xs flex-1 font-sans"
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
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#0d1017]">
            <div className="p-3 bg-amber-950/25 border border-amber-800/40 rounded-xl text-[11px] text-amber-200 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-100 font-semibold">¿Vuelven las cuotas y créditos gratis tras agotarse?</strong>
                A diferencia de las suscripciones de chat de pago, las APIs distinguen estrictamente entre límites de velocidad (RPM/RPD) que <strong className="text-white">se restablecen automáticamente a cero cada día a las 00:00 UTC o cada minuto</strong>, y saldos promocionales únicos que no se renuevan. Esta tabla detalla las reglas exactas por proveedor.
              </div>
            </div>

            <div className="space-y-3">
              {providers.map(p => {
                const links = PROVIDER_OFFICIAL_LINKS[p.id] || PROVIDER_OFFICIAL_LINKS.gemini;

                return (
                  <div key={p.id} className="bg-[#121622] border border-[#232d42] rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2333] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${links.badgeColor} flex items-center justify-center font-bold text-xs text-white`}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-100 text-sm">{p.name}</span>
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${
                          p.quotaPolicy.replenishesAutomatically
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {p.quotaPolicy.replenishesAutomatically ? '✓ Se renueva automáticamente' : '✗ Saldo promocional fijo'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={links.apiKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-300 hover:underline text-[10px] flex items-center gap-1 font-mono"
                        >
                          Obtener Key <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <span className="text-slate-600">•</span>
                        <a
                          href={links.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 font-mono"
                        >
                          Docs oficiales <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Frecuencia de Reset:</span>
                        <span className="text-lime-300 font-semibold">
                          {p.quotaPolicy.renewalFrequency === 'daily_utc' ? 'Diario a las 00:00 UTC' : p.quotaPolicy.renewalFrequency === 'rolling_minute' ? 'Ventana por minuto' : 'Por hora'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Cuenta Regresiva:</span>
                        <span className="text-cyan-300 font-mono font-bold">{utcCountdown}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Peticiones Hoy:</span>
                        <span className="text-violet-300 font-mono font-bold">{p.requestsCountToday} llamadas</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0b0e14] border border-[#1b2233]">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono">Último Éxito:</span>
                        <span className="text-slate-300 font-mono">
                          {p.lastSuccessfulRequest ? new Date(p.lastSuccessfulRequest).toLocaleTimeString() : 'Sin actividad aún'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed bg-[#0e121b] p-3 rounded-lg border border-[#192234]">
                      <strong className="text-slate-200">Detalle de Cuota:</strong> {p.quotaPolicy.resetScheduleDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CAPABILITY MATRIX */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 bg-[#0d1017]">
            <div className="overflow-x-auto border border-[#20293b] rounded-xl shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#121622] text-slate-300 border-b border-[#20293b] text-[10px] uppercase font-mono">
                    <th className="p-3">Modelo / Proveedor</th>
                    <th className="p-3 text-center">Escritura</th>
                    <th className="p-3 text-center">Contexto Extenso</th>
                    <th className="p-3 text-center">Razonamiento</th>
                    <th className="p-3 text-center">Herramientas (Agent)</th>
                    <th className="p-3 text-center">Velocidad</th>
                    <th className="p-3 text-center">Tier Gratis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] text-slate-300">
                  {providers.flatMap(p => p.models.map(m => (
                    <tr key={m.id} className="hover:bg-[#121620]">
                      <td className="p-3 font-mono text-slate-100">
                        <div className="font-semibold text-xs">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{p.name}</div>
                      </td>
                      <td className="p-3 text-center">{m.capabilities.longWriting ? '✅' : '➖'}</td>
                      <td className="p-3 text-center">{m.capabilities.longContext ? '✅ (>32k)' : '➖'}</td>
                      <td className="p-3 text-center">{m.capabilities.deepReasoning ? '✅' : '➖'}</td>
                      <td className="p-3 text-center">{m.capabilities.toolCalling ? '✅' : '❌'}</td>
                      <td className="p-3 text-center">{m.capabilities.fastSpeed ? '⚡ Ultra' : 'Normal'}</td>
                      <td className="p-3 text-center font-mono text-[10px] text-lime-400">
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
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 bg-[#0d1017]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">
                Registro de Conmutaciones Automáticas (Resiliencia ante Límites de Cuota)
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Total eventos registrados: {fallbackHistory.length}
              </span>
            </div>

            {fallbackHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#10141f] rounded-xl border border-[#1e2536] text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/60" />
                No se han producido errores de cuota o caídas de proveedor hasta el momento. La cascada está lista para actuar en cuanto se reciba un HTTP 429.
              </div>
            ) : (
              <div className="space-y-2">
                {fallbackHistory.slice().reverse().map((ev, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#121622] border border-amber-800/40 text-xs space-y-1 shadow-xs">
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

        {/* Footer */}
        <div className="p-3.5 bg-[#111520] border-t border-[#1c2436] flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
            <span>Enrutador Free-First activo • Google Gemini, Groq, Cerebras, OpenRouter, DeepSeek, Mistral, Qwen, Hugging Face</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            Cerrar Gestor
          </button>
        </div>

      </div>
    </div>
  );
};
