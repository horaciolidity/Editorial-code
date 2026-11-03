import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Compass
} from 'lucide-react';
import { BookGenre, BookType, Project } from '../types/editorial';

interface NewProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Partial<Project>) => Promise<void>;
}

export const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authorName, setAuthorName] = useState('Autor');
  const [genre, setGenre] = useState<BookGenre>('terror_misterio');
  const [bookType, setBookType] = useState<BookType>('novela');
  const [language, setLanguage] = useState('es');
  const [targetAudience, setTargetAudience] = useState('Lectores adultos');
  const [toneStyle, setToneStyle] = useState('Atmósfera envolvente, suspenso y ritmo creciente');
  const [estimatedWords, setEstimatedWords] = useState(60000);
  const [estimatedChapters, setEstimatedChapters] = useState(20);
  const [depthLevel, setDepthLevel] = useState<'ligera' | 'estandar' | 'profunda_academica' | 'exhaustiva'>('estandar');
  const [narratorType, setNarratorType] = useState<'primera_persona' | 'tercera_omnisciente' | 'tercera_limitada' | 'neutro_academico'>('tercera_limitada');
  const [needResearch, setNeedResearch] = useState(true);
  const [needIllustrations, setNeedIllustrations] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>(['Amazon KDP', 'Lulu']);
  const [coreIdea, setCoreIdea] = useState('');
  const [synopsis, setSynopsis] = useState('');

  if (!isOpen) return null;

  const handleGenreChange = (g: BookGenre) => {
    setGenre(g);
    if (g === 'terror_misterio') {
      setToneStyle('Atmósfera opresiva, tensión psicológica, giros inesperados');
      setTargetAudience('Lectores de misterio y thriller');
      setNarratorType('tercera_limitada');
      setEstimatedWords(65000);
    } else if (g === 'fantasia_scifi') {
      setToneStyle('Construcción de mundo rica, tecnología/magia coherente, sentido de asombro');
      setTargetAudience('Lectores de ciencia ficción y fantasía épica');
      setEstimatedWords(85000);
      setNeedResearch(true);
    } else if (g === 'tecnico_educativo' || g === 'manual_guia') {
      setToneStyle('Didáctico, directo, con ejemplos prácticos y diagramas');
      setTargetAudience('Desarrolladores, estudiantes o profesionales');
      setNarratorType('neutro_academico');
      setEstimatedWords(35000);
      setEstimatedChapters(10);
      setDepthLevel('profunda_academica');
    } else if (g === 'infantil_juvenil') {
      setToneStyle('Ágil, lúdico, valores positivos y personajes carismáticos');
      setTargetAudience('Niños de 8 a 12 años');
      setEstimatedWords(15000);
      setNeedIllustrations(true);
    } else if (g === 'divulgacion_autoayuda') {
      setToneStyle('Empático, estructurado en pasos accionables, motivador');
      setTargetAudience('Adultos en búsqueda de crecimiento personal');
      setEstimatedWords(45000);
    }
  };

  const togglePlatform = (p: string) => {
    if (platforms.includes(p)) {
      setPlatforms(platforms.filter(x => x !== p));
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleFinish = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateProject({
        title: title.trim(),
        subtitle: subtitle.trim(),
        authorName: authorName.trim(),
        genre,
        bookType,
        language,
        targetAudience,
        toneStyle,
        estimatedWords: Number(estimatedWords),
        estimatedChapters: Number(estimatedChapters),
        depthLevel,
        narratorType,
        needResearch,
        needIllustrations,
        targetPlatforms: platforms,
        memory: {
          synopsis: synopsis.trim() || `Proyecto editorial: ${title}.`,
          coreIdea: coreIdea.trim() || 'Premisa principal del libro.',
          targetAudience,
          toneAndStyle: toneStyle,
          writingRules: [
            `Mantener el tono ${toneStyle.toLowerCase()}.`,
            'Cuidar la continuidad temporal entre capítulos.'
          ],
          narrativeContinuityNotes: [],
          sourcesAndReferences: []
        }
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 select-none">
      <div className="bg-[#10141f] border border-[#26324a] rounded-xl max-w-2xl w-full flex flex-col max-h-[92dvh] overflow-hidden shadow-2xl text-xs text-slate-200">
        {/* Wizard Header */}
        <div className="p-3 sm:p-4 bg-[#141a27] border-b border-[#212b3e] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-600/30 border border-violet-500/50 flex items-center justify-center text-violet-300 shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                Asistente de Configuración Editorial
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Paso {step} de 4 — {step === 1 ? 'Identidad & Género' : step === 2 ? 'Parámetros Narrativos' : step === 3 ? 'Extensión & Estructura' : 'Canales de Publicación'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1f283b] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress Line */}
        <div className="h-1 bg-[#1a2233] shrink-0">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-lime-400 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
          {/* STEP 1: IDENTITY & GENRE */}
          {step === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Título Provisional del Libro *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. El Canto de las Mareas Silenciosas"
                  className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 sm:p-2.5 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Subtítulo (opcional)</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={e => setSubtitle(e.target.value)}
                    placeholder="Ej. Crónicas de la Costa Negra"
                    className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none focus:border-violet-500 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nombre del Autor</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="Tu nombre o seudónimo"
                    className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none focus:border-violet-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Género Principal</label>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { id: 'terror_misterio', label: 'Terror & Misterio', icon: '🕯️' },
                    { id: 'fantasia_scifi', label: 'Fantasía & Sci-Fi', icon: '🚀' },
                    { id: 'ficcion_literaria', label: 'Ficción Literaria', icon: '📖' },
                    { id: 'romance', label: 'Romance', icon: '❤️' },
                    { id: 'infantil_juvenil', label: 'Infantil / Juvenil', icon: '🧸' },
                    { id: 'ensayo_investigacion', label: 'Ensayo / Investigación', icon: '🏛️' },
                    { id: 'tecnico_educativo', label: 'Técnico / Educativo', icon: '💻' },
                    { id: 'manual_guia', label: 'Manual & Guía', icon: '🛠️' },
                    { id: 'biografia_historia', label: 'Biografía & Historia', icon: '📜' },
                    { id: 'divulgacion_autoayuda', label: 'Divulgación / Autoayuda', icon: '🌱' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGenreChange(g.id as BookGenre)}
                      className={`p-2 rounded-lg border text-left transition-colors flex items-center gap-2 ${
                        genre === g.id
                          ? 'bg-violet-950/60 border-violet-500 text-violet-200 font-semibold'
                          : 'bg-[#121622] border-[#222c3d] text-slate-400 hover:text-slate-200 hover:bg-[#181e2e]'
                      }`}
                    >
                      <span className="text-sm sm:text-base shrink-0">{g.icon}</span>
                      <span className="truncate text-xs">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: NARRATIVE & ADAPTIVE QUESTIONS */}
          {step === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="p-2.5 sm:p-3 bg-violet-950/30 border border-violet-800/40 rounded-lg text-violet-200 text-[11px] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div className="break-words">
                  <strong className="block text-violet-100">Configuración adaptada para {genre.replace('_', ' ')}</strong>
                  El agente ajustará el tono, las fichas y la memoria de acuerdo con las convenciones de este género.
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Idea Central / Premisa Argumental
                </label>
                <textarea
                  value={coreIdea}
                  onChange={e => setCoreIdea(e.target.value)}
                  placeholder="¿Cuál es el conflicto motriz, tesis o pregunta detonante de la obra?"
                  rows={2}
                  className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 sm:p-2.5 text-slate-100 focus:outline-none focus:border-violet-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Narrador</label>
                  <select
                    value={narratorType}
                    onChange={e => setNarratorType(e.target.value as any)}
                    className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none text-xs"
                  >
                    <option value="tercera_limitada">Tercera persona limitada</option>
                    <option value="primera_persona">Primera persona íntima</option>
                    <option value="tercera_omnisciente">Tercera persona omnisciente</option>
                    <option value="neutro_academico">Tercera persona neutral / Académico</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Nivel de Profundidad</label>
                  <select
                    value={depthLevel}
                    onChange={e => setDepthLevel(e.target.value as any)}
                    className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none text-xs"
                  >
                    <option value="estandar">Estándar comercial</option>
                    <option value="ligera">Ligera y ágil</option>
                    <option value="profunda_academica">Profunda con rigor</option>
                    <option value="exhaustiva">Exhaustiva (Worldbuilding denso)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tono y Estilo Literario</label>
                <input
                  type="text"
                  value={toneStyle}
                  onChange={e => setToneStyle(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Público Objetivo</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 focus:outline-none focus:border-violet-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 3: WORD COUNT & STRUCTURE */}
          {step === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Extensión en Palabras: <span className="text-violet-400 font-mono">{estimatedWords.toLocaleString()} w</span>
                </label>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mb-2">
                  Aproximadamente {Math.round(estimatedWords / 250)} páginas en formato 6x9".
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mb-3">
                  {[
                    { label: 'Relato (10k)', val: 10000 },
                    { label: 'Novella (35k)', val: 35000 },
                    { label: 'Estándar (65k)', val: 65000 },
                    { label: 'Extensa (95k+)', val: 95000 }
                  ].map(preset => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setEstimatedWords(preset.val)}
                      className={`p-1.5 sm:p-2 rounded border text-center font-mono text-xs ${
                        estimatedWords === preset.val
                          ? 'bg-violet-950 border-violet-500 text-violet-200'
                          : 'bg-[#121622] border-[#222c3d] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={estimatedWords}
                  onChange={e => setEstimatedWords(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Capítulos Estimados</label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={estimatedChapters}
                    onChange={e => setEstimatedChapters(Number(e.target.value))}
                    className="w-full bg-[#0a0d14] border border-[#232d40] rounded-lg p-2 text-slate-100 font-mono focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Promedio por Capítulo</label>
                  <div className="p-2 rounded-lg bg-[#0a0d14] border border-[#232d40] text-slate-300 font-mono text-xs">
                    ~{Math.round(estimatedWords / (estimatedChapters || 1))} palabras / cap.
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#1e2536]">
                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={needResearch}
                    onChange={e => setNeedResearch(e.target.checked)}
                    className="rounded accent-violet-600 mt-0.5"
                  />
                  <span>Habilitar carpeta de investigación y verificación de fuentes</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={needIllustrations}
                    onChange={e => setNeedIllustrations(e.target.checked)}
                    className="rounded accent-violet-600 mt-0.5"
                  />
                  <span>Habilitar ilustraciones interiores y diseño de portadas</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: PLATFORMS & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Plataformas de Publicación Previstas
                </label>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 sm:gap-2">
                  {['Amazon KDP', 'IngramSpark', 'Lulu', 'Draft2Digital', 'Apple Books', 'Google Play Books'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        platforms.includes(p)
                          ? 'bg-violet-950/60 border-violet-500 text-violet-200 font-medium'
                          : 'bg-[#121622] border-[#222c3d] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate text-xs">{p}</span>
                      {platforms.includes(p) && <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#0a0d14] border border-[#212b3e] rounded-lg space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-200">Resumen del Proyecto:</div>
                <div className="text-slate-400 space-y-1 break-words">
                  <div>• <strong className="text-slate-200">{title}</strong> ({genre.replace('_', ' ')})</div>
                  <div>• Meta: <strong className="text-violet-300 font-mono">{estimatedWords.toLocaleString()} w</strong> en ~{estimatedChapters} capítulos</div>
                  <div>• Narrador: <strong className="text-slate-200">{narratorType.replace('_', ' ')}</strong></div>
                  <div>• Destinos: {platforms.join(', ') || 'Ninguna'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <div className="p-3 sm:p-4 bg-[#141a27] border-t border-[#212b3e] flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#1c2333] hover:bg-[#252f44] text-slate-300 font-medium transition-colors text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !title.trim()) {
                  alert('Por favor ingresa un título provisional para el libro.');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex items-center gap-1 px-3.5 sm:px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors text-xs"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold transition-all shadow-lg shadow-violet-600/30 text-xs"
            >
              <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Proyecto'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
