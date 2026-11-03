import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bookmark,
  Check,
  CornerDownLeft,
  Bot,
  User,
  Zap,
  ListOrdered,
  Layers,
  Wrench
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
}

const ROLES: { id: SpecialistRole; label: string; desc: string; icon: string }[] = [
  { id: 'director', label: 'Director Editorial', desc: 'Coordina visión general, continuidad y decisiones clave', icon: '👑' },
  { id: 'autor', label: 'Autor / Narrador', desc: 'Redacción creativa y desarrollo de capítulos', icon: '✍️' },
  { id: 'investigador', label: 'Investigador', desc: 'Búsqueda de fuentes y rigor histórico/técnico', icon: '🔍' },
  { id: 'editor', label: 'Editor de Estilo', desc: 'Mejora ritmo, tensión literaria y tono', icon: '✒️' },
  { id: 'corrector', label: 'Corrector', desc: 'Ortotipografía, guiones y coherencia gramatical', icon: '🛡️' },
  { id: 'maquetador', label: 'Maquetador', desc: 'Cálculo de lomos, páginas y formatos KDP/Lulu', icon: '📐' },
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
  selectedModel
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedThoughtId, setExpandedThoughtId] = useState<string | null>(null);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
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
    <aside className="w-96 bg-[#0f121a] border-l border-[#1e2330] flex flex-col h-[calc(100vh-3.5rem)] select-none text-xs">
      {/* Agent Top Header */}
      <div className="p-3 bg-[#131722] border-b border-[#20283a] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 flex items-center gap-1.5 text-[11px]">
                AGENTE EDITORIAL
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Autónomo (Inspirado en OpenCode)
              </span>
            </div>
          </div>

          {/* Model info */}
          <div className="text-right">
            <span className="font-mono text-[10px] text-violet-300 block">
              {selectedModel}
            </span>
            <span className="text-[9px] text-lime-400 font-medium">Cuota Gratuita</span>
          </div>
        </div>

        {/* Role Selector & Permission Pill */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Specialist Role Dropdown */}
          <div className="flex-1">
            <select
              value={specialistRole}
              onChange={e => onChangeRole(e.target.value as SpecialistRole)}
              className="w-full bg-[#181e2b] border border-[#273247] rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none"
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
            className={`px-2 py-1 rounded border text-[10px] font-mono uppercase flex items-center gap-1 transition-colors ${
              permissionMode === 'allow'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : permissionMode === 'ask'
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
            title="Modo de permisos: Automático (ejecuta herramientas), Consultar (pide aprobación), Estricto"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{permissionMode}</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map(msg => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`space-y-1.5 ${isUser ? 'ml-6' : 'mr-2'}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {isUser ? (
                  <>
                    <User className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold text-slate-300">Tú (Autor)</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-violet-400" />
                    <span className="font-semibold text-violet-300 capitalize">
                      {msg.specialistRole || 'Agente'}
                    </span>
                    {msg.modelUsed && (
                      <span className="font-mono text-[9px] text-slate-500">({msg.modelUsed})</span>
                    )}
                  </>
                )}
                <span className="text-slate-600 ml-auto font-mono text-[9px]">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3 rounded-lg text-slate-200 text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-violet-950/40 border border-violet-800/50 text-violet-100'
                    : 'bg-[#141824] border border-[#232c3f]'
                }`}
              >
                {/* Agent Internal Thought / Reasoning (Collapsible) */}
                {msg.thought && (
                  <div className="border border-[#263147] rounded bg-[#0b0e14] overflow-hidden text-[11px]">
                    <button
                      onClick={() =>
                        setExpandedThoughtId(expandedThoughtId === msg.id ? null : msg.id)
                      }
                      className="w-full px-2 py-1 flex items-center justify-between text-slate-400 hover:text-slate-200 font-mono text-[10px]"
                    >
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Razonamiento del Agente</span>
                      </span>
                      {expandedThoughtId === msg.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {expandedThoughtId === msg.id && (
                      <p className="p-2 border-t border-[#1e2536] text-slate-400 italic font-sans leading-relaxed">
                        {msg.thought}
                      </p>
                    )}
                  </div>
                )}

                {/* Agent Plan */}
                {msg.plan && msg.plan.length > 0 && (
                  <div className="p-2 rounded bg-[#0d1017] border border-[#1e273a] space-y-1">
                    <span className="font-semibold text-slate-300 font-mono text-[10px] flex items-center gap-1">
                      <ListOrdered className="w-3 h-3 text-lime-400" />
                      Plan Editorial:
                    </span>
                    <ol className="list-decimal list-inside space-y-0.5 text-slate-300 text-[11px]">
                      {msg.plan.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Main Response Text */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Continuity Alerts if detected */}
                {msg.continuityAlerts && msg.continuityAlerts.length > 0 && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1 font-semibold text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Alerta de Continuidad:</span>
                    </div>
                    {msg.continuityAlerts.map((alt, idx) => (
                      <p key={idx} className="text-amber-100/90 pl-4">
                        • {alt}
                      </p>
                    ))}
                  </div>
                )}

                {/* Executed or Pending Tools */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-[#1e2536]">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400" /> Herramientas Invocadas
                    </span>
                    {msg.toolCalls.map(tc => (
                      <div
                        key={tc.id}
                        className="rounded bg-[#0d1018] border border-[#212b3e] p-2 space-y-1.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-cyan-300 font-semibold">{tc.toolName}()</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold ${
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
                            <div className="flex gap-2 justify-end">
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
                          <div className="text-[10px] text-slate-400 font-mono bg-[#090b10] p-1.5 rounded overflow-x-auto">
                            {JSON.stringify(tc.result, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Checkpoint Badge */}
                {msg.checkpoints && msg.checkpoints.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-lime-400 pt-1">
                    <Bookmark className="w-3 h-3" />
                    <span>Checkpoints: {msg.checkpoints.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="p-3 bg-[#141824] border border-[#232c3f] rounded-lg text-slate-300 text-xs flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-violet-400 animate-spin" />
            <span className="font-mono text-[11px]">
              El {currentRoleObj.label} está planificando y analizando el proyecto...
            </span>
          </div>
        )}
      </div>

      {/* Quick Action Pills */}
      <div className="px-3 py-1.5 bg-[#0a0d13] border-t border-[#1a2130] flex gap-1.5 overflow-x-auto text-[10px] select-none">
        <button
          onClick={() => handleQuickAction('Escribe el siguiente capítulo continuando la trama')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-violet-950/60 hover:text-violet-300 text-slate-400 whitespace-nowrap transition-colors"
        >
          ✍️ Escribir Capítulo 3
        </button>
        <button
          onClick={() => handleQuickAction('Audita la coherencia narrativa y posibles contradicciones')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-400 whitespace-nowrap transition-colors"
        >
          🔍 Auditar Coherencia
        </button>
        <button
          onClick={() => handleQuickAction('Calcula el lomo y especificaciones para Amazon KDP')}
          className="px-2 py-1 rounded bg-[#161c28] hover:bg-lime-950/60 hover:text-lime-300 text-slate-400 whitespace-nowrap transition-colors"
        >
          📐 Calcular Lomo KDP
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-[#11151f] border-t border-[#1d2435]">
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
            className="w-full bg-[#0a0c12] border border-[#242e42] rounded-lg p-2.5 pr-10 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="absolute right-2.5 bottom-3.5 p-1.5 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors"
            title="Enviar instrucción al Agente"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 px-1">
          <span>Shift + Enter para salto de línea</span>
          <span className="font-mono text-cyan-400">OpenCode Agent Loop</span>
        </div>
      </form>
    </aside>
  );
};
