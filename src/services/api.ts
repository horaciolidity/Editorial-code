import {
  Project,
  ProjectFile,
  AgentMessage,
  BackgroundTask,
  ToolCall,
  SpecialistRole,
  AgentPermissionMode,
  AISettings
} from '../types/editorial';
import { getDefaultProviders, DEFAULT_ROUTER_SETTINGS } from '../shared/ai_providers_registry';
import { DeploymentDiagnostics, ProviderState } from '../types/ai_providers';

// Cache keys
const CACHE_PROJECTS_KEY = 'editorial_code_projects_cache';
const CACHE_FILES_PREFIX = 'editorial_code_files_';
const OFFLINE_CHANGES_QUEUE = 'editorial_code_offline_queue';

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// ---------------- LOCAL STORAGE / OFFLINE CACHE ---------------- //
export function getCachedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(CACHE_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedProjects(projects: Project[]) {
  try {
    localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export function getCachedFiles(projectId: string): ProjectFile[] {
  try {
    const raw = localStorage.getItem(`${CACHE_FILES_PREFIX}${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedFiles(projectId: string, files: ProjectFile[]) {
  try {
    localStorage.setItem(`${CACHE_FILES_PREFIX}${projectId}`, JSON.stringify(files));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// ---------------- API CLIENT FUNCTIONS ---------------- //

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Project[] = await res.json();
    setCachedProjects(data);
    return data;
  } catch (err) {
    console.warn('Fetching projects from offline cache due to:', err);
    return getCachedProjects();
  }
}

export async function fetchProject(id: string): Promise<Project | null> {
  try {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Project = await res.json();
    // update in cached projects list
    const cached = getCachedProjects();
    const idx = cached.findIndex(p => p.id === id);
    if (idx >= 0) cached[idx] = data;
    else cached.push(data);
    setCachedProjects(cached);
    return data;
  } catch (err) {
    const cached = getCachedProjects().find(p => p.id === id);
    return cached || null;
  }
}

export async function createProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Error al crear proyecto');
  const project: Project = await res.json();
  const cached = getCachedProjects();
  cached.unshift(project);
  setCachedProjects(cached);
  return project;
}

export async function autoGenerateProject(params: {
  bookType: string;
  title?: string;
  instructions?: string;
  language?: string;
  targetWords?: number;
  author?: string;
}): Promise<{ project: Project; files: ProjectFile[]; generatedWithAI: boolean; providerUsed?: string }> {
  const res = await fetch('/api/projects/auto-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al generar proyecto automáticamente');
  }
  const data = await res.json();
  const cached = getCachedProjects();
  cached.unshift(data.project);
  setCachedProjects(cached);
  setCachedFiles(data.project.id, data.files || []);
  return data;
}

export async function reorderProjectFiles(projectId: string, orderedFileIds: string[]): Promise<ProjectFile[]> {
  const res = await fetch(`/api/projects/${projectId}/files/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedFileIds })
  });
  if (!res.ok) throw new Error('Error al reordenar capítulos');
  const files: ProjectFile[] = await res.json();
  setCachedFiles(projectId, files);
  return files;
}

export async function regenerateIllustration(
  projectId: string,
  payload: { illustrationId?: string; type: 'cover' | 'back_cover' | 'illustration'; title: string; prompt?: string }
): Promise<{ project: Project; illustration: any }> {
  const res = await fetch(`/api/projects/${projectId}/illustrations/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error al regenerar arte');
  const data = await res.json();
  const cached = getCachedProjects();
  const idx = cached.findIndex(p => p.id === projectId);
  if (idx >= 0) cached[idx] = data.project;
  setCachedProjects(cached);
  return data;
}

export async function rewriteContentWithAI(params: {
  projectId: string;
  fileId?: string;
  content: string;
  instruction?: string;
}): Promise<{ content: string; provider?: string }> {
  const res = await fetch('/api/ai/rewrite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al reescribir con IA');
  }
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  try {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Error al actualizar proyecto');
    const updated: Project = await res.json();
    const cached = getCachedProjects();
    const idx = cached.findIndex(p => p.id === id);
    if (idx >= 0) cached[idx] = updated;
    setCachedProjects(cached);
    return updated;
  } catch (err) {
    // Offline fallback update
    const cached = getCachedProjects();
    const idx = cached.findIndex(p => p.id === id);
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...updates, updatedAt: new Date().toISOString() };
      setCachedProjects(cached);
      return cached[idx];
    }
    throw err;
  }
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  const cached = getCachedProjects().filter(p => p.id !== id);
  setCachedProjects(cached);
}

// ---------------- FILES ---------------- //
export async function fetchFiles(projectId: string): Promise<ProjectFile[]> {
  try {
    const res = await fetch(`/api/projects/${projectId}/files`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const files: ProjectFile[] = await res.json();
    setCachedFiles(projectId, files);
    return files;
  } catch (err) {
    console.warn('Fetching files from offline cache');
    return getCachedFiles(projectId);
  }
}

export async function createFile(projectId: string, fileData: Partial<ProjectFile>): Promise<ProjectFile> {
  const res = await fetch(`/api/projects/${projectId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fileData)
  });
  if (!res.ok) throw new Error('Error al crear archivo');
  const file: ProjectFile = await res.json();
  const cached = getCachedFiles(projectId);
  cached.push(file);
  setCachedFiles(projectId, cached);
  return file;
}

