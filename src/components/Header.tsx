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
  AlertCircle,
  FileText,
  Sliders,
  Play
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
  lastSavedAt,
  onTriggerQualityAudit
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
    <header className="h-14 bg-[#0d0f14] border-b border-[#1e2330] flex items-center justify-between px-4 select-none z-20 text-xs">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 text-white font-mono font-bold text-sm">
            EC
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-semibold tracking-wider text-slate-100 flex items-center gap-1.5">
              EDITORIAL <span className="text-violet-400">CODE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800/60 font-sans">
                v1.0
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
              Estudio Editorial Autónomo
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-[#262c3d]" />

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#161a23] hover:bg-[#1c2230] border border-[#273042] text-slate-200 transition-colors max-w-[280px]"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <div className="text-left truncate">
              <span className="font-medium text-slate-100 block truncate">
                {currentProject ? currentProject.title : 'Seleccionar Libro'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-[#12161f] border border-[#2a3449] rounded-lg shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Mis Libros
              </div>
              <div className="max-h-60 overflow-y-auto">
                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-[#1a2130] transition-colors ${
                      currentProject?.id === p.id ? 'bg-violet-950/40 text-violet-200 border-l-2 border-violet-500' : 'text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-slate-100 truncate">{p.title}</div>
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
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-lime-400 hover:bg-lime-950/30 rounded text-left font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Proyecto Editorial...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Manuscript Progress */}
      {currentProject && (
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-md bg-[#121620] border border-[#202737]">
          <div className="text-right">
            <div className="text-[11px] font-mono text-slate-200">
              <span className="font-semibold text-violet-300">{totalWords.toLocaleString()}</span> / {targetWords.toLocaleString()} palabras
            </div>
            <div className="text-[10px] text-slate-400">
              Progreso estimado: <span className="text-lime-400 font-mono">{progressPct}%</span>
            </div>
          </div>
          <div className="w-28 h-2 bg-[#1f2738] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-lime-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Right: Status Badges & Controls */}
      <div className="flex items-center gap-2.5">
        {/* Model Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161b26] border border-[#242d3e] text-slate-300">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-[11px] font-mono text-slate-200">Gemini 3.8 Flash</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-lime-950 text-lime-300 font-semibold border border-lime-800/40">
            FREE TIER
          </span>
        </div>

        {/* Sync / Online Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] ${
            isOnline
              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
          }`}
          title={isOnline ? 'Conectado al backend local y sincronizado' : 'Modo Offline: guardando cambios localmente en IndexedDB'}
        >
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />}
          <span className="font-mono text-[10px]">{isOnline ? 'Online' : 'Offline (Local)'}</span>
        </div>

        {/* Audit Quality Button */}
        <button
          onClick={onTriggerQualityAudit}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161a24] hover:bg-violet-950/40 text-slate-300 hover:text-violet-300 border border-[#273042] hover:border-violet-700/60 transition-colors"
          title="Auditar coherencia narrativa, ortografía y continuidad"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden lg:inline">Auditar</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161a24] hover:bg-[#202737] text-slate-300 border border-[#273042] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exportar</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-[#121620] border border-[#263044] rounded-lg shadow-2xl py-1 z-50 text-slate-300">
              <button
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Manuscrito (.md)</span>
              </button>
              <button
                onClick={() => handleExport('html')}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-violet-400" />
                <span>Libro Maquetado (.html)</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#1a2130] text-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-lime-400" />
                <span>Paquete Completo (.json)</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Drawer Toggle (Terminal / Tasks / Logs) */}
        <button
          onClick={onToggleDrawer}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
            drawerOpen
              ? 'bg-violet-900/40 text-violet-300 border-violet-600/70'
              : 'bg-[#161a24] hover:bg-[#202737] text-slate-300 border-[#273042]'
          }`}
          title="Terminal de Tareas, Registro de Actividad y Métricas"
        >
          <Terminal className="w-3.5 h-3.5 text-lime-400" />
          <span className="font-mono text-[11px] hidden sm:inline">Consola</span>
          {runningTasksCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-violet-600 text-white font-mono text-[9px] font-bold animate-pulse">
              {runningTasksCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
