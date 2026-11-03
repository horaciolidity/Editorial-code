import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bookmark,
  Check,
  Bot,
  User,
  ListOrdered,
  Wrench,
  AlertTriangle,
  Flame,
  Layers
} from 'lucide-react';
import {
  AgentMessage,
  SpecialistRole,
  AgentPermissionMode,
  ToolCall
} from '../types/editorial';

interface AgentPanelProps {
  messages: AgentMessage[];
  isThinking: boolean;
  specialistRole: SpecialistRole;
  onChangeRole: (role: SpecialistRole) => void;
  permissionMode: AgentPermissionMode;
  onChangePermissionMode: (mode: AgentPermissionMode) => void;
  onSendMessage: (text: string) => Promise<void>;
  onApproveTool: (toolCall: ToolCall, action: 'approve' | 'reject') => Promise<void>;
  selectedModel: string;
  isMobile?: boolean;
  onOpenAIManager?: () => void;
  activeProviderId?: string;
}

const ROLES: { id: SpecialistRole; label: string; desc: string; icon: string }[] = [
  { id: 'director', label: 'Director Editorial', desc: 'Coordina visión general y continuidad', icon: '👑' },
  { id: 'autor', label: 'Autor / Narrador', desc: 'Redacción creativa de capítulos', icon: '✍️' },
  { id: 'investigador', label: 'Investigador', desc: 'Fuentes y rigor histórico/técnico', icon: '🔍' },
  { id: 'editor', label: 'Editor de Estilo', desc: 'Mejora ritmo y tensión literaria', icon: '✒️' },
  { id: 'corrector', label: 'Corrector', desc: 'Ortotipografía y gramática', icon: '🛡️' },
  { id: 'maquetador', label: 'Maquetador', desc: 'Lomos, márgenes y formatos KDP/Lulu', icon: '📐' },
];