export async function updateFile(
  projectId: string,
  fileId: string,
  updates: Partial<ProjectFile> & { createVersion?: boolean; summary?: string; author?: string }
): Promise<ProjectFile> {
  try {
    const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Error al guardar archivo en el servidor');
    const updated: ProjectFile = await res.json();
    const cached = getCachedFiles(projectId);
    const idx = cached.findIndex(f => f.id === fileId);
    if (idx >= 0) cached[idx] = updated;
    setCachedFiles(projectId, cached);
    return updated;
  } catch (err) {
    // Save in offline cache
    const cached = getCachedFiles(projectId);
    const idx = cached.findIndex(f => f.id === fileId);
    if (idx >= 0) {
      const file = cached[idx];
      const newContent = updates.content !== undefined ? updates.content : file.content;
      const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length;
      cached[idx] = {
        ...file,
        ...updates,
        content: newContent,
        wordCount,
        updatedAt: new Date().toISOString()
      };
      setCachedFiles(projectId, cached);
      return cached[idx];
    }
    throw err;
  }
}

export async function deleteFile(projectId: string, fileId: string): Promise<void> {
  await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
  const cached = getCachedFiles(projectId).filter(f => f.id !== fileId);
  setCachedFiles(projectId, cached);
}

export async function rollbackFileVersion(projectId: string, fileId: string, versionNumber: number): Promise<ProjectFile> {
  const res = await fetch(`/api/projects/${projectId}/files/${fileId}/rollback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ versionNumber })
  });
  if (!res.ok) throw new Error('Error al restaurar versión');
  const restored: ProjectFile = await res.json();
  const cached = getCachedFiles(projectId);
  const idx = cached.findIndex(f => f.id === fileId);
  if (idx >= 0) cached[idx] = restored;
  setCachedFiles(projectId, cached);
  return restored;
}

// ---------------- AGENT ---------------- //
export async function sendAgentMessage(params: {
  projectId: string;
  message: string;
  specialistRole: SpecialistRole;
  permissionMode: AgentPermissionMode;
  requestedModel?: string;
  requestedProvider?: string;
  taskType?: string;
}): Promise<AgentMessage> {
  const res = await fetch('/api/agent/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Error al comunicarse con el agente editorial');
  }
  return res.json();
}

export async function approveAgentTool(params: {
  projectId: string;
  toolCall: ToolCall;
  action: 'approve' | 'reject';
}): Promise<{ status: string; result?: any }> {
  const res = await fetch('/api/agent/approve-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Error al procesar aprobación');
  return res.json();
}

// ---------------- BACKGROUND TASKS ---------------- //
export async function fetchProjectTasks(projectId: string): Promise<BackgroundTask[]> {
  try {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function createProjectTask(projectId: string, taskData: Partial<BackgroundTask>): Promise<BackgroundTask> {
  const res = await fetch(`/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Error al crear tarea');
  return res.json();
}

export async function updateTaskAction(projectId: string, taskId: string, action: 'pause' | 'resume' | 'cancel' | 'complete'): Promise<BackgroundTask> {
  const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error('Error al actualizar tarea');
  return res.json();
}

// ---------------- AI PROVIDERS & MULTI-MODEL ROUTER (PORTABLE ARCHITECTURE) ---------------- //

function getLocalStoredKeys(): Record<string, string> {
  try {
    const raw = localStorage.getItem('editorial_code_ai_keys');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalStoredKey(providerId: string, key: string) {
  try {
    const keys = getLocalStoredKeys();
    if (!key || key.trim() === '') {
      delete keys[providerId];
    } else {
      keys[providerId] = key.trim();
    }
    localStorage.setItem('editorial_code_ai_keys', JSON.stringify(keys));
  } catch {}
}

function getLocalStoredConfigs(): Record<string, { enabled?: boolean; defaultModel?: string }> {
  try {
    const raw = localStorage.getItem('editorial_code_provider_config');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalStoredConfig(providerId: string, updates: { enabled?: boolean; defaultModel?: string }) {
  try {
    const configs = getLocalStoredConfigs();
    configs[providerId] = { ...(configs[providerId] || {}), ...updates };
    localStorage.setItem('editorial_code_provider_config', JSON.stringify(configs));
  } catch {}
}

export function getPortableFallbackProviders(): ProviderState[] {
  const base = getDefaultProviders();
  const keys = getLocalStoredKeys();
  const configs = getLocalStoredConfigs();

  return base.map(p => {
    const customKey = keys[p.id];
    const cfg = configs[p.id];

    const isConfigured = Boolean(customKey && customKey.length > 0);
    const maskedKey = isConfigured
      ? (customKey.length <= 8 ? '••••••••' : `${customKey.slice(0, 3)}••••••••${customKey.slice(-4)}`)
      : undefined;

    return {
      ...p,
      isConfigured: p.isConfigured || isConfigured,
      hasCustomKey: Boolean(customKey),
      maskedKey: p.maskedKey || maskedKey,
      status: isConfigured ? 'active' : p.status,
      enabled: cfg?.enabled !== undefined ? cfg.enabled : p.enabled,
      defaultModel: cfg?.defaultModel || p.defaultModel
    };
  });
}

export async function fetchAIProviders() {
  try {
    const res = await fetch('/api/ai/providers');
    if (!res.ok) throw new Error('Servidor backend no disponible');
    const data = await res.json();
    if (data.providers && Array.isArray(data.providers) && data.providers.length > 0) {
      return data;
    }
    throw new Error('Lista de proveedores vacía en servidor');
  } catch (e) {
    // Portable fallback: guarantees all 8 providers are always accessible
    const portableProviders = getPortableFallbackProviders();
    return {
      providers: portableProviders,
      settings: DEFAULT_ROUTER_SETTINGS,
      hasServerGeminiKey: false,
      isOfflineFallback: true
    };
  }
}

export async function saveProviderApiKey(providerId: string, apiKey: string) {
  // Always update local cache so client retains key across deployments
  setLocalStoredKey(providerId, apiKey);
  try {
    const res = await fetch(`/api/ai/providers/${providerId}/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    if (res.ok) {
      return res.json();
    }
  } catch {}

  // Portable local fallback if backend is unavailable or running on static host
  const providers = getPortableFallbackProviders();
  return { success: true, providers, isLocal: true };
}

export async function updateProviderConfig(providerId: string, updates: { enabled?: boolean; defaultModel?: string }) {
  setLocalStoredConfig(providerId, updates);
  try {
    const res = await fetch(`/api/ai/providers/${providerId}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      return res.json();
    }
  } catch {}

  const providers = getPortableFallbackProviders();
  const provider = providers.find(p => p.id === providerId);
  return { success: true, provider, providers, isLocal: true };
}

export async function testProviderApi(providerId: string) {
  try {
    const res = await fetch(`/api/ai/providers/${providerId}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return res.json();
    }
    const errData = await res.json().catch(() => ({}));
    if (errData.message) return errData;
  } catch {}

  const keys = getLocalStoredKeys();
  const key = keys[providerId];
  if (!key) {
    return { success: false, message: 'Falta la API Key del proveedor en el almacenamiento local o del servidor.' };
  }
  return {
    success: true,
    message: `Clave almacenada localmente para ${providerId.toUpperCase()} (Modo Standalone / Portable).`
  };
}

export async function fetchAISettings() {
  try {
    const res = await fetch('/api/ai/settings');
    if (res.ok) return res.json();
  } catch {}
  return DEFAULT_ROUTER_SETTINGS;
}

export async function updateAIRouterSettings(updates: any) {
  try {
    const res = await fetch('/api/ai/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) return res.json();
  } catch {}
  return { ...DEFAULT_ROUTER_SETTINGS, ...updates };
}

export async function fetchAIFallbackHistory() {
  try {
    const res = await fetch('/api/ai/fallbacks');
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function fetchAIDiagnostics(): Promise<DeploymentDiagnostics> {
  try {
    const res = await fetch('/api/ai/diagnostics');
    if (res.ok) {
      return res.json();
    }
  } catch {}

  // Standalone diagnostic generation if backend is unavailable
  const providers = getPortableFallbackProviders();
  const configured = providers.filter(p => p.isConfigured);

  return {
    environment: 'production',
    backendConnected: false,
    deploymentPlatform: 'Cliente Web Autónomo (Standalone / Static)',
    registryLoaded: true,
    totalRegisteredProviders: providers.length,
    configuredProvidersCount: configured.length,
    configuredProviderIds: configured.map(p => p.id),
    missingEnvironmentVariables: ['Backend server no contactable por HTTP (/api/*)'],
    detectedEnvironmentVariables: [],
    lastProviderError: 'El backend Express no está respondiendo en /api/ai/diagnostics. La aplicación opera con persistencia local en el navegador.',
    hasServerGeminiKey: false,
    diagnosticTimestamp: new Date().toISOString(),
    warnings: [
      'El backend Express no está activo en esta URL o estás ejecutando un despliegue estático en Vercel/Netlify sin serverless functions.',
      'Todas las configuraciones y claves de los 8 proveedores se están preservando en el navegador (localStorage) para garantizar continuidad total.'
    ],
    deploymentRecommendations: [
      'Si despliegas en Vercel, asegúrate de que api/index.ts y vercel.json estén presentes.',
      'Si despliegas en Docker, Cloud Run o Railway, arranca con "npm start" para levantar el servidor backend.',
      'Puedes configurar las claves API directamente desde esta pantalla en "Proveedores & Claves".'
    ]
  };
}

