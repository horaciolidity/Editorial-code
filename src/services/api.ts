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
  requestedModel: string;
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

export async function fetchAIProviders() {
  try {
    const res = await fetch('/api/ai/providers');
    if (!res.ok) throw new Error('Error');
    return res.json();
  } catch {
    return {
      hasServerGeminiKey: true,
      activeProvider: 'gemini',
      providers: []
    };
  }
}
