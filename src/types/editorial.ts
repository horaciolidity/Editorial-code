export type BookGenre =
  | 'ficcion_literaria'
  | 'terror_misterio'
  | 'fantasia_scifi'
  | 'romance'
  | 'infantil_juvenil'
  | 'ensayo_investigacion'
  | 'tecnico_educativo'
  | 'manual_guia'
  | 'biografia_historia'
  | 'recetario'
  | 'enciclopedia'
  | 'divulgacion_autoayuda';

export type BookType = 'novela' | 'cuentos' | 'comic' | 'serie' | 'ensayo' | 'manual' | 'guia' | 'biografia' | 'antologia' | 'obra_tecnica';

export type SpecialistRole =
  | 'director'
  | 'investigador'
  | 'autor'
  | 'editor'
  | 'corrector'
  | 'revisor_tecnico'
  | 'ilustrador'
  | 'disenador'
  | 'maquetador'
  | 'publicador';

export type AgentPermissionMode = 'allow' | 'ask' | 'deny';

export interface Character {
  id: string;
  name: string;
  role: 'protagonista' | 'antagonista' | 'secundario' | 'mentor' | 'otro';
  age?: string;
  description: string;
  personality: string;
  motivation: string;
  arc: string;
  relationships: string;
}

export interface WorldElement {
  id: string;
  name: string;
  category: 'lugar' | 'faccion' | 'regla' | 'tecnologia' | 'magia' | 'cultura';
  description: string;
  rules: string;
}

export interface TimelineEvent {
  id: string;
  order: number;
  period: string;
  title: string;
  description: string;
  characters: string[];
  chapterRef?: string;
}

export interface EditorialMemory {
  synopsis: string;
  coreIdea: string;
  targetAudience: string;
  toneAndStyle: string;
  writingRules: string[];
  narrativeContinuityNotes: string[];
  sourcesAndReferences: string[];
}

export interface FileVersion {
  id: string;
  versionNumber: number;
  timestamp: string;
  author: string; // 'user' | 'agent:autor' etc
  summary: string;
  content: string;
  wordCount: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  path: string;
  type: 'chapter' | 'research' | 'character' | 'note' | 'outline' | 'frontmatter' | 'backmatter';
  content: string;
  wordCount: number;
  order: number;
  status: 'draft' | 'in_progress' | 'reviewed' | 'final';
  versions: FileVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface Illustration {
  id: string;
  title: string;
  prompt: string;
  type: 'interior' | 'portada' | 'contraportada' | 'mapa' | 'personaje' | 'escenario';
  imageUrl: string;
  aspectRatio: string;
  chapterRef?: string;
  status: 'pending' | 'generated' | 'approved';
  createdAt: string;
}

export interface BookFormatting {
  pageSize: 'A5' | 'A4' | '5x8' | '6x9' | 'custom';
  customWidthMm?: number;
  customHeightMm?: number;
  margins: {
    topMm: number;
    bottomMm: number;
    insideMm: number;
    outsideMm: number;
  };
  bleedMm: number;
  fontFamily: string;
  fontSizePt: number;
  lineHeight: number;
  paperType: 'crema' | 'blanco';
  bindingType: 'tapa_blanda' | 'tapa_dura' | 'ebook';
  colorMode: 'byn' | 'color';
  includeHeaderFooter: boolean;
  pageNumbering: boolean;
  dropCaps: boolean;
  runningTitle: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  authorName: string;
  genre: BookGenre;
  bookType: BookType;
  language: string;
  targetAudience: string;
  toneStyle: string;
  narratorType: 'primera_persona' | 'tercera_omnisciente' | 'tercera_limitada' | 'segunda_persona' | 'neutro_academico';
  estimatedWords: number;
  estimatedChapters: number;
  depthLevel: 'ligera' | 'estandar' | 'profunda_academica' | 'exhaustiva';
  needResearch: boolean;
  needIllustrations: boolean;
  targetPlatforms: string[];
  createdAt: string;
  updatedAt: string;
  
  memory: EditorialMemory;
  characters: Character[];
  world: WorldElement[];
  timeline: TimelineEvent[];
  formatting: BookFormatting;
  illustrations: Illustration[];
}

export interface ToolCall {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'requires_approval' | 'approved' | 'rejected' | 'running' | 'completed' | 'failed';
  error?: string;
  timestamp: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  specialistRole?: SpecialistRole;
  text: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: string;
  fallbackNotice?: string;
  thought?: string;
  plan?: string[];
  toolCalls?: ToolCall[];
  checkpoints?: string[];
  continuityAlerts?: string[];
  status?: 'thinking' | 'planning' | 'executing' | 'done' | 'error';
}

export interface BackgroundTask {
  id: string;
  name: string;
  description: string;
  progress: number; // 0 - 100
  status: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  totalSteps: number;
  logs: string[];
  checkpoints: string[];
  affectedFiles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'deepseek' | 'openrouter' | 'local';
  isConfigured: boolean;
  hasCustomKey: boolean;
  enabled: boolean;
  models: {
    id: string;
    name: string;
    tier: 'free' | 'low_cost' | 'paid';
    contextTokens: number;
    capabilities: string[];
  }[];
}

export interface AISettings {
  mode: 'free_priority' | 'free_only' | 'budget_limit' | 'manual';
  currentProvider: string;
  currentModel: string;
  permissions: {
    create_chapter: AgentPermissionMode;
    edit_chapter: AgentPermissionMode;
    delete_chapter: AgentPermissionMode;
    delete_project: AgentPermissionMode;
    modify_memory: AgentPermissionMode;
    publish_external: AgentPermissionMode;
  };
  taskModelMapping: {
    writing: string;
    research: string;
    editing: string;
    proofreading: string;
    analysis: string;
    illustration: string;
  };
  tokensUsed: number;
  estimatedCostUsd: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  hasUnsavedOfflineChanges: boolean;
  lastSyncedAt: string | null;
  conflictDetected: boolean;
  conflictDetails?: {
    fileId: string;
    fileName: string;
    localVersion: string;
    remoteVersion: string;
  };
}
