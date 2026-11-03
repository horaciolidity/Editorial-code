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
  FileText,
  FileCode,
  Trash2,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Check,
  Feather
} from 'lucide-react';
import {
  Project,
  ProjectFile,
  Character,
  WorldElement,
  TimelineEvent,
  AgentPermissionMode
} from '../types/editorial';

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
  onUpdateProject
}) => {
  const [chaptersOpen, setChaptersOpen] = useState(true);
  const [researchOpen, setResearchOpen] = useState(true);

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
    <aside className="w-72 bg-[#0f121a] border-r border-[#1e2330] flex flex-col h-[calc(100vh-3.5rem)] select-none text-xs">
      {/* View Switcher Bar */}
      <div className="grid grid-cols-4 p-1.5 bg-[#090b10] border-b border-[#1b202c] gap-1">
        <button
          onClick={() => onChangeTab('files')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'files'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Capítulos y Archivos del Manuscrito"
        >
          <FolderTree className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Archivos</span>
        </button>

        <button
          onClick={() => onChangeTab('characters')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'characters'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Fichas de Personajes y Relaciones"
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Personajes</span>
        </button>

        <button
          onClick={() => onChangeTab('world')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'world'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Lugares y Reglas del Universo"
        >
          <Globe2 className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Universo</span>
        </button>

        <button
          onClick={() => onChangeTab('memory')}
          className={`flex flex-col items-center justify-center py-1.5 rounded transition-colors ${
            activeTab === 'memory'
              ? 'bg-violet-950/60 text-violet-300 border border-violet-800/60 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a24]'
          }`}
          title="Memoria Editorial e Instrucciones de Continuidad"
        >
          <Brain className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Memoria</span>
        </button>
      </div>

      {/* Secondary Bar */}
      <div className="flex items-center justify-around px-2 py-1 bg-[#121620] border-b border-[#1b202c] text-[10px] text-slate-400">
        <button
          onClick={() => onChangeTab('timeline')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeTab === 'timeline' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>Cronología</span>
        </button>

        <button
          onClick={() => onChangeTab('illustrations')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeTab === 'illustrations' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Palette className="w-3 h-3 text-lime-400" />
          <span>Portadas</span>
        </button>

        <button
          onClick={() => onChangeTab('formatting')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeTab === 'formatting' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Layout className="w-3 h-3 text-violet-400" />
          <span>Maquetación</span>
        </button>

        <button
          onClick={() => onChangeTab('ai_center')}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            activeTab === 'ai_center' ? 'text-violet-300 font-semibold bg-violet-950/40' : 'hover:text-slate-200'
          }`}
        >
          <Settings className="w-3 h-3 text-amber-400" />
          <span>IA Center</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* TAB: FILES & CHAPTERS */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            {/* Chapters Section */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1 px-1">
                <button
                  onClick={() => setChaptersOpen(!chaptersOpen)}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-violet-300"
                >
                  {chaptersOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="uppercase tracking-wider text-[10px]">Capítulos ({chapters.length})</span>
                </button>
                <button
                  onClick={onCreateChapter}
                  className="p-1 rounded bg-[#1a2130] hover:bg-violet-900/40 text-violet-300 border border-[#273247] transition-colors"
                  title="Crear nuevo capítulo"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {chaptersOpen && (
                <div className="space-y-1 pl-1">
                  {chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      onClick={() => onSelectFile(ch.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                        selectedFileId === ch.id
                          ? 'bg-violet-950/60 text-violet-200 border border-violet-800/60 font-medium'
                          : 'text-slate-300 hover:bg-[#161a24] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Feather className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">{ch.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                          {ch.wordCount || 0} w
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar capítulo "${ch.name}"?`)) {
                              onDeleteFile(ch.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Research & Notes Section */}
            <div className="pt-2 border-t border-[#1d2331]">
              <div className="flex items-center justify-between text-slate-300 mb-1 px-1">
                <button
                  onClick={() => setResearchOpen(!researchOpen)}
                  className="flex items-center gap-1 font-semibold text-slate-200 hover:text-violet-300"
                >
                  {researchOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span className="uppercase tracking-wider text-[10px]">Investigación & Notas ({researchFiles.length})</span>
                </button>
                <button
                  onClick={onCreateResearchFile}
                  className="p-1 rounded bg-[#1a2130] hover:bg-cyan-900/40 text-cyan-300 border border-[#273247] transition-colors"
                  title="Nueva nota de investigación"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {researchOpen && (
                <div className="space-y-1 pl-1">
                  {researchFiles.map(rf => (
                    <div
                      key={rf.id}
                      onClick={() => onSelectFile(rf.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
                        selectedFileId === rf.id
                          ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-800/60 font-medium'
                          : 'text-slate-300 hover:bg-[#161a24] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{rf.name}</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`¿Eliminar archivo "${rf.name}"?`)) {
                            onDeleteFile(rf.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
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
                className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800 flex items-center gap-1 hover:bg-violet-900"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>

            {newCharOpen && (
              <form onSubmit={handleAddCharacter} className="p-2.5 bg-[#141822] border border-[#2b3548] rounded space-y-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nombre:</label>
                  <input
                    type="text"
                    value={newCharName}
                    onChange={e => setNewCharName(e.target.value)}
                    placeholder="Ej. Tycho Brahe"
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Rol narrativo:</label>
                  <select
                    value={newCharRole}
                    onChange={e => setNewCharRole(e.target.value as any)}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="protagonista">Protagonista</option>
                    <option value="antagonista">Antagonista</option>
                    <option value="secundario">Secundario</option>
                    <option value="mentor">Mentor</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Descripción física y personalidad:</label>
                  <textarea
                    value={newCharDesc}
                    onChange={e => setNewCharDesc(e.target.value)}
                    placeholder="Rasgos, temperamento..."
                    rows={2}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewCharOpen(false)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(currentProject?.characters || []).map(c => (
                <div key={c.id} className="p-2.5 bg-[#141824] border border-[#232b3b] rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{c.name}</span>
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
                  <p className="text-[11px] text-slate-300 line-clamp-2">{c.description}</p>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e2533]">
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
                className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1 hover:bg-cyan-900"
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>

            {newWorldOpen && (
              <form onSubmit={handleAddWorld} className="p-2.5 bg-[#141822] border border-[#2b3548] rounded space-y-2 mb-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Nombre:</label>
                  <input
                    type="text"
                    value={newWorldName}
                    onChange={e => setNewWorldName(e.target.value)}
                    placeholder="Ej. Callejón del Oro"
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Categoría:</label>
                  <select
                    value={newWorldCat}
                    onChange={e => setNewWorldCat(e.target.value as any)}
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
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
                    className="w-full bg-[#0b0e14] border border-[#252f44] rounded px-2 py-1 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setNewWorldOpen(false)}
                    className="px-2 py-1 text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {(currentProject?.world || []).map(w => (
                <div key={w.id} className="p-2.5 bg-[#141824] border border-[#232b3b] rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{w.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {w.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{w.description}</p>
                  {w.rules && (
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-[#1e2533]">
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
              {(currentProject?.timeline || []).map((t, idx) => (
                <div key={t.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#0f121a]" />
                  <div className="text-[10px] font-mono text-cyan-400 font-semibold">{t.period}</div>
                  <div className="font-semibold text-slate-100 text-[11px]">{t.title}</div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{t.description}</p>
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
              <p className="text-[11px] bg-[#141824] p-2 rounded border border-[#232b3b] leading-relaxed">
                {currentProject?.memory?.synopsis || 'Sin sinopsis registrada.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                Idea Central & Tono
              </span>
              <div className="bg-[#141824] p-2 rounded border border-[#232b3b] space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium">Núcleo:</span> {currentProject?.memory?.coreIdea}
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Tono:</span> {currentProject?.memory?.toneAndStyle}
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-lime-400 uppercase tracking-wider block mb-1">
                Reglas de Escritura y Continuidad
              </span>
              <ul className="space-y-1 bg-[#141824] p-2 rounded border border-[#232b3b] text-[11px]">
                {(currentProject?.memory?.writingRules || []).map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-lime-400 font-bold">•</span>
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
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block">
              Galería de Ilustraciones y Portadas
            </span>
            <div className="space-y-2">
              {(currentProject?.illustrations || []).map(ill => (
                <div key={ill.id} className="bg-[#141824] border border-[#252f42] rounded overflow-hidden">
                  <div className="h-28 overflow-hidden bg-slate-900 relative">
                    <img src={ill.imageUrl} alt={ill.title} className="w-full h-full object-cover" />
                    <span className="absolute top-1 right-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/70 text-lime-300 font-mono">
                      {ill.type}
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="font-semibold text-slate-100 truncate">{ill.title}</div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 italic">
                      "{ill.prompt}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FORMATTING */}
        {activeTab === 'formatting' && (
          <div className="space-y-3 text-slate-300">
            <span className="font-semibold text-slate-200 uppercase tracking-wider text-[10px] px-1 block">
              Parámetros de Maquetación
            </span>
            <div className="bg-[#141824] p-2.5 rounded border border-[#242c3e] space-y-2 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tamaño de página:</span>
                <span className="font-mono text-violet-300 font-semibold">{currentProject?.formatting?.pageSize}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tipografía:</span>
                <span className="font-serif text-slate-200">{currentProject?.formatting?.fontFamily}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Papel:</span>
                <span className="text-amber-300 capitalize">{currentProject?.formatting?.paperType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Encuadernación:</span>
                <span className="text-slate-200 capitalize">{currentProject?.formatting?.bindingType.replace('_', ' ')}</span>
              </div>
              <div className="pt-2 border-t border-[#1e2533] text-[10px] text-slate-400">
                Márgenes: Int {currentProject?.formatting?.margins.insideMm}mm • Ext {currentProject?.formatting?.margins.outsideMm}mm • Sup/Inf {currentProject?.formatting?.margins.topMm}mm
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
            <div className="bg-[#141824] p-2.5 rounded border border-[#232b3b] space-y-2">
              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                <span>Modo de Permisos del Agente</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Controla si el agente puede ejecutar cambios directamente o debe solicitar tu aprobación previa.
              </p>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['allow', 'ask', 'deny'] as AgentPermissionMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => onChangePermissionMode(mode)}
                    className={`py-1 px-1.5 rounded font-mono text-[10px] uppercase transition-colors ${
                      permissionMode === mode
                        ? 'bg-violet-600 text-white font-bold'
                        : 'bg-[#1a2130] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'allow' ? 'Automático' : mode === 'ask' ? 'Consultar' : 'Estricto'}
                  </button>
                ))}
              </div>
            </div>

            {/* Providers status */}
            <div className="bg-[#141824] p-2.5 rounded border border-[#232b3b] space-y-2 text-[11px]">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Proveedor Activo</span>
              </div>
              <div className="p-2 rounded bg-[#0d1017] border border-[#1e2536] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Google Gemini</div>
                  <div className="text-[10px] text-lime-400 font-mono">Cuota gratuita oficial activa</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400">
                Modelo asignado: <span className="font-mono text-cyan-300">gemini-3.8-flash</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
