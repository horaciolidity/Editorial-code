import React, { useState } from 'react';
import {
  FolderTree,
  Users,
  Globe2,
  Clock,
  Brain,
  Palette,
  Layout,
  Settings,
  Plus,
  FileCode,
  Trash2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Feather,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Upload,
  Edit2
} from 'lucide-react';
import {
  Project,
  ProjectFile,
  Character,
  WorldElement,
  AgentPermissionMode
} from '../types/editorial';
import { DESIGN_TEMPLATES } from '../shared/design_templates';

export type SidebarTab =
  | 'files'
  | 'characters'
  | 'world'
  | 'timeline'
  | 'memory'
  | 'illustrations'
  | 'formatting'
  | 'ai_center';

interface SidebarProps {
  currentProject: Project | null;
  files: ProjectFile[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCreateChapter: () => void;
  onCreateResearchFile: () => void;
  onDeleteFile: (fileId: string) => void;
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  permissionMode: AgentPermissionMode;
  onChangePermissionMode: (mode: AgentPermissionMode) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  onReorderFiles?: (orderedFileIds: string[]) => Promise<void>;
  onRegenerateIllustration?: (payload: {
    illustrationId?: string;
    type: 'cover' | 'back_cover' | 'illustration';
    title: string;
    prompt?: string;
  }) => Promise<void>;
  isMobile?: boolean;
  onOpenAIManager?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentProject,
  files,
  selectedFileId,
  onSelectFile,
  onCreateChapter,
  onCreateResearchFile,
  onDeleteFile,
  activeTab,
  onChangeTab,
  permissionMode,
  onChangePermissionMode,
  onUpdateProject,
  onReorderFiles,
  onRegenerateIllustration,
  isMobile = false,
  onOpenAIManager
}) => {
  const [chaptersOpen, setChaptersOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(true);
  const [editingIllId, setEditingIllId] = useState<string | null>(null);
  const [editIllTitle, setEditIllTitle] = useState('');
  const [editIllPrompt, setEditIllPrompt] = useState('');
  const [regeneratingIllId, setRegeneratingIllId] = useState<string | null>(null);
  const [artStyle, setArtStyle] = useState<string>('studio_ghibli');
  const [templateCat, setTemplateCat] = useState<'book' | 'comic_manga' | 'cover'>('book');

  // New character form state
  const [newCharOpen, setNewCharOpen] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState<'protagonista' | 'antagonista' | 'secundario' | 'mentor' | 'otro'>('secundario');
  const [newCharDesc, setNewCharDesc] = useState('');

  // New world element form state
  const [newWorldOpen, setNewWorldOpen] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldCat, setNewWorldCat] = useState<'lugar' | 'faccion' | 'regla' | 'tecnologia'>('lugar');
  const [newWorldDesc, setNewWorldDesc] = useState('');

  const chapters = files.filter(f => f.type === 'chapter').sort((a, b) => a.order - b.order);
  const researchFiles = files.filter(f => f.type !== 'chapter');

  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim() || !currentProject) return;
    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      role: newCharRole,
      description: newCharDesc.trim(),
      personality: 'Definición pendiente',
      motivation: 'Objetivo narrativo',
      arc: 'Evolución',
      relationships: 'Vínculos con otros personajes'
    };
    onUpdateProject({
      characters: [...(currentProject.characters || []), newChar]
    });
    setNewCharName('');
    setNewCharDesc('');
    setNewCharOpen(false);
  };

  const handleAddWorld = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim() || !currentProject) return;
    const newElem: WorldElement = {
      id: `world-${Date.now()}`,
      name: newWorldName.trim(),
      category: newWorldCat,
      description: newWorldDesc.trim(),
      rules: 'Reglas y límites establecidos'
    };
    onUpdateProject({
      world: [...(currentProject.world || []), newElem]
    });
    setNewWorldName('');
    setNewWorldDesc('');
    setNewWorldOpen(false);
  };

  return (
    <aside
      className={`bg-[#0f121a] flex flex-col h-full select-none text-xs overflow-hidden ${
        isMobile
          ? 'w-full flex-1 border-none'
          : 'w-64 xl:w-72 shrink-0 border-r border-[#1e2330]'
      }`}
    >
      {/* Primary Tab Switcher */}
      <div className="grid grid-cols-4 p-1 sm:p-1.5 bg-[#090b10] border-b border-[#1b202c] gap-1 shrink-0">
        <button
          onClick={() => onChangeTab('files')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'files'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Capítulos y Archivos"
        >
          <FolderTree className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px]">Archivos</span>
        </button>

        <button
          onClick={() => onChangeTab('characters')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'characters'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Personajes"
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px]">Personajes</span>
        </button>

        <button
          onClick={() => onChangeTab('world')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'world'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Universo & Lugares"
        >
          <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px]">Universo</span>
        </button>

        <button
          onClick={() => onChangeTab('memory')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'memory'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Memoria Editorial"
        >
          <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 shrink-0" />
          <span className="text-[9px] sm:text-[10px]">Memoria</span>
        </button>
      </div>

      {/* Secondary Bar with horizontal scrolling for narrow screens */}
      <div className="flex items-center justify-start sm:justify-around px-2 py-1 bg-[#121620] border-b border-[#1b202c] text-[10px] text-slate-400 overflow-x-auto no-scrollbar gap-2 shrink-0">
        <button
          onClick={() => onChangeTab('timeline')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'timeline' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Cronología</span>
        </button>

        <button
          onClick={() => onChangeTab('illustrations')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'illustrations' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Palette className="w-3 h-3 text-lime-400 shrink-0" />
          <span>Portadas</span>
        </button>

        <button
          onClick={() => onChangeTab('formatting')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'formatting' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Layout className="w-3 h-3 text-violet-400 shrink-0" />
          <span>Maquetación</span>
        </button>

        <button
          onClick={() => onChangeTab('ai_center')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 shrink-0 ${
            activeTab === 'ai_center' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Settings className="w-3 h-3 text-amber-400 shrink-0" />
          <span>IA Center</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-3 min-w-0">
        {/* TAB: FILES & CHAPTERS */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            {/* Chapters Section */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1.5 px-1">
                <button
                  onClick={() => setChaptersOpen(!chaptersOpen)}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-violet-300"
                >
                  {chaptersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="uppercase tracking-wider text-[10px]">Capítulos ({chapters.length})</span>
                </button>
                <button
                  onClick={onCreateChapter}
                  className="px-2 py-1 rounded bg-[#1a2130] hover:bg-violet-900/40 text-violet-300 border border-[#273247] transition-colors flex items-center gap-1 text-[10px] font-medium"
                  title="Crear nuevo capítulo"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nuevo</span>
                </button>
              </div>

              {chaptersOpen && (
                <div className="space-y-1 pl-1">
                  {chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      onClick={() => onSelectFile(ch.id)}
                      className={`group flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded cursor-pointer transition-colors min-h-[38px] sm:min-h-[32px] ${
                        selectedFileId === ch.id
                          ? 'bg-violet-950/60 text-violet-200 border border-violet-800/60 font-medium'
                          : 'text-slate-300 hover:bg-[#161a24] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0 flex-1 mr-1">
                        <Feather className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate text-xs">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 mr-0.5">
                          {ch.wordCount || 0} w
                        </span>
                        {onReorderFiles && chapters.length > 1 && (
                          <div className="flex items-center opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (idx === 0) return;
                                const next = [...chapters];
                                [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                                const nonChapters = files.filter(f => f.type !== 'chapter').map(f => f.id);
                                onReorderFiles([...next.map(c => c.id), ...nonChapters]);
                              }}
                              disabled={idx === 0}
                              className="p-0.5 text-slate-500 hover:text-violet-300 disabled:opacity-25"
                              title="Subir capítulo"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                if (idx === chapters.length - 1) return;
                                const next = [...chapters];
                                [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                                const nonChapters = files.filter(f => f.type !== 'chapter').map(f => f.id);
                                onReorderFiles([...next.map(c => c.id), ...nonChapters]);
                              }}
                              disabled={idx === chapters.length - 1}
                              className="p-0.5 text-slate-500 hover:text-violet-300 disabled:opacity-25"
                              title="Bajar capítulo"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteFile(ch.id);
                          }}
                          className="opacity-70 sm:opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                          title="Eliminar capítulo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research & Notes Section */}
            <div className="pt-2 border-t border-[#1d2331]">
              <div className="flex items-center justify-between text-slate-300 mb-1.5 px-1">
                <button
                  onClick={() => setResearchOpen(!researchOpen)}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-violet-300"
                >
                  {researchOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="uppercase tracking-wider text-[10px]">Investigación & Notas ({researchFiles.length})</span>
                </button>
                <button
                  onClick={onCreateResearchFile}
                  className="px-2 py-1 rounded bg-[#1a2130] hover:bg-cyan-900/40 text-cyan-300 border border-[#273247] transition-colors flex items-center gap-1 text-[10px] font-medium"
                  title="Nueva nota de investigación"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nota</span>
                </button>
              </div>

              {researchOpen && (
                <div className="space-y-1 pl-1">
                  {researchFiles.map(rf => (
                    <div
                      key={rf.id}
                      onClick={() => onSelectFile(rf.id)}
                      className={`group flex items-center justify-between px-2.5 py-2 sm:py-1.5 rounded cursor-pointer transition-colors min-h-[38px] sm:min-h-[32px] ${
                        selectedFileId === rf.id
                          ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/60 font-medium'
                          : 'text-slate-300 hover:bg-[#161a24] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0 flex-1 mr-2">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate text-xs">{rf.name}</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar archivo "${rf.name}"?`)) {
                            onDeleteFile(rf.id);
                          }
                        }}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1 shrink-0"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
                Personajes ({currentProject?.characters?.length || 0})
              </span>
              <button
                onClick={() => setNewCharOpen(!newCharOpen)}
                className="px-2 py-1 rounded bg-violet-950 text-violet-300 border border-violet-800 flex items-center gap-1 hover:bg-violet-900 text-xs"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>

            {newCharOpen && (
              <form onSubmit={handleAddCharacter} className="p-2.5 bg-[#141822] border border-[#2b3548] rounded-lg space-y-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nombre:</label>
                  <input
                    type="text"
                    value={newCharName}
                    onChange={e => setNewCharName(e.target.value)}
                    placeholder="Ej. Tycho Brahe"
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Rol narrativo:</label>
                  <select
                    value={newCharRole}
                    onChange={e => setNewCharRole(e.target.value as any)}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1.5 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="protagonista">Protagonista</option>
                    <option value="antagonista">Antagonista</option>
                    <option value="secundario">Secundario</option>
                    <option value="mentor">Mentor</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Descripción y personalidad:</label>
                  <textarea
                    value={newCharDesc}
                    onChange={e => setNewCharDesc(e.target.value)}
                    placeholder="Rasgos, temperamento..."
                    rows={2}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewCharOpen(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(currentProject?.characters || []).map(c => (
                <div key={c.id} className="p-2.5 bg-[#141824] border border-[#232b3b] rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs">{c.name}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                        c.role === 'protagonista'
                          ? 'bg-violet-950 text-violet-300 border border-violet-800'
                          : c.role === 'antagonista'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {c.role}
                    </span>
                  </div>
                  {c.age && <div className="text-[10px] text-slate-400 font-mono">Edad: {c.age}</div>}
                  <p className="text-[11px] text-slate-300 line-clamp-3">{c.description}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e2533] break-words">
                    <span className="text-violet-400">Motivación:</span> {c.motivation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: WORLD & RULES */}
        {activeTab === 'world' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
                Lugares & Reglas ({currentProject?.world?.length || 0})
              </span>
              <button
                onClick={() => setNewWorldOpen(!newWorldOpen)}
                className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1 hover:bg-cyan-900 text-xs"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>

            {newWorldOpen && (
              <form onSubmit={handleAddWorld} className="p-2.5 bg-[#141822] border border-[#2b3548] rounded-lg space-y-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nombre:</label>
                  <input
                    type="text"
                    value={newWorldName}
                    onChange={e => setNewWorldName(e.target.value)}
                    placeholder="Ej. Callejón del Oro"
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Categoría:</label>
                  <select
                    value={newWorldCat}
                    onChange={e => setNewWorldCat(e.target.value as any)}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1.5 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="lugar">Lugar / Escenario</option>
                    <option value="faccion">Facción / Grupo</option>
                    <option value="regla">Regla / Ley del Mundo</option>
                    <option value="tecnologia">Tecnología / Instrumento</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Descripción y reglas:</label>
                  <textarea
                    value={newWorldDesc}
                    onChange={e => setNewWorldDesc(e.target.value)}
                    placeholder="Detalles y límites..."
                    rows={2}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewWorldOpen(false)}
                    className="px-2.5 py-1 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(currentProject?.world || []).map(w => (
                <div key={w.id} className="p-2.5 bg-[#141824] border border-[#232b3b] rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100 text-xs">{w.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {w.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 break-words">{w.description}</p>
                  {w.rules && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e2533] break-words">
                      <span className="text-cyan-400">Reglas:</span> {w.rules}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block mb-2">
              Línea Temporal & Hitos
            </span>
            <div className="relative pl-4 space-y-3 border-l-2 border-[#2b3549]">
              {(currentProject?.timeline || []).map((t) => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#0f121a]" />
                  <div className="text-[10px] font-mono text-cyan-400 font-semibold">{t.period}</div>
                  <div className="font-semibold text-slate-100 text-[11px]">{t.title}</div>
                  <p className="text-[11px] text-slate-300 mt-0.5 break-words">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: EDITORIAL MEMORY */}
        {activeTab === 'memory' && (
          <div className="space-y-3 text-slate-300">
            <div>
              <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider block mb-1">
                Sinopsis Editorial
              </span>
              <p className="text-[11px] bg-[#141824] p-2.5 rounded-lg border border-[#232b3b] leading-relaxed break-words">
                {currentProject?.memory?.synopsis || 'Sin sinopsis registrada.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Idea Central & Tono
              </span>
              <div className="bg-[#141824] p-2.5 rounded-lg border border-[#232b3b] space-y-1.5 text-[11px]">
                <div className="break-words">
                  <span className="text-slate-400 font-medium">Núcleo:</span> {currentProject?.memory?.coreIdea}
                </div>
                <div className="break-words">
                  <span className="text-slate-400 font-medium">Tono:</span> {currentProject?.memory?.toneAndStyle}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-lime-400 uppercase tracking-wider block mb-1">
                Reglas de Escritura y Continuidad
              </span>
              <ul className="space-y-1 bg-[#141824] p-2.5 rounded-lg border border-[#232b3b] text-[11px]">
                {(currentProject?.memory?.writingRules || []).map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 break-words">
                    <span className="text-lime-400 font-bold shrink-0">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB: ILLUSTRATIONS */}
        {activeTab === 'illustrations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">
                Portadas e Ilustraciones ({(currentProject?.illustrations || []).length})
              </span>
              {onRegenerateIllustration && (
                <button
                  onClick={async () => {
                    setRegeneratingIllId('new');
                    try {
                      await onRegenerateIllustration({
                        type: 'illustration',
                        title: `Ilustración ${(currentProject?.illustrations || []).length + 1}`,
                        prompt: `Escena atmosférica de ${currentProject?.title || 'la obra'}`,
                        artStyle
                      } as any);
                    } finally {
                      setRegeneratingIllId(null);
                    }
                  }}
                  disabled={regeneratingIllId === 'new'}
                  className="px-2 py-1 rounded bg-[#1a2130] hover:bg-violet-900/40 text-violet-300 border border-[#273247] transition-colors flex items-center gap-1 text-[10px] font-medium"
                  title="Generar nueva ilustración"
                >
                  <Plus className="w-3 h-3" />
                  <span>{regeneratingIllId === 'new' ? 'Creando...' : 'Nueva'}</span>
                </button>
              )}
            </div>

            {/* AI Art Style Selector */}
            <div className="bg-[#141824] p-2 rounded-lg border border-[#232b3b] space-y-1">
              <label className="text-[10px] text-slate-400 font-medium block">
                Estilo Artístico de Generación IA:
              </label>
              <select
                value={artStyle}
                onChange={e => setArtStyle(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#273247] rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              >
                <option value="studio_ghibli">Studio Ghibli (Anime Pictórico)</option>
                <option value="cinematic">Cinematográfico / Fotorrealista</option>
                <option value="fantasy_oil">Fantasía Épica (Óleo Editorial)</option>
                <option value="anime_manga">Manga / Anime Japonés</option>
                <option value="watercolor_storybook">Acuarela Infantil / Cuento</option>
                <option value="dark_noir">Novela Gráfica Noir Oscuro</option>
                <option value="editorial_minimal">Minimalista Editorial</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {(currentProject?.illustrations || []).map(ill => (
                <div key={ill.id} className="bg-[#141824] border border-[#252f42] rounded-lg overflow-hidden">
                  <div className="h-32 sm:h-36 overflow-hidden bg-slate-900 relative group">
                    <img src={ill.imageUrl} alt={ill.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1.5 left-1.5 text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/75 text-lime-300 font-mono">
                      {ill.type === 'portada' ? 'Portada' : ill.type === 'contraportada' ? 'Contraportada' : 'Ilustración'}
                    </span>
                  </div>

                  <div className="p-2.5 space-y-2">
                    {editingIllId === ill.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={editIllTitle}
                          onChange={e => setEditIllTitle(e.target.value)}
                          className="w-full bg-[#0a0d14] border border-[#2a364d] rounded px-2 py-1 text-xs text-slate-100"
                          placeholder="Título"
                        />
                        <textarea
                          value={editIllPrompt}
                          onChange={e => setEditIllPrompt(e.target.value)}
                          rows={2}
                          className="w-full bg-[#0a0d14] border border-[#2a364d] rounded px-2 py-1 text-[11px] text-slate-200 resize-none"
                          placeholder="Descripción / Prompt visual"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setEditingIllId(null)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-slate-200"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              const updated = (currentProject?.illustrations || []).map(item =>
                                item.id === ill.id ? { ...item, title: editIllTitle, prompt: editIllPrompt } : item
                              );
                              onUpdateProject({ illustrations: updated });
                              setEditingIllId(null);
                            }}
                            className="px-2.5 py-0.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-medium"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-100 truncate text-xs">{ill.title}</div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                          "{ill.prompt}"
                        </p>
                      </>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-[#1e2533] gap-1">
                      <div className="flex items-center gap-1">
                        {onRegenerateIllustration && (
                          <button
                            onClick={async () => {
                              setRegeneratingIllId(ill.id);
                              try {
                                await onRegenerateIllustration({
                                  illustrationId: ill.id,
                                  type: (ill.type as any) || 'illustration',
                                  title: ill.title,
                                  prompt: ill.prompt,
                                  artStyle
                                } as any);
                              } finally {
                                setRegeneratingIllId(null);
                              }
                            }}
                            disabled={regeneratingIllId === ill.id}
                            className="flex items-center gap-1 px-1.5 py-1 rounded bg-[#1a2130] hover:bg-violet-950/60 text-violet-300 text-[10px]"
                            title="Regenerar arte"
                          >
                            <RefreshCw className={`w-3 h-3 ${regeneratingIllId === ill.id ? 'animate-spin' : ''}`} />
                            <span>Regenerar</span>
                          </button>
                        )}

                        <label
                          className="flex items-center gap-1 px-1.5 py-1 rounded bg-[#1a2130] hover:bg-[#232c40] text-slate-300 text-[10px] cursor-pointer"
                          title="Subir o reemplazar imagen"
                        >
                          <Upload className="w-3 h-3 text-cyan-400" />
                          <span>Subir</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUrl = reader.result as string;
                                const updated = (currentProject?.illustrations || []).map(item =>
                                  item.id === ill.id ? { ...item, imageUrl: dataUrl } : item
                                );
                                onUpdateProject({ illustrations: updated });
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingIllId(ill.id);
                            setEditIllTitle(ill.title);
                            setEditIllPrompt(ill.prompt);
                          }}
                          className="p-1 rounded hover:bg-[#1e2536] text-slate-400 hover:text-slate-200"
                          title="Editar título o prompt"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = (currentProject?.illustrations || []).filter(item => item.id !== ill.id);
                            onUpdateProject({ illustrations: updated });
                          }}
                          className="p-1 rounded hover:bg-[#1e2536] text-slate-400 hover:text-rose-400"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FORMATTING & DESIGN TEMPLATES */}
        {activeTab === 'formatting' && (
          <div className="space-y-3 text-slate-300">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block">
              Plantillas de Diseño Visual
            </span>

            {/* Template Category Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#0b0e16] p-1 rounded-lg border border-[#1f2738] text-[10px]">
              {[
                { id: 'book', label: 'Libros (7)' },
                { id: 'comic_manga', label: 'Cómic/Manga' },
                { id: 'cover', label: 'Portadas (7)' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setTemplateCat(c.id as any)}
                  className={`py-1 px-1.5 rounded font-medium transition-colors truncate ${
                    templateCat === c.id
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Visual Template Cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {DESIGN_TEMPLATES.filter(t => t.category === templateCat).map(tpl => {
                const isSelected =
                  templateCat === 'cover'
                    ? currentProject?.formatting?.coverTemplateId === tpl.id
                    : currentProject?.formatting?.templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      if (!currentProject?.formatting) return;
                      if (templateCat === 'cover') {
                        onUpdateProject({
                          formatting: {
                            ...currentProject.formatting,
                            coverTemplateId: tpl.id,
                            accentColor: tpl.palette.accent
                          }
                        });
                      } else {
                        onUpdateProject({
                          formatting: {
                            ...currentProject.formatting,
                            templateId: tpl.id,
                            fontFamily: tpl.fontFamily,
                            chapterTitleStyle: tpl.chapterTitleStyle,
                            imagePlacement: tpl.imagePlacement,
                            decorativeStyle: tpl.decorativeStyle,
                            accentColor: tpl.palette.accent,
                            backgroundColor: tpl.palette.bg,
                            textColor: tpl.palette.text
                          }
                        });
                      }
                    }}
                    className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-950/40'
                        : 'border-[#232c3f] bg-[#131722] hover:border-slate-600'
                    }`}
                  >
                    {/* Live Mini Visual Preview */}
                    <div
                      className="w-11 h-14 rounded shrink-0 flex flex-col justify-between p-1.5 border shadow-inner"
                      style={{
                        backgroundColor: tpl.palette.bg,
                        borderColor: tpl.palette.border,
                        fontFamily: tpl.fontFamily
                      }}
                    >
                      <div
                        className="h-1.5 w-7 rounded-xs"
                        style={{ backgroundColor: tpl.palette.accent }}
                      />
                      <div className="space-y-1">
                        <div
                          className="h-1 w-full rounded-xs opacity-80"
                          style={{ backgroundColor: tpl.palette.text }}
                        />
                        <div
                          className="h-1 w-5 rounded-xs opacity-60"
                          style={{ backgroundColor: tpl.palette.text }}
                        />
                      </div>
                      <div
                        className="h-2.5 w-full rounded-xs opacity-35"
                        style={{ backgroundColor: tpl.palette.accent }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-100 text-xs truncate">{tpl.name}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug mt-0.5">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Formatting Controls */}
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block pt-1">
              Personalización Editorial
            </span>
            <div className="bg-[#141824] p-2.5 rounded-lg border border-[#242c3e] space-y-2.5 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1 text-[10px]">Tamaño de página</label>
                <select
                  value={currentProject?.formatting?.pageSize || '6x9'}
                  onChange={e =>
                    currentProject?.formatting &&
                    onUpdateProject({
                      formatting: { ...currentProject.formatting, pageSize: e.target.value as any }
                    })
                  }
                  className="w-full bg-[#0a0d14] border border-[#263147] rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="6x9">6" × 9" (Novela Estándar)</option>
                  <option value="5x8">5" × 8" (Bolsillo / Cuento)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="A4">A4 (Cómic / Manual)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[10px]">Tipografía</label>
                <select
                  value={currentProject?.formatting?.fontFamily || 'Georgia, serif'}
                  onChange={e =>
                    currentProject?.formatting &&
                    onUpdateProject({
                      formatting: { ...currentProject.formatting, fontFamily: e.target.value }
                    })
                  }
                  className="w-full bg-[#0a0d14] border border-[#263147] rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="Georgia, serif">Georgia (Clásica Literaria)</option>
                  <option value="Inter, system-ui, sans-serif">Inter (Moderna Minimalista)</option>
                  <option value="Palatino, Georgia, serif">Palatino (Editorial Vintage)</option>
                  <option value="Verdana, sans-serif">Verdana (Infantil / Lectura Fácil)</option>
                  <option value="Courier New, monospace">Courier (Guion / Cómic)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[10px]">Ubicación de Imágenes</label>
                <select
                  value={currentProject?.formatting?.imagePlacement || 'inline'}
                  onChange={e =>
                    currentProject?.formatting &&
                    onUpdateProject({
                      formatting: { ...currentProject.formatting, imagePlacement: e.target.value as any }
                    })
                  }
                  className="w-full bg-[#0a0d14] border border-[#263147] rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="top">Al inicio del capítulo</option>
                  <option value="inline">Integrada en la escena</option>
                  <option value="full_bleed">Página completa (Cómic/Álbum)</option>
                  <option value="side_by_side">Junto al texto (Educativo)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 text-[10px]">Numeración de páginas</span>
                <input
                  type="checkbox"
                  checked={currentProject?.formatting?.pageNumbering ?? true}
                  onChange={e =>
                    currentProject?.formatting &&
                    onUpdateProject({
                      formatting: { ...currentProject.formatting, pageNumbering: e.target.checked }
                    })
                  }
                  className="accent-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: AI CENTER */}
        {activeTab === 'ai_center' && (
          <div className="space-y-3 text-slate-300">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block">
              Centro de IA y Gobernanza
            </span>

            {/* Permission Mode selector */}
            <div className="bg-[#141824] p-2.5 rounded-lg border border-[#232b3b] space-y-2">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                <span>Modo de Permisos del Agente</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Controla si el agente ejecuta cambios directamente o solicita tu aprobación previa.
              </p>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['allow', 'ask', 'deny'] as AgentPermissionMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onChangePermissionMode(mode)}
                    className={`py-1.5 px-1 rounded font-mono text-[10px] uppercase transition-colors text-center ${
                      permissionMode === mode
                        ? 'bg-violet-600 text-white font-bold shadow'
                        : 'bg-[#1a2130] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'allow' ? 'Auto' : mode === 'ask' ? 'Consultar' : 'Estricto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Provider & Enrutador IA */}
            <div className="bg-[#141824] p-2.5 rounded-lg border border-[#232b3b] space-y-2.5 text-[11px]">
              <div className="font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Enrutador Multi-Proveedor</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-950 text-lime-300 border border-lime-800/40 font-mono font-semibold">
                  7 Proveedores
                </span>
              </div>

              <div className="p-2 rounded bg-[#0d1017] border border-[#1e2536] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Modo de Operación:</span>
                  <span className="text-cyan-300 font-mono text-[10px]">Free-First Auto</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Prioridad de Cascada:
                </div>
                <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/40">1. Gemini</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/40">2. Groq</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/40">3. Cerebras</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/40">4. OpenRouter</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/40">5. DeepSeek</span>
                </div>
              </div>

              {onOpenAIManager && (
                <button
                  onClick={onOpenAIManager}
                  className="w-full py-2 px-2.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-900/30 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gestionar Proveedores & Claves</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
