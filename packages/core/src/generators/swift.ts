import dedent from 'dedent';
import * as ts from 'typescript';
import { parse } from '../parsers/ts';

export function toSwift(code: string, options = {}) {
  const parsed = parse(code);
  return types.SourceFile(parsed);
}

export const types = {
  SourceFile(node: ts.SourceFile): string {
    return node.statements.map((statement) => this.Node(statement)).join('\n');
  },
  VariableStatement(node: ts.VariableStatement) {
    return `var ${node.declarationList.declarations
      .map((declaration) => this.VariableDeclaration(declaration))
      .join(', ')}`;
  },
  VariableDeclaration(node: ts.VariableDeclaration) {
    return `${node.name.getText()}${
      node.initializer ? ` = ${this.Node(node.initializer)}` : ''
    }`;
  },
  NumericLiteral(node: ts.NumericLiteral) {
    return node.getText();
  },
  Identifier(node: ts.Identifier) {
    return node.getText();
  },
  IfStatement(node: ts.IfStatement) {
    return dedent`if ${this.Node(node.expression)} {
      ${node.thenStatement}
    }`
  },
  Node(node: ts.Node): string {
    for (const key in this) {
      if (key === 'Node') {
        continue;
      }
      const checker = (ts as any)[`is${key}`];
      if (checker) {
        if (checker(node)) {
          console.log('running', key);
          return (this as any)[key](node);
        }
      }
    }

    console.warn(`Node type not found for node ${node.kind}`, node);
    return `/* Unsupported node type: ${node.kind} */`;
  },
  Parameter(node: ts.ParameterDeclaration) {
    return `${node.name.getText()}${
      node.type ? `: ${node.type.getText()}` : ''
    }`;
  },
  FunctionDeclaration(node: ts.FunctionDeclaration): string {
    return dedent`func ${
      node.name?.escapedText
    }(${node.parameters.map((param) => this.Parameter(param)).join(', ')})${
      node.type ? ` -> ${node.type.getText()}` : ''
    } {
        ${node.body?.statements
          .map((statement) => this.Node(statement))
          .join('\n')}
      }`;
  },
};
