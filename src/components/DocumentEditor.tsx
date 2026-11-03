import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Eye,
  Edit3,
  GitCompare,
  Save,
  Clock,
  Sparkles,
  Bold,
  Italic,
  Quote,
  Check,
  BookOpen,
  History
} from 'lucide-react';
import { ProjectFile, FileVersion } from '../types/editorial';
import { VersionDiffViewer } from './VersionDiffViewer';
import { marked } from 'marked';

interface DocumentEditorProps {
  file: ProjectFile | null;
  onSaveContent: (content: string, createVersion?: boolean, summary?: string) => Promise<void>;
  onRollbackVersion: (fileId: string, versionNumber: number) => Promise<void>;
  onAskAgentToEdit: (instruction: string) => void;
  onOpenMobileSidebar?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  file,
  onSaveContent,
  onRollbackVersion,
  onAskAgentToEdit,
  onOpenMobileSidebar
}) => {
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'editor' | 'preview' | 'diff'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<FileVersion | null>(null);
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [versionNoteModal, setVersionNoteModal] = useState(false);
  const [versionNoteText, setVersionNoteText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (file) {
      setContent(file.content || '');
      setMode('editor');
      setSelectedVersionForDiff(null);
    }
  }, [file?.id]);

  // Handle local changes with auto-save debounce
  const handleContentChange = (newVal: string) => {
    setContent(newVal);
    if (!file) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSaveContent(newVal, false);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } finally {
        setIsSaving(false);
      }
    }, 1200);
  };

  const handleManualSaveVersion = async () => {
    if (!file) return;
    setIsSaving(true);
    try {
      await onSaveContent(content, true, versionNoteText.trim() || 'Punto de control manual');
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setVersionNoteModal(false);
      setVersionNoteText('');
    } finally {
      setIsSaving(false);
    }
  };

  const insertText = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    handleContentChange(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b0d13] text-slate-500 select-none p-4 sm:p-6 text-center">
        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-slate-700" />
        <h3 className="font-semibold text-slate-300 text-sm">Ningún archivo seleccionado</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Selecciona un capítulo o nota en la sección de Archivos para comenzar a editar.
        </p>
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="mt-4 lg:hidden px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium"
          >
            Abrir Explorador de Archivos
          </button>
        )}
      </div>
    );
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 220));

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-[#0b0d13] text-slate-200 overflow-hidden relative">
      {/* Document Top Bar - Responsive layout */}
      <div className="bg-[#121622] border-b border-[#1e2538] px-2 sm:px-4 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs select-none shrink-0">
        {/* File name & status */}
        <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            <FileText className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="font-semibold text-slate-100 truncate text-xs">
              {file.name}
            </span>
            <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded bg-[#1c2233] text-slate-400 font-mono truncate max-w-[120px]">
              {file.path}
            </span>
          </div>

          {/* Saving Indicator */}
          <div className="shrink-0">
            {isSaving ? (
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="hidden xs:inline">Guardando...</span>
              </span>
            ) : lastSaved ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" />
                <span className="hidden xs:inline">{lastSaved}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* View Mode Switches & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
          {/* Mode Tabs */}
          <div className="flex rounded bg-[#181e2b] p-0.5 border border-[#263147] shrink-0">
            <button
              onClick={() => setMode('editor')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition-colors text-[10px] sm:text-[11px] ${
                mode === 'editor'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3 shrink-0" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition-colors text-[10px] sm:text-[11px] ${
                mode === 'preview'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3 shrink-0" />
              <span>Maqueta</span>
            </button>

            <button
              onClick={() => {
                const versions = file.versions || [];
                if (versions.length > 0) {
                  setSelectedVersionForDiff(versions[versions.length - 1]);
                  setMode('diff');
                } else {
                  alert('Este archivo aún no tiene versiones anteriores para comparar.');
                }
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded transition-colors text-[10px] sm:text-[11px] ${
                mode === 'diff'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3 h-3 shrink-0" />
              <span>Diff</span>
            </button>
          </div>

          {/* Versions Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-[#181e2b] hover:bg-[#222a3d] border border-[#263147] text-slate-300 text-[10px] sm:text-[11px]"
              title="Historial de versiones del capítulo"
            >
              <History className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>v{file.versions?.length || 1}</span>
            </button>

            {showVersionMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                  onClick={() => setShowVersionMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-1.5rem)] bg-[#121622] border border-[#263147] rounded-lg shadow-2xl p-1 z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                    <span>Historial de Versiones</span>
                    <button
                      onClick={() => {
                        setShowVersionMenu(false);
                        setVersionNoteModal(true);
                      }}
                      className="text-lime-400 hover:underline"
                    >
                      + Checkpoint
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {(file.versions || []).map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVersionForDiff(v);
                          setMode('diff');
                          setShowVersionMenu(false);
                        }}
                        className="px-2 py-1.5 rounded hover:bg-[#1b2233] cursor-pointer text-slate-300 text-[11px]"
                      >
                        <div className="flex justify-between items-center font-medium text-slate-100">
                          <span>Versión {v.versionNumber}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{v.summary || 'Sin nota'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Manual Save Checkpoint Button */}
          <button
            onClick={() => setVersionNoteModal(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded bg-violet-950 hover:bg-violet-900 border border-violet-800 text-violet-300 text-[10px] sm:text-[11px] font-medium shrink-0"
            title="Crear punto de restauración con nota"
          >
            <Save className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">Guardar Checkpoint</span>
          </button>
        </div>
      </div>

      {/* Manual Version Modal */}
      {versionNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div className="bg-[#121622] border border-[#29354d] rounded-lg p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400 shrink-0" />
              Guardar Checkpoint de Versión
            </h4>
            <p className="text-xs text-slate-400">
              Crea una instantánea histórica permanente para comparar cambios o restaurarla en cualquier momento.
            </p>
            <input
              type="text"
              value={versionNoteText}
              onChange={e => setVersionNoteText(e.target.value)}
              placeholder="Ej. Revisión de diálogos y tensión"
              className="w-full bg-[#090b10] border border-[#222a3d] rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-1 text-xs">
              <button
                onClick={() => setVersionNoteModal(false)}
                className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleManualSaveVersion}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium"
              >
                Guardar Checkpoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editorial Quick Formatting Toolbar (only in editor mode, scrolls horizontally on mobile) */}
      {mode === 'editor' && (
        <div className="h-8 bg-[#0e111a] border-b border-[#1b2131] px-2 sm:px-4 flex items-center gap-1 text-slate-400 text-xs overflow-x-auto no-scrollbar flex-nowrap select-none shrink-0 w-full">
          <button
            onClick={() => insertText('# ', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-serif font-bold shrink-0 text-xs"
            title="Encabezado H1"
          >
            H1
          </button>
          <button
            onClick={() => insertText('## ', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-serif font-bold shrink-0 text-xs"
            title="Encabezado H2"
          >
            H2
          </button>
          <div className="w-px h-3.5 bg-[#202738] mx-1 shrink-0" />
          <button
            onClick={() => insertText('**', '**')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200 shrink-0"
            title="Negrita (**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200 shrink-0"
            title="Cursiva (*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('—', '')}
            className="px-2 py-0.5 rounded hover:bg-violet-950/50 hover:text-violet-300 font-mono font-bold text-violet-400 border border-violet-900/40 shrink-0 text-xs"
            title="Guión Largo / Raya de Diálogo española (—)"
          >
            — Raya
          </button>
          <button
            onClick={() => insertText('> ', '')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200 shrink-0"
            title="Cita narrativa"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('\n\n***\n\n', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-mono text-[10px] shrink-0"
            title="Salto de escena (***)"
          >
            *** Escena
          </button>
          <div className="w-px h-3.5 bg-[#202738] mx-1 shrink-0" />
          <button
            onClick={() => onAskAgentToEdit(`Mejora la tensión literaria y el estilo del capítulo actual: "${file.name}"`)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 border border-violet-800/60 text-[11px] shrink-0"
            title="Pedir al Agente Editorial que pula este texto"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="whitespace-nowrap">Pulir con Agente</span>
          </button>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 min-w-0 overflow-hidden relative w-full">
        {mode === 'editor' && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full h-full p-3 sm:p-5 md:p-6 bg-[#0a0c12] text-slate-100 font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none selection:bg-violet-800/60"
            placeholder="Comienza a redactar o deja que el Agente Editorial desarrolle el capítulo..."
            spellCheck="true"
          />
        )}

        {mode === 'preview' && (
          <div className="w-full h-full overflow-y-auto p-2 sm:p-6 md:p-10 bg-[#10131c] flex justify-center">
            {/* Book Page Simulation */}
            <div className="max-w-2xl w-full bg-[#0c0e15] border border-[#242d40] shadow-2xl p-4 sm:p-8 md:p-12 rounded-sm text-slate-100 font-serif leading-loose">
              <div className="text-center font-sans text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-widest pb-4 sm:pb-8 mb-4 sm:mb-8 border-b border-[#1f2638] break-words">
                {file.name}
              </div>
              <div
                className="prose prose-invert prose-p:mb-4 prose-headings:font-serif prose-headings:text-slate-100 leading-relaxed text-sm sm:text-[15px] break-words"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
              />
              <div className="text-center font-mono text-xs text-slate-600 pt-6 sm:pt-12 mt-6 sm:mt-12 border-t border-[#1f2638]">
                — Fin del capítulo —
              </div>
            </div>
          </div>
        )}

        {mode === 'diff' && selectedVersionForDiff && (
          <VersionDiffViewer
            currentContent={content}
            selectedVersion={selectedVersionForDiff}
            onRollback={async vNum => {
              await onRollbackVersion(file.id, vNum);
              setMode('editor');
            }}
            onClose={() => setMode('editor')}
          />
        )}
      </div>

      {/* Document Status Bottom Bar (responsive) */}
      <div className="h-6 sm:h-7 bg-[#0e111a] border-t border-[#1b2131] px-2 sm:px-4 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-mono select-none shrink-0 w-full">
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <span className="truncate">
            <strong className="text-violet-300 font-semibold">{words.toLocaleString()}</strong> w
          </span>
          <span className="hidden sm:inline">
            <strong className="text-slate-300">{chars.toLocaleString()}</strong> caracteres
          </span>
          <span className="flex items-center gap-1 text-slate-500 truncate">
            <Clock className="w-3 h-3 text-cyan-400 shrink-0" /> ~{readingTimeMin}m
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-slate-500 shrink-0">
          <span className="hidden md:inline">Markdown</span>
          <span>
            Estado: <strong className="text-lime-400 uppercase text-[9px] sm:text-[10px]">{file.status}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
