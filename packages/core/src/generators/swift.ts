import dedent from 'dedent';
import * as ts from 'typescript';
import { format } from '../helpers/format';
import { parse } from '../parsers/ts';

export function toSwift(code: string, options = {}) {
  const parsed = parse(code);
  return format(types.SourceFile(parsed));
}

const types = {
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
  BooleanLiteral(node: ts.BooleanLiteral) {
    return node.getText();
  },
  StringLiteral(node: ts.StringLiteral) {
    return `"${node.text}"`;
  },
  ReturnStatement(node: ts.ReturnStatement) {
    return `return ${node.expression ? this.Node(node.expression) : ''}`;
  },
  Block(node: ts.Block) {
    // TODO
    return dedent`{
      ${node.statements.map((statement) => this.Node(statement)).join('\n')}
    }`;
  },
  BinaryExpression(node: ts.BinaryExpression) {
    return `${this.Node(node.left)} ${node.operatorToken.getText()} ${this.Node(
      node.right,
    )}`;
  },
  Identifier(node: ts.Identifier) {
    return node.getText();
  },
  ExpressionStatement(node: ts.ExpressionStatement) {
    return this.Node(node.expression);
  },
  WhileStatement(node: ts.WhileStatement) {
    return `while ${this.Node(node.expression)} ${this.Node(node.statement)}`;
  },
  PrefixUnaryExpression(node: ts.PrefixUnaryExpression) {
    // TODo: operator map
    return `${node.operator === 46 ? '--' : '++'}${this.Node(node.operand)}`;
  },
  IfStatement(node: ts.IfStatement) {
    return dedent`if ${this.Node(node.expression)} ${this.Node(
      node.thenStatement,
    )}`;
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
  Node(node: ts.Node): string {
    for (const key in this) {
      if (key === 'Node') {
        continue;
      }
      const checker = (ts as any)[`is${key}`];
      if (checker) {
        if (checker(node)) {
          return (this as any)[key](node);
        }
      }
    }

    console.warn(`Node type not found for node ${node.kind}`, node);
    return `/* Unsupported node type: ${node.kind} */`;
  },
};
