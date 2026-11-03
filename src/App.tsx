import React, { useState, useEffect } from 'react';
import {
  Project,
  ProjectFile,
  AgentMessage,
  SpecialistRole,
  AgentPermissionMode,
  BackgroundTask,
  ToolCall
} from './types/editorial';
import {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  fetchFiles,
  createFile,
  updateFile,
  deleteFile,
  rollbackFileVersion,
  sendAgentMessage,
  approveAgentTool,
  fetchProjectTasks,
  createProjectTask,
  updateTaskAction,
  isOnline as checkIsOnline
} from './services/api';
import { Header } from './components/Header';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { DocumentEditor } from './components/DocumentEditor';
import { AgentPanel } from './components/AgentPanel';
import { BottomDrawer } from './components/BottomDrawer';
import { NewProjectWizard } from './components/NewProjectWizard';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  // Agent State
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [specialistRole, setSpecialistRole] = useState<SpecialistRole>('director');
  const [permissionMode, setPermissionMode] = useState<AgentPermissionMode>('ask');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  // UI Views & Drawers
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('files');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(checkIsOnline());
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Background Tasks & Logs
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [activityLogs, setActivityLogs] = useState<{
    timestamp: string;
    level: 'info' | 'warn' | 'success' | 'tool';
    message: string;
  }[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      message: 'Estudio Editorial Code inicializado con soporte autónomo OpenCode.'
    }
  ]);

  // Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addLog('success', 'Conexión restablecida con el servidor. Sincronización en línea.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog('warn', 'Sin conexión de red. Activado modo Offline local en IndexedDB/LocalStorage.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addLog = (level: 'info' | 'warn' | 'success' | 'tool', message: string) => {
    setActivityLogs(prev => [
      { timestamp: new Date().toLocaleTimeString(), level, message },
      ...prev.slice(0, 99)
    ]);
  };

  // Initial Load Projects
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const list = await fetchProjects();
      setProjects(list);
      if (list.length > 0 && !currentProjectId) {
        selectProject(list[0].id);
      }
    } catch (err: any) {
      addLog('warn', `Error cargando proyectos: ${err.message}`);
    }
  };

  // Select project
  const selectProject = async (projId: string) => {
    setCurrentProjectId(projId);
    const proj = await fetchProject(projId);
    setCurrentProject(proj);

    if (proj) {
      addLog('info', `Proyecto activo: "${proj.title}"`);
      const projFiles = await fetchFiles(projId);
      setFiles(projFiles);
      if (projFiles.length > 0) {
        setSelectedFileId(projFiles[0].id);
        setSelectedFile(projFiles[0]);
      } else {
        setSelectedFileId(null);
        setSelectedFile(null);
      }

      const projTasks = await fetchProjectTasks(projId);
      setTasks(projTasks);

      // Initial greeting from Director Editorial
      setMessages([
        {
          id: `msg-init-${Date.now()}`,
          role: 'agent',
          specialistRole: 'director',
          text: `Saludos. He cargado la memoria y archivos de **"${proj.title}"**.\n\nHe verificado la estructura: ${projFiles.length} documentos cargados con meta de ${proj.estimatedWords.toLocaleString()} palabras. ¿En qué trabajamos hoy? Puedo redactar el siguiente capítulo, verificar coherencia narrativa o calcular especificaciones de maquetación.`,
          timestamp: new Date().toISOString(),
          modelUsed: selectedModel,
          plan: [
            'Memoria narrativa y personajes sincronizados.',
            'Entorno de trabajo autónomo listo para recibir instrucciones.'
          ],
          checkpoints: ['chk_project_loaded']
        }
      ]);
    }
  };

  // Handle file select
  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    const f = files.find(x => x.id === fileId) || null;
    setSelectedFile(f);
    if (f) addLog('info', `Abierto para edición: ${f.name}`);
  };

  // Save content
  const handleSaveContent = async (newContent: string, createVersion = false, summary?: string) => {
    if (!currentProjectId || !selectedFileId) return;
    try {
      const updated = await updateFile(currentProjectId, selectedFileId, {
        content: newContent,
        createVersion,
        summary,
        author: 'autor'
      });
      setSelectedFile(updated);
      setFiles(prev => prev.map(f => (f.id === updated.id ? updated : f)));
      setLastSavedAt(new Date().toLocaleTimeString());
      if (createVersion) {
        addLog('success', `Checkpoint guardado para "${updated.name}" (${summary || 'Versión manual'})`);
      }
    } catch (err: any) {
      addLog('warn', `Error guardando archivo: ${err.message}`);
    }
  };

  // Rollback version
  const handleRollbackVersion = async (fileId: string, versionNumber: number) => {
    if (!currentProjectId) return;
    try {
      const restored = await rollbackFileVersion(currentProjectId, fileId, versionNumber);
      setSelectedFile(restored);
      setFiles(prev => prev.map(f => (f.id === restored.id ? restored : f)));
      addLog('success', `Archivo "${restored.name}" restaurado a versión ${versionNumber}`);
    } catch (err: any) {
      addLog('warn', `Error al restaurar versión: ${err.message}`);
    }
  };

  // Create new chapter
  const handleCreateChapter = async () => {
    if (!currentProjectId) return;
    const nextOrder = files.filter(f => f.type === 'chapter').length + 1;
    const name = `Capítulo ${nextOrder}: Nuevo Capítulo`;
    try {
      const created = await createFile(currentProjectId, {
        name,
        type: 'chapter',
        content: `# ${name}\n\nEscribe aquí el contenido del capítulo...`,
        order: nextOrder,
        path: `/capitulos/capitulo-${String(nextOrder).padStart(2, '0')}.md`
      });
      setFiles(prev => [...prev, created]);
      setSelectedFileId(created.id);
      setSelectedFile(created);
      addLog('tool', `Creado capítulo: "${name}"`);
    } catch (err: any) {
      addLog('warn', `Error creando capítulo: ${err.message}`);
    }
  };

  // Create research note
  const handleCreateResearchFile = async () => {
    if (!currentProjectId) return;
    const name = `Nota de Investigación ${files.filter(f => f.type !== 'chapter').length + 1}`;
    try {
      const created = await createFile(currentProjectId, {
        name,
        type: 'research',
        content: `# ${name}\n\n## Fuentes y Referencias\n- Fuente 1:\n- Cita clave:`,
        order: files.length + 1,
        path: `/investigacion/nota-${Date.now().toString().slice(-4)}.md`
      });
      setFiles(prev => [...prev, created]);
      setSelectedFileId(created.id);
      setSelectedFile(created);
      addLog('tool', `Creada nota de investigación: "${name}"`);
    } catch (err: any) {
      addLog('warn', `Error creando archivo de investigación: ${err.message}`);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!currentProjectId) return;
    try {
      await deleteFile(currentProjectId, fileId);
      const remaining = files.filter(f => f.id !== fileId);
      setFiles(remaining);
      if (selectedFileId === fileId) {
        if (remaining.length > 0) {
          setSelectedFileId(remaining[0].id);
          setSelectedFile(remaining[0]);
        } else {
          setSelectedFileId(null);
          setSelectedFile(null);
        }
      }
      addLog('warn', `Archivo eliminado.`);
    } catch (err: any) {
      addLog('warn', `Error al eliminar archivo: ${err.message}`);
    }
  };

  // Send message to Autonomous Agent
  const handleSendMessage = async (text: string) => {
    if (!currentProjectId) return;
    const userMsg: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    addLog('info', `Petición al ${specialistRole}: "${text.slice(0, 45)}..."`);

    try {
      const agentMsg = await sendAgentMessage({
        projectId: currentProjectId,
        message: text,
        specialistRole,
        permissionMode,
        requestedModel: selectedModel
      });

      setMessages(prev => [...prev, agentMsg]);

      // If tools were completed, refresh files and tasks
      if (agentMsg.toolCalls && agentMsg.toolCalls.some(tc => tc.status === 'completed')) {
        const refreshedFiles = await fetchFiles(currentProjectId);
        setFiles(refreshedFiles);
        if (selectedFileId) {
          const updatedSel = refreshedFiles.find(f => f.id === selectedFileId);
          if (updatedSel) setSelectedFile(updatedSel);
        }
        addLog('success', `Herramientas ejecutadas con éxito por el Agente.`);
      }

      if (agentMsg.checkpoints) {
        agentMsg.checkpoints.forEach(chk => {
          addLog('tool', `Punto de restauración registrado: ${chk}`);
        });
      }
    } catch (err: any) {
      addLog('warn', `Fallo de ejecución del agente: ${err.message}`);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'system',
          text: `Error al procesar con el modelo de IA: ${err.message}. Puedes reintentar o cambiar de proveedor en el panel de configuración.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Approve or Reject Tool Call
  const handleApproveTool = async (toolCall: ToolCall, action: 'approve' | 'reject') => {
    if (!currentProjectId) return;
    try {
      addLog('info', `${action === 'approve' ? 'Aprobada' : 'Rechazada'} herramienta ${toolCall.toolName}`);
      const res = await approveAgentTool({
        projectId: currentProjectId,
        toolCall,
        action
      });

      // Update message tool status in state
      setMessages(prev =>
        prev.map(m => {
          if (!m.toolCalls) return m;
          return {
            ...m,
            toolCalls: m.toolCalls.map(tc => {
              if (tc.id === toolCall.id) {
                return {
                  ...tc,
                  status: action === 'approve' ? 'completed' : 'rejected',
                  result: res.result
                };
              }
              return tc;
            })
          };
        })
      );

      // Refresh files if approved
      if (action === 'approve') {
        const refreshed = await fetchFiles(currentProjectId);
        setFiles(refreshed);
        const updatedSel = refreshed.find(f => f.id === selectedFileId);
        if (updatedSel) setSelectedFile(updatedSel);
      }
    } catch (err: any) {
      addLog('warn', `Error al aprobar herramienta: ${err.message}`);
    }
  };

  // Quality Audit Button Action
  const handleTriggerQualityAudit = () => {
    setActiveSidebarTab('files');
    handleSendMessage('Realiza una auditoría completa de calidad, coherencia temporal y ortotipografía en el libro.');
    setDrawerOpen(true);
  };

  // Background Task Actions
  const handleTaskAction = async (taskId: string, action: 'pause' | 'resume' | 'cancel' | 'complete') => {
    if (!currentProjectId) return;
    try {
      const updated = await updateTaskAction(currentProjectId, taskId, action);
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
      addLog('info', `Tarea ${taskId}: ${action}`);
    } catch (err: any) {
      addLog('warn', `Error en tarea: ${err.message}`);
    }
  };

  const handleCreateNewTask = async (name: string, description: string) => {
    if (!currentProjectId) return;
    try {
      const newTask = await createProjectTask(currentProjectId, {
        name,
        description,
        totalSteps: 5,
        affectedFiles: files.map(f => f.path)
      });
      setTasks(prev => [newTask, ...prev]);
      addLog('info', `Nueva tarea en segundo plano creada: "${name}"`);
    } catch (err: any) {
      addLog('warn', `Error al crear tarea: ${err.message}`);
    }
  };

  // Update Project Metadata/Memory
  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!currentProjectId || !currentProject) return;
    try {
      const updated = await updateProject(currentProjectId, updates);
      setCurrentProject(updated);
      setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      addLog('success', 'Metadatos y memoria del proyecto actualizados.');
    } catch (err: any) {
      addLog('warn', `Error actualizando proyecto: ${err.message}`);
    }
  };

  // Create Project via Wizard
  const handleCreateProjectFromWizard = async (data: Partial<Project>) => {
    try {
      const created = await createProject(data);
      setProjects(prev => [created, ...prev]);
      await selectProject(created.id);
      addLog('success', `¡Nuevo proyecto creado con éxito: "${created.title}"!`);
    } catch (err: any) {
      addLog('warn', `Error al crear proyecto: ${err.message}`);
    }
  };

  const runningTasksCount = tasks.filter(t => t.status === 'running').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0c12] text-slate-100 font-sans antialiased">
      {/* Top Header */}
      <Header
        projects={projects}
        currentProject={currentProject}
        onSelectProject={selectProject}
        onOpenNewProjectWizard={() => setWizardOpen(true)}
        files={files}
        isOnline={isOnline}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        runningTasksCount={runningTasksCount}
        lastSavedAt={lastSavedAt}
        onTriggerQualityAudit={handleTriggerQualityAudit}
      />

      {/* Main Workspace (3 Columns) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          currentProject={currentProject}
          files={files}
          selectedFileId={selectedFileId}
          onSelectFile={handleSelectFile}
          onCreateChapter={handleCreateChapter}
          onCreateResearchFile={handleCreateResearchFile}
          onDeleteFile={handleDeleteFile}
          activeTab={activeSidebarTab}
          onChangeTab={setActiveSidebarTab}
          permissionMode={permissionMode}
          onChangePermissionMode={setPermissionMode}
          onUpdateProject={handleUpdateProject}
        />

        {/* Center Document Editor & Diff Viewer */}
        <DocumentEditor
          file={selectedFile}
          onSaveContent={handleSaveContent}
          onRollbackVersion={handleRollbackVersion}
          onAskAgentToEdit={inst => handleSendMessage(inst)}
        />

        {/* Right Autonomous Agent Panel */}
        <AgentPanel
          messages={messages}
          isThinking={isThinking}
          specialistRole={specialistRole}
          onChangeRole={setSpecialistRole}
          permissionMode={permissionMode}
          onChangePermissionMode={setPermissionMode}
          onSendMessage={handleSendMessage}
          onApproveTool={handleApproveTool}
          selectedModel={selectedModel}
        />
      </div>

      {/* Bottom Collapsible Drawer (Terminal, Background Tasks, Activity Log, Metrics) */}
      <BottomDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen(!drawerOpen)}
        tasks={tasks}
        onTaskAction={handleTaskAction}
        onCreateNewTask={handleCreateNewTask}
        currentProject={currentProject}
        files={files}
        activityLogs={activityLogs}
      />

      {/* New Project Editorial Wizard Modal */}
      <NewProjectWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreateProject={handleCreateProjectFromWizard}
      />
    </div>
  );
}
