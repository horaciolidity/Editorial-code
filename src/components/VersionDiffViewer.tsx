import React from 'react';
import { FileVersion } from '../types/editorial';
import { computeLineDiff } from '../utils/diff';
import { RotateCcw, GitCompare, Calendar, User } from 'lucide-react';

interface VersionDiffViewerProps {
  currentContent: string;
  selectedVersion: FileVersion;
  onRollback: (versionNumber: number) => void;
  onClose: () => void;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  currentContent,
  selectedVersion,
  onRollback,
  onClose
}) => {
  const diffLines = computeLineDiff(selectedVersion.content, currentContent);
  const additions = diffLines.filter(l => l.type === 'add').length;
  const deletions = diffLines.filter(l => l.type === 'del').length;

  return (
    <div className="flex flex-col h-full bg-[#0d0f14] text-xs font-mono select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121620] border-b border-[#202738]">
        <div className="flex items-center gap-3">
          <GitCompare className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-100">
            Comparando: Versión {selectedVersion.versionNumber} vs. Actual
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-emerald-400 font-bold">+{additions} adiciones</span>
            <span className="text-rose-400 font-bold">-{deletions} eliminaciones</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRollback(selectedVersion.versionNumber)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-sans font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar esta Versión</span>
          </button>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded bg-[#1c2230] hover:bg-[#252e40] text-slate-300 font-sans"
          >
            Cerrar Comparador
          </button>
        </div>
      </div>

      {/* Meta banner */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-[#0a0c10] border-b border-[#181d29] text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-cyan-400" />
          {new Date(selectedVersion.timestamp).toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3 text-lime-400" />
          {selectedVersion.author}
        </span>
        <span className="italic text-slate-300">
          "{selectedVersion.summary || 'Sin nota de versión'}"
        </span>
      </div>

      {/* Diff Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5 font-mono text-[12px] leading-relaxed">
        {diffLines.map((line, idx) => {
          let bg = 'hover:bg-slate-900/50 text-slate-300';
          let sign = ' ';
          let signColor = 'text-slate-600';

          if (line.type === 'add') {
            bg = 'bg-emerald-950/30 text-emerald-200 border-l-2 border-emerald-500';
            sign = '+';
            signColor = 'text-emerald-400 font-bold';
          } else if (line.type === 'del') {
            bg = 'bg-rose-950/30 text-rose-300 border-l-2 border-rose-500 line-through opacity-75';
            sign = '-';
            signColor = 'text-rose-400 font-bold';
          }

          return (
            <div key={idx} className={`flex items-start px-2 py-0.5 rounded-sm ${bg}`}>
              <span className={`w-4 select-none shrink-0 text-center font-bold ${signColor}`}>
                {sign}
              </span>
              <span className="w-10 select-none text-right pr-3 text-slate-600 shrink-0 text-[10px]">
                {line.newLineNumber || line.oldLineNumber || ''}
              </span>
              <span className="whitespace-pre-wrap break-all flex-1">{line.text || '\u00A0'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