export const AgentPanel: React.FC<AgentPanelProps> = ({
  messages,
  isThinking,
  specialistRole,
  onChangeRole,
  permissionMode,
  onChangePermissionMode,
  onSendMessage,
  onApproveTool,
  selectedModel,
  isMobile = false,
  onOpenAIManager,
  activeProviderId
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handleQuickAction = (text: string) => {
    if (isThinking) return;
    onSendMessage(text);
  };

  const currentRoleObj = ROLES.find(r => r.id === specialistRole) || ROLES[0];

  return (
    <aside
      className={`bg-[#0f121a] flex flex-col h-full select-none text-xs overflow-hidden ${
        isMobile
          ? 'w-full flex-1 border-none'
          : 'w-80 xl:w-96 shrink-0 border-l border-[#1e2330]'
      }`}
    >
      {/* Agent Top Header */}
      <div className="p-2.5 sm:p-3 bg-[#131722] border-b border-[#20283a] space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5 text-[11px] truncate">
                AGENTE EDITORIAL
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              </span>
              <span className="text-[9px] text-slate-400 font-mono truncate hidden xs:block">
                Autónomo (Inspirado en OpenCode)
              </span>
            </div>
          </div>

          {/* Model info & AI Manager trigger */}
          <button
            onClick={onOpenAIManager}
            className="text-right shrink-0 hover:bg-[#1c2232] px-2 py-1 rounded transition-colors group cursor-pointer border border-transparent hover:border-violet-700/50"
            title="Abrir Gestor de Proveedores de IA y Conmutación Automática"
          >
            <div className="flex items-center gap-1 justify-end">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 group-hover:text-cyan-300 animate-pulse" />
              <span className="font-mono text-[9px] sm:text-[10px] text-violet-300 group-hover:text-violet-200 block truncate max-w-[110px] sm:max-w-[130px]">
                {selectedModel}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <span className="text-[8px] sm:text-[9px] text-lime-400 font-medium">Free Router</span>
              <span className="text-[9px] text-slate-400 group-hover:text-slate-200">⚙</span>
            </div>
          </button>
        </div>

        {/* Role Selector & Permission Pill */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {/* Specialist Role Dropdown */}
          <div className="flex-1 min-w-0">
            <select
              value={specialistRole}
              onChange={e => onChangeRole(e.target.value as SpecialistRole)}
              className="w-full bg-[#181e2b] border border-[#273247] rounded px-2 py-1 text-slate-200 text-[10px] sm:text-[11px] focus:outline-none truncate"
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.id}>
                  {r.icon} {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Permission Mode Toggle */}
          <button
            onClick={() => {
              const next: AgentPermissionMode =
                permissionMode === 'allow' ? 'ask' : permissionMode === 'ask' ? 'deny' : 'allow';
              onChangePermissionMode(next);
            }}
            className={`px-2 py-1 rounded border text-[9px] sm:text-[10px] font-mono uppercase flex items-center gap-1 transition-colors shrink-0 ${
              permissionMode === 'allow'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : permissionMode === 'ask'
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
            title="Permisos: Automático (ejecuta), Consultar (pide aprobación), Estricto"
          >
            <ShieldCheck className="w-3 h-3 shrink-0" />
            <span>{permissionMode}</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-3 sm:space-y-4 min-w-0">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`space-y-1.5 min-w-0 ${isUser ? 'ml-3 sm:ml-6' : 'mr-1 sm:mr-2'}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {isUser ? (
                  <>
                    <User className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-300">Tú (Autor)</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-violet-400 shrink-0" />
                    <span className="font-semibold text-violet-300 capitalize truncate">
                      {msg.specialistRole || 'Agente'}
                    </span>
                    {msg.providerUsed && (
                      <span className="font-mono text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700/60 uppercase">
                        {msg.providerUsed}
                      </span>
                    )}
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] text-slate-400 hidden sm:inline">({msg.modelUsed})</span>
                    )}
                  </>
                )}
                <span className="text-slate-600 ml-auto font-mono text-[9px] shrink-0">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-2.5 sm:p-3 rounded-lg text-slate-200 text-xs leading-relaxed space-y-2 break-words max-w-full overflow-hidden ${
                  isUser
                    ? 'bg-violet-950/40 border border-violet-800/50 text-violet-100'
                    : 'bg-[#141824] border border-[#232c3f]'
                }`}
              >
                {/* Automatic Model Fallback Banner */}
                {msg.fallbackNotice && (
                  <div className="p-2 sm:p-2.5 rounded bg-amber-950/70 border border-amber-600/70 text-amber-200 space-y-1 text-[11px] max-w-full shadow-sm">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Conmutación Automática (Fallback)</span>
                    </div>
                    <p className="text-amber-100/90 pl-5 break-words text-[10px] sm:text-[11px]">
                      {msg.fallbackNotice}
                    </p>
                  </div>
                )}
                {/* Agent Internal Thought / Reasoning (Collapsible) */}
                {msg.thought && (
                  <div className="border border-[#263147] rounded bg-[#0b0e14] overflow-hidden text-[11px] max-w-full">
                    <button
                      onClick={() =>
                        setExpandedThoughtId(expandedThoughtId === msg.id ? null : msg.id)
                      }
                      className="w-full px-2 py-1 flex items-center justify-between text-slate-400 hover:text-slate-200 font-mono text-[10px]"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Razonamiento del Agente</span>
                      </span>
                      {expandedThoughtId === msg.id ? (
                        <ChevronUp className="w-3 h-3 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 shrink-0" />
                      )}
                    </button>
                    {expandedThoughtId === msg.id && (
                      <p className="p-2 border-t border-[#1e2536] text-slate-400 italic font-sans leading-relaxed break-words">
                        {msg.thought}
                      </p>
                    )}
                  </div>
                )}

                {/* Agent Plan */}
                {msg.plan && msg.plan.length > 0 && (
                  <div className="p-2 rounded bg-[#0d1017] border border-[#1e273a] space-y-1 max-w-full">
                    <span className="font-semibold text-slate-300 font-mono text-[10px] flex items-center gap-1">
                      <ListOrdered className="w-3 h-3 text-lime-400 shrink-0" />
                      Plan Editorial:
                    </span>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {msg.plan.map((step, idx) => (
                        <li key={idx} className="break-words">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Main Response Text */}
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                {/* Continuity Alerts if detected */}
                {msg.continuityAlerts && msg.continuityAlerts.length > 0 && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-1 text-[11px] max-w-full">
                    <div className="flex items-center gap-1 font-semibold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Alerta de Continuidad:</span>
                    </div>
                    {msg.continuityAlerts.map((alt, idx) => (
                      <p key={idx} className="text-amber-100/90 pl-3 break-words">
                        • {alt}
                      </p>
                    ))}
                  </div>
                )}

                {/* Executed or Pending Tools */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-[#1e2536] max-w-full">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400 shrink-0" /> Herramientas Invocadas
                    </span>
                    {msg.toolCalls.map(tc => (
                      <div
                        key={tc.id}
                        className="rounded bg-[#0d1018] border border-[#212b3e] p-2 space-y-1.5 text-[11px] max-w-full overflow-hidden"
                      >
                        <div className="flex items-center justify-between font-mono gap-1">
                          <span className="text-cyan-300 font-semibold truncate text-[11px]">{tc.toolName}()</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold shrink-0 ${
                              tc.status === 'completed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : tc.status === 'requires_approval'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                : tc.status === 'failed'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {tc.status}
                          </span>
                        </div>

                        {/* Approval actions if requires approval */}
                        {tc.status === 'requires_approval' && (
                          <div className="p-2 rounded bg-amber-950/20 border border-amber-800/40 space-y-2 mt-1">
                            <p className="text-[10px] text-amber-200">
                              Esta acción modificará o creará archivos del libro. ¿Deseas aprobar su ejecución?
                            </p>
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              <button
                                onClick={() => onApproveTool(tc, 'reject')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[10px]"
                              >
                                Rechazar
                              </button>
                              <button
                                onClick={() => onApproveTool(tc, 'approve')}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[10px] flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Aprobar y Ejecutar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Tool Result details */}
                        {tc.result && (
                          <div className="text-[10px] text-slate-400 font-mono bg-[#090b10] p-1.5 rounded overflow-x-auto max-w-full">
                            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(tc.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Checkpoint Badge */}
                {msg.checkpoints && msg.checkpoints.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-lime-400 pt-1 truncate">
                    <Bookmark className="w-3 h-3 shrink-0" />
                    <span className="truncate">Checkpoints: {msg.checkpoints.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="p-3 bg-[#141824] border border-[#232c3f] rounded-lg text-slate-300 text-xs flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
            <span className="font-mono text-[11px] truncate">
              {currentRoleObj.label} está planificando...
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Pills (Horizontally scrollable with smooth touch) */}
      <div className="px-2.5 py-1.5 bg-[#0a0d13] border-t border-[#1a2130] flex gap-1.5 overflow-x-auto no-scrollbar flex-nowrap text-[10px] select-none shrink-0 w-full">
        <button
          onClick={() => handleQuickAction('Escribe el siguiente capítulo continuando la trama')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-violet-950/60 hover:text-violet-300 text-slate-400 whitespace-nowrap transition-colors shrink-0"
        >
          ✍️ Escribir Capítulo
        </button>
        <button
          onClick={() => handleQuickAction('Audita la coherencia narrativa y posibles contradicciones')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-400 whitespace-nowrap transition-colors shrink-0"
        >
          🔍 Auditar Coherencia
        </button>
        <button
          onClick={() => handleQuickAction('Calcula el lomo y especificaciones para Amazon KDP')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-lime-950/60 hover:text-lime-300 text-slate-400 whitespace-nowrap transition-colors shrink-0"
        >
          📐 Calcular Lomo KDP
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-2 sm:p-3 bg-[#11151f] border-t border-[#1d2435] shrink-0 pb-safe">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Instrucción para el ${currentRoleObj.label}...`}
            rows={2}
            className="w-full bg-[#0a0c12] border border-[#242e42] rounded-lg p-2.5 pr-11 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="absolute right-2 bottom-3 p-2 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
            title="Enviar instrucción al Agente"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-500 pt-1 px-1">
          <span>Shift + Enter para salto de línea</span>
          <span className="font-mono text-cyan-400">OpenCode Agent Loop</span>
        </div>
      </form>
    </aside>
  );
};
