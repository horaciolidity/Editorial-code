import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  ChevronDown,
  Wifi,
  WifiOff,
  Sparkles,
  Terminal,
  Download,
  CheckCircle2,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { Project, ProjectFile } from '../types/editorial';

interface HeaderProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectWizard: () => void;
  files: ProjectFile[];
  isOnline: boolean;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  runningTasksCount: number;
  lastSavedAt: string | null;
  onTriggerQualityAudit: () => void;
  desktopSidebarOpen?: boolean;
  onToggleDesktopSidebar?: () => void;
  desktopAgentOpen?: boolean;
  onToggleDesktopAgent?: () => void;
  onOpenAIManager?: () => void;
  activeProviderName?: string;
  activeModelName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onOpenNewProjectWizard,
  files,
  isOnline,
  drawerOpen,
  onToggleDrawer,
  runningTasksCount,
  onTriggerQualityAudit,
  desktopSidebarOpen = true,
  onToggleDesktopSidebar,
  desktopAgentOpen = true,
  onToggleDesktopAgent,
  onOpenAIManager,
  activeProviderName = 'Google Gemini',
  activeModelName = 'gemini-3.8-flash'
}) => {
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const totalWords = files.reduce((acc, f) => acc + (f.wordCount || 0), 0);
  const targetWords = currentProject?.estimatedWords || 50000;
  const progressPct = Math.min(100, Math.round((totalWords / targetWords) * 100));

  const handleExport = (format: string) => {
    if (!currentProject) return;
    window.open(`/api/export/${currentProject.id}/${format}`, '_blank');
    setExportMenuOpen(false);
  };

  return (
    <header className="h-12 sm:h-14 bg-[#0d0f14] border-b border-[#1e2330] flex items-center justify-between px-2 sm:px-4 select-none z-30 text-xs shrink-0 w-full max-w-full">
      {/* Left: Desktop Panel Toggles & Brand & Project Selector */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 sm:flex-initial mr-1">
        {/* Desktop Sidebar Toggle */}
        {onToggleDesktopSidebar && (
          <button
            onClick={onToggleDesktopSidebar}
            className="hidden lg:flex p-1.5 rounded hover:bg-[#1c2230] text-slate-400 hover:text-slate-200 transition-colors"
            title={desktopSidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
          >
            {desktopSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            ) : (
              <PanelLeftOpen className="w-4 h-4 text-violet-400" />
            )}
          </button>
        )}

        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-mono font-bold text-xs sm:text-sm shrink-0">
            EC
          </div>
          <div className="hidden xs:flex flex-col">
            <span className="font-mono font-semibold tracking-wider text-slate-100 flex items-center gap-1 text-[11px] sm:text-xs">
              EDITORIAL <span className="text-violet-400">CODE</span>
            </span>
            <span className="hidden md:inline text-[9px] text-slate-400 font-sans truncate">
              Estudio Editorial Autónomo
            </span>
          </div>
        </div>

        <div className="hidden sm:block h-5 w-px bg-[#262c3d] shrink-0" />

        {/* Project Selector Dropdown */}
        <div className="relative min-w-0 max-w-[140px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-[300px]">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="w-full flex items-center justify-between gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#161a23] hover:bg-[#1c2230] border border-[#273042] text-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="font-medium text-slate-100 truncate text-[11px] sm:text-xs text-left">
              {currentProject ? currentProject.title : 'Seleccionar Libro'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {projectDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                onClick={() => setProjectDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-[calc(100vw-1rem)] xs:w-72 max-w-[320px] bg-[#12161f] border border-[#2a3449] rounded-lg shadow-2xl py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Mis Libros
                </div>
                <div className="max-h-56 overflow-y-auto">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setProjectDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-[#1a2130] transition-colors ${
                        currentProject?.id === p.id
                          ? 'bg-violet-950/40 text-violet-200 border-l-2 border-violet-500'
                          : 'text-slate-300'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-100 truncate text-xs">{p.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {p.genre.replace('_', ' ')} • {p.authorName}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#232b3d] mt-1 pt-1 px-1">
                  <button
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      onOpenNewProjectWizard();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-lime-400 hover:bg-lime-950/30 rounded text-left font-medium transition-colors text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Nuevo Proyecto Editorial...</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Manuscript Progress (Desktop only) */}
      {currentProject && (
        <div className="hidden xl:flex items-center gap-3 px-3 py-1 rounded-md bg-[#121620] border border-[#202737] shrink-0">
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-200">
              <span className="font-semibold text-violet-300">{totalWords.toLocaleString()}</span> / {targetWords.toLocaleString()} w
            </div>
            <div className="text-[10px] text-slate-400">
              Progreso: <span className="text-lime-400 font-mono">{progressPct}%</span>
            </div>
          </div>
          <div className="w-24 h-2 bg-[#1f2738] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-lime-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Right Controls & Status Badges */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Model & AI Provider Badge (Interactive Button) */}
        <button
          onClick={onOpenAIManager}
          className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded bg-[#161b26] hover:bg-[#1f2637] border border-[#242d3e] hover:border-violet-600/60 text-slate-300 transition-colors shrink-0 group cursor-pointer"
          title={`Proveedor: ${activeProviderName} | Modelo: ${activeModelName} (Clic para gestionar proveedores de IA y conmutación automática)`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 animate-pulse" />
          <span className="hidden xs:inline text-[10px] sm:text-[11px] font-mono text-slate-200 group-hover:text-white truncate max-w-[110px] sm:max-w-[140px]">
            {activeModelName}
          </span>
          <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-lime-950 text-lime-300 font-semibold border border-lime-800/40 shrink-0">
            FREE ROUTER
          </span>
        </button>

        {/* Sync / Online Status */}
        <div
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded border text-[10px] sm:text-[11px] shrink-0 ${
            isOnline
              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}
          title={isOnline ? 'Online (Sincronizado)' : 'Offline (Local)'}
        >
          {isOnline ? (
            <Wifi className="w-3 h-3 shrink-0" />
          ) : (
            <WifiOff className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
          )}
          <span className="font-mono text-[9px] sm:text-[10px] hidden xs:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Quick Add Project Button (Mobile) */}
        <button
          onClick={onOpenNewProjectWizard}
          className="flex lg:hidden items-center justify-center p-1.5 rounded bg-violet-950 hover:bg-violet-900 border border-violet-800 text-violet-300 transition-colors"
          title="Crear Nuevo Libro"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Audit Quality Button (Desktop) */}
        <button
          onClick={onTriggerQualityAudit}
          className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#161a24] hover:bg-violet-950/40 text-slate-300 hover:text-violet-300 border border-[#273042] hover:border-violet-700/60 transition-colors shrink-0"
          title="Auditar coherencia narrativa, ortografía y continuidad"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden lg:inline text-[11px]">Auditar</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded bg-[#161a24] hover:bg-[#202737] text-slate-300 border border-[#273042] transition-colors text-[11px]"
            title="Exportar Manuscrito"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {exportMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                onClick={() => setExportMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 sm:w-52 bg-[#121620] border border-[#263044] rounded-lg shadow-2xl py-1 z-50 text-slate-300">
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Manuscrito (.md)</span>
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                  <span>Libro Maquetado (.html)</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                  <span>Paquete Completo (.json)</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom Drawer Toggle (Desktop) */}
        <button
          onClick={onToggleDrawer}
          className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded border transition-colors shrink-0 ${
            drawerOpen
              ? 'bg-violet-900/40 text-violet-300 border-violet-600/70'
              : 'bg-[#161a24] hover:bg-[#202737] text-slate-300 border-[#273042]'
          }`}
          title="Terminal de Tareas, Registro de Actividad y Métricas"
        >
          <Terminal className="w-3.5 h-3.5 text-lime-400" />
          <span className="font-mono text-[10px] hidden md:inline">Consola</span>
          {runningTasksCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-violet-600 text-white font-mono text-[9px] font-bold animate-pulse">
              {runningTasksCount}
            </span>
          )}
        </button>

        {/* Desktop Agent Toggle */}
        {onToggleDesktopAgent && (
          <button
            onClick={onToggleDesktopAgent}
            className="hidden lg:flex p-1.5 rounded hover:bg-[#1c2230] text-slate-400 hover:text-slate-200 transition-colors"
            title={desktopAgentOpen ? 'Ocultar panel del agente' : 'Mostrar panel del agente'}
          >
            {desktopAgentOpen ? (
              <PanelRightClose className="w-4 h-4 text-slate-400" />
            ) : (
              <PanelRightOpen className="w-4 h-4 text-violet-400" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
