import React from 'react';
import { FileVersion } from '../types/editorial';
import { computeLineDiff } from '../utils/diff';
import { RotateCcw, GitCompare, Calendar, User, X } from 'lucide-react';

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
    <div className="flex flex-col h-full w-full bg-[#0d0f14] text-xs font-mono select-none overflow-hidden">
      {/* Top bar - responsive stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 bg-[#121620] border-b border-[#202738] gap-2 shrink-0">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <GitCompare className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="font-semibold text-slate-100 text-xs truncate">
            v{selectedVersion.versionNumber} vs. Actual
          </span>
          <div className="flex items-center gap-2 text-[10px] shrink-0 font-sans">
            <span className="text-emerald-400 font-bold">+{additions}</span>
            <span className="text-rose-400 font-bold">-{deletions}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <button
            onClick={() => onRollback(selectedVersion.versionNumber)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-sans font-medium transition-colors text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c2230] hover:bg-[#252e40] text-slate-300 font-sans text-[11px]"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Cerrar</span>
          </button>
        </div>
      </div>

      {/* Meta banner */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 py-1.5 bg-[#0a0c10] border-b border-[#181d29] text-[10px] sm:text-[11px] text-slate-400 overflow-x-auto no-scrollbar shrink-0">
        <span className="flex items-center gap-1 shrink-0">
          <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
          {new Date(selectedVersion.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <User className="w-3 h-3 text-lime-400 shrink-0" />
          {selectedVersion.author}
        </span>
        <span className="italic text-slate-300 truncate">
          "{selectedVersion.summary || 'Sin nota'}"
        </span>
      </div>

      {/* Diff Stream */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-0.5 font-mono text-[11px] sm:text-[12px] leading-relaxed w-full">
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
            <div key={idx} className={`flex items-start px-1.5 py-0.5 rounded-sm ${bg} break-words`}>
              <span className={`w-3.5 select-none shrink-0 text-center font-bold ${signColor}`}>
                {sign}
              </span>
              <span className="w-7 sm:w-10 select-none text-right pr-2 text-slate-600 shrink-0 text-[10px]">
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
