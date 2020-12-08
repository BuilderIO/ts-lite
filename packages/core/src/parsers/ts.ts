import * as ts from 'typescript';

export const FILE_NAME = 'code.tsx';

export function parse(code: string, options = {}) {
  return ts.createSourceFile(
    FILE_NAME,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
}
