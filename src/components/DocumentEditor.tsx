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
  Minus,
  Check,
  RotateCcw,
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
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  file,
  onSaveContent,
  onRollbackVersion,
  onAskAgentToEdit
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
        setLastSaved(new Date().toLocaleTimeString());
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
      setLastSaved(new Date().toLocaleTimeString());
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
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b0d13] text-slate-500 select-none p-6">
        <BookOpen className="w-12 h-12 mb-3 text-slate-700" />
        <h3 className="font-semibold text-slate-300 text-sm">Ningún archivo seleccionado</h3>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
          Selecciona un capítulo o nota de investigación en la barra lateral izquierda o pide al Agente que cree uno nuevo.
        </p>
      </div>
    );
  }

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 220));

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-[#0b0d13] text-slate-200 overflow-hidden">
      {/* Document Top Bar */}
      <div className="h-10 bg-[#121622] border-b border-[#1e2538] px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-100">{file.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1c2233] text-slate-400 font-mono">
            {file.path}
          </span>
          {isSaving ? (
            <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Guardando...
            </span>
          ) : lastSaved ? (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3 h-3" /> Guardado {lastSaved}
            </span>
          ) : null}
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded bg-[#181e2b] p-0.5 border border-[#263147]">
            <button
              onClick={() => setMode('editor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-[11px] ${
                mode === 'editor'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-[11px] ${
                mode === 'preview'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Maqueta / Lectura</span>
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-[11px] ${
                mode === 'diff'
                  ? 'bg-violet-600 text-white font-medium shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCompare className="w-3 h-3" />
              <span>Comparar Diff</span>
            </button>
          </div>

          {/* Versions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowVersionMenu(!showVersionMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#181e2b] hover:bg-[#222a3d] border border-[#263147] text-slate-300 text-[11px]"
              title="Historial de versiones del capítulo"
            >
              <History className="w-3 h-3 text-cyan-400" />
              <span>v{file.versions?.length || 1}</span>
            </button>

            {showVersionMenu && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-[#121622] border border-[#263147] rounded-lg shadow-2xl p-1 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Historial de Versiones</span>
                  <button
                    onClick={() => {
                      setShowVersionMenu(false);
                      setVersionNoteModal(true);
                    }}
                    className="text-lime-400 hover:underline"
                  >
                    + Nuevo Checkpoint
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
            )}
          </div>

          {/* Manual Save Checkpoint Button */}
          <button
            onClick={() => setVersionNoteModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-violet-950 hover:bg-violet-900 border border-violet-800 text-violet-300 text-[11px] font-medium"
            title="Crear punto de restauración con nota"
          >
            <Save className="w-3 h-3" />
            <span className="hidden sm:inline">Guardar Versión</span>
          </button>
        </div>
      </div>

      {/* Manual Version Modal */}
      {versionNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121622] border border-[#29354d] rounded-lg p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              Guardar Checkpoint de Versión
            </h4>
            <p className="text-xs text-slate-400">
              Crea una instantánea histórica permanente de este capítulo para poder comparar cambios o restaurarla en cualquier momento.
            </p>
            <input
              type="text"
              value={versionNoteText}
              onChange={e => setVersionNoteText(e.target.value)}
              placeholder="Ej. Revisión de diálogos y tensión con Klára"
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

      {/* Editorial Quick Formatting Toolbar (only in editor mode) */}
      {mode === 'editor' && (
        <div className="h-8 bg-[#0e111a] border-b border-[#1b2131] px-4 flex items-center gap-1 text-slate-400 text-xs overflow-x-auto select-none">
          <button
            onClick={() => insertText('# ', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-serif font-bold"
            title="Encabezado H1"
          >
            H1
          </button>
          <button
            onClick={() => insertText('## ', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-serif font-bold"
            title="Encabezado H2"
          >
            H2
          </button>
          <div className="w-px h-3.5 bg-[#202738] mx-1" />
          <button
            onClick={() => insertText('**', '**')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200"
            title="Negrita (**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200"
            title="Cursiva (*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('—', '')}
            className="px-2 py-0.5 rounded hover:bg-violet-950/50 hover:text-violet-300 font-mono font-bold text-violet-400 border border-violet-900/40"
            title="Guión Largo / Raya de Diálogo española (—)"
          >
            — Raya
          </button>
          <button
            onClick={() => insertText('> ', '')}
            className="p-1 rounded hover:bg-[#1a2130] hover:text-slate-200"
            title="Cita narrativa"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertText('\n\n***\n\n', '')}
            className="px-2 py-0.5 rounded hover:bg-[#1a2130] hover:text-slate-200 font-mono text-[10px]"
            title="Salto de escena (***)"
          >
            *** Escena
          </button>
          <div className="w-px h-3.5 bg-[#202738] mx-1" />
          <button
            onClick={() => onAskAgentToEdit(`Mejora la tensión literaria y el estilo del capítulo actual: "${file.name}"`)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 border border-violet-800/60 text-[11px]"
            title="Pedir al Agente Editorial que pula este texto"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Pulir con Agente</span>
          </button>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'editor' && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full h-full p-6 bg-[#0a0c12] text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none selection:bg-violet-800/60"
            placeholder="Comienza a redactar o deja que el Agente Editorial desarrolle el capítulo..."
            spellCheck="true"
          />
        )}

        {mode === 'preview' && (
          <div className="w-full h-full overflow-y-auto p-10 bg-[#10131c] flex justify-center">
            {/* Book Page Simulation */}
            <div className="max-w-2xl w-full bg-[#0c0e15] border border-[#242d40] shadow-2xl p-12 rounded-sm text-slate-100 font-serif leading-loose">
              <div className="text-center font-sans text-[11px] text-slate-500 uppercase tracking-widest pb-8 mb-8 border-b border-[#1f2638]">
                {file.name}
              </div>
              <div
                className="prose prose-invert prose-p:mb-4 prose-headings:font-serif prose-headings:text-slate-100 leading-relaxed text-[15px]"
                dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
              />
              <div className="text-center font-mono text-xs text-slate-600 pt-12 mt-12 border-t border-[#1f2638]">
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

      {/* Document Status Bottom Bar */}
      <div className="h-7 bg-[#0e111a] border-t border-[#1b2131] px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-violet-300 font-semibold">{words.toLocaleString()}</strong> palabras
          </span>
          <span>
            <strong className="text-slate-300">{chars.toLocaleString()}</strong> caracteres
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3 text-cyan-400" /> ~{readingTimeMin} min lectura
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>UTF-8</span>
          <span>Markdown</span>
          <span>Estado: <strong className="text-lime-400 uppercase">{file.status}</strong></span>
        </div>
      </div>
    </div>
  );
};
