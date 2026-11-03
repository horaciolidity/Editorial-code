import React, { useState } from 'react';
import {
  Terminal,
  Layers,
  BarChart3,
  CheckCircle2,
  Play,
  Pause,
  ChevronDown,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { BackgroundTask, Project, ProjectFile } from '../types/editorial';

interface BottomDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  tasks: BackgroundTask[];
  onTaskAction: (taskId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => Promise<void>;
  onCreateNewTask: (name: string, description: string) => Promise<void>;
  currentProject: Project | null;
  files: ProjectFile[];
  activityLogs: { timestamp: string; level: 'info' | 'warn' | 'success' | 'tool'; message: string }[];
  isMobileFullView?: boolean;
  onOpenAIManager?: () => void;
  selectedModel?: string;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onToggle,
  tasks,
  onTaskAction,
  onCreateNewTask,
  currentProject,
  files,
  activityLogs,
  isMobileFullView = false,
  onOpenAIManager,
  selectedModel = 'gemini-3.8-flash'
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'tasks' | 'metrics' | 'qa'>('logs');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskModal, setNewTaskModal] = useState(false);

  if (!isOpen && !isMobileFullView) return null;

  const totalWords = files.reduce((acc, f) => acc + (f.wordCount || 0), 0);
  const totalChapters = files.filter(f => f.type === 'chapter').length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    await onCreateNewTask(
      newTaskName.trim(),
      'Proceso largo ejecutado en segundo plano con checkpoints'
    );
    setNewTaskName('');
    setNewTaskModal(false);
  };

  return (
    <div
      className={`bg-[#0a0c12] border-t border-[#1e2536] flex flex-col select-none text-xs font-mono z-30 shadow-2xl overflow-hidden w-full ${
        isMobileFullView
          ? 'flex-1 h-full border-none'
          : 'h-60 sm:h-64 shrink-0'
      }`}
    >
      {/* Drawer Header Tabs (scrolls horizontally on small devices) */}
      <div className="h-9 sm:h-10 bg-[#11141e] border-b border-[#1c2233] px-2 sm:px-3 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-nowrap min-w-0">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'logs'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d2a]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-lime-400 shrink-0" />
            <span>Logs ({activityLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'tasks'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d2a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Tareas ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d2a]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span>Consumo</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] sm:text-[11px] whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'qa'
                ? 'bg-violet-950/70 text-violet-300 font-semibold border border-violet-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d2a]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Auditoría QA</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab === 'tasks' && (
            <button
              onClick={() => setNewTaskModal(true)}
              className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 hover:bg-violet-900 flex items-center gap-1 text-[10px] shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span className="hidden xs:inline">Nueva Tarea</span>
            </button>
          )}

          {!isMobileFullView && (
            <button
              onClick={onToggle}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#1c2230] shrink-0"
              title="Cerrar consola"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 min-w-0">
        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-1 font-mono text-[10px] sm:text-[11px] w-full">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1.5 sm:gap-2 text-slate-300 hover:bg-slate-900/40 px-1 py-0.5 rounded break-words">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span
                  className={`font-semibold shrink-0 uppercase text-[9px] sm:text-[10px] ${
                    log.level === 'tool'
                      ? 'text-cyan-400'
                      : log.level === 'success'
                      ? 'text-lime-400'
                      : log.level === 'warn'
                      ? 'text-amber-400'
                      : 'text-violet-400'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {tasks.map(t => (
              <div
                key={t.id}
                className="bg-[#111520] border border-[#202739] rounded p-2.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-100 font-sans truncate text-xs">{t.name}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-semibold shrink-0 ${
                        t.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : t.status === 'running'
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse'
                          : t.status === 'paused'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.status === 'running' && (
                      <button
                        onClick={() => onTaskAction(t.id, 'pause')}
                        className="px-2 py-0.5 rounded bg-[#1a2130] hover:bg-[#252f44] text-slate-300 text-[10px] flex items-center gap-1"
                      >
                        <Pause className="w-3 h-3 text-amber-400" /> Pausar
                      </button>
                    )}
                    {t.status === 'paused' && (
                      <button
                        onClick={() => onTaskAction(t.id, 'resume')}
                        className="px-2 py-0.5 rounded bg-[#1a2130] hover:bg-[#252f44] text-slate-300 text-[10px] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-lime-400" /> Reanudar
                      </button>
                    )}
                    {t.status !== 'completed' && t.status !== 'cancelled' && (
                      <button
                        onClick={() => onTaskAction(t.id, 'cancel')}
                        className="px-2 py-0.5 rounded bg-[#1a2130] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[10px]"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-1 bg-[#1a2030] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-lime-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-300 font-mono shrink-0">{t.progress}%</span>
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between gap-2">
                  <span className="truncate">Paso: <strong className="text-slate-200">{t.currentStep}</strong></span>
                  <span className="text-slate-500 font-mono shrink-0">
                    Checkpoints: {(t.checkpoints || []).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="bg-[#111520] border border-[#202739] rounded p-2.5 sm:p-3 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Gasto Acumulado</span>
              <div className="text-base sm:text-lg font-bold text-lime-400">$0.00 USD</div>
              <p className="text-[10px] text-slate-500">
                100% cuota gratuita (Gemini Free Tier).
              </p>
            </div>

            <div className="bg-[#111520] border border-[#202739] rounded p-2.5 sm:p-3 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Palabras en Proyecto</span>
              <div className="text-base sm:text-lg font-bold text-violet-300">{totalWords.toLocaleString()}</div>
              <p className="text-[10px] text-slate-500">
                Distribuido en {totalChapters} capítulos.
              </p>
            </div>

            <div className="bg-[#111520] border border-[#202739] rounded p-2.5 sm:p-3 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Enrutador de IA</span>
              <div className="text-xs sm:text-sm font-bold text-cyan-300 font-mono truncate">{selectedModel}</div>
              <p className="text-[10px] text-slate-500">
                Cascada Free-First (7 proveedores).
              </p>
              {onOpenAIManager && (
                <button
                  onClick={onOpenAIManager}
                  className="mt-1 text-[10px] text-violet-400 hover:text-violet-300 underline block cursor-pointer"
                >
                  Configurar Proveedores →
                </button>
              )}
            </div>
          </div>
        )}

        {/* QA PRE-FLIGHT TAB */}
        {activeTab === 'qa' && (
          <div className="space-y-2 text-slate-300">
            <div className="p-2.5 bg-[#111520] border border-[#202739] rounded space-y-2">
              <div className="font-semibold text-slate-100 flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auditoría Editorial Pre-Venta & Publicación</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                <div className="flex items-center gap-2 p-1.5 rounded bg-[#0b0e14]">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Guiones largos y rayas de diálogo españolas conformes</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-[#0b0e14]">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Sin contradicciones en nombres ni edades de personajes</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-[#0b0e14]">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Márgenes y sangrado conformes para KDP / Lulu</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-[#0b0e14]">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>Metadatos y estructura TOC válidos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {newTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 font-sans">
          <div className="bg-[#121622] border border-[#29354d] rounded-lg p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              Lanzar Proceso en Segundo Plano
            </h4>
            <p className="text-xs text-slate-400">
              Ejecuta auditorías profundas, generación masiva o análisis estilístico persistente.
            </p>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <input
                type="text"
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                placeholder="Ej. Revisión ortotipográfica y repeticiones"
                className="w-full bg-[#090b10] border border-[#222a3d] rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                autoFocus
                required
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNewTaskModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                >
                  Iniciar Trabajo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
