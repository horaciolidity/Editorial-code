export interface DiffLine {
  type: 'add' | 'del' | 'same';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function computeLineDiff(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const result: DiffLine[] = [];

  // Simple and robust LCS-based line differ
  let oldIdx = 0;
  let newIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (oldIdx < oldLines.length && newIdx < newLines.length) {
      if (oldLines[oldIdx] === newLines[newIdx]) {
        result.push({
          type: 'same',
          text: oldLines[oldIdx],
          oldLineNumber: oldIdx + 1,
          newLineNumber: newIdx + 1
        });
        oldIdx++;
        newIdx++;
      } else {
        // Look ahead to check if line was added or removed
        const nextMatchInNew = newLines.indexOf(oldLines[oldIdx], newIdx);
        const nextMatchInOld = oldLines.indexOf(newLines[newIdx], oldIdx);

        if (nextMatchInNew !== -1 && (nextMatchInOld === -1 || nextMatchInNew - newIdx <= nextMatchInOld - oldIdx)) {
          // Line added in new
          result.push({
            type: 'add',
            text: newLines[newIdx],
            newLineNumber: newIdx + 1
          });
          newIdx++;
        } else if (nextMatchInOld !== -1) {
          // Line removed from old
          result.push({
            type: 'del',
            text: oldLines[oldIdx],
            oldLineNumber: oldIdx + 1
          });
          oldIdx++;
        } else {
          // Line changed (del + add)
          result.push({
            type: 'del',
            text: oldLines[oldIdx],
            oldLineNumber: oldIdx + 1
          });
          result.push({
            type: 'add',
            text: newLines[newIdx],
            newLineNumber: newIdx + 1
          });
          oldIdx++;
          newIdx++;
        }
      }
    } else if (oldIdx < oldLines.length) {
      result.push({
        type: 'del',
        text: oldLines[oldIdx],
        oldLineNumber: oldIdx + 1
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      result.push({
        type: 'add',
        text: newLines[newIdx],
        newLineNumber: newIdx + 1
      });
      newIdx++;
    }
  }

  return result;
}
