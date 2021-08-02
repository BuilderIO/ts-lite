import dedent from 'dedent';
import * as ts from 'typescript';
import { format } from '../helpers/format';
import { parse } from '../parsers/ts';

export type ToSwiftOptions = {
  /**
   * The type of code to generate
   *   `'idiomatic'` - attempts to generate idiomatic swift, but may need some human adjustments to get 100% ready to run
   *   `'safe'` - attempts to generate code that will always run as expected without human editing, even if less idiomatic
   */
  type: 'idiomatic' | 'safe';
};

export function toSwift(
  code: string,
  options: Partial<ToSwiftOptions> = {},
): string {
  const useOptions: ToSwiftOptions = {
    type: 'safe',
    ...options,
  };
  const parsed = parse(code);
  return format(types.SourceFile(parsed, useOptions));
}

type TypesMap = Record<
  string,
  (node: ts.Node, options: ToSwiftOptions) => string
>;

const types = {
  SourceFile(node: ts.SourceFile, options: ToSwiftOptions): string {
    return node.statements
      .map((statement) => this.Node(statement, options))
      .join('\n');
  },
  VariableStatement(
    node: ts.VariableStatement,
    options: ToSwiftOptions,
  ): string {
    return `var ${node.declarationList.declarations
      .map((declaration) => this.VariableDeclaration(declaration, options))
      .join(', ')}`;
  },
  VariableDeclaration(
    node: ts.VariableDeclaration,
    options: ToSwiftOptions,
  ): string {
    return `${node.name.getText()}${
      node.initializer ? ` = ${this.Node(node.initializer, options)}` : ''
    }`;
  },
  NumericLiteral(node: ts.NumericLiteral, options: ToSwiftOptions): string {
    return node.getText();
  },
  BooleanLiteral(node: ts.BooleanLiteral, options: ToSwiftOptions): string {
    return node.getText();
  },
  StringLiteral(node: ts.StringLiteral, options: ToSwiftOptions): string {
    return `"${node.text}"`;
  },
  ReturnStatement(node: ts.ReturnStatement, options: ToSwiftOptions): string {
    return `return ${
      node.expression ? this.Node(node.expression, options) : ''
    }`;
  },
  Block(node: ts.Block, options: ToSwiftOptions): string {
    // TODO
    return dedent`{
      ${node.statements
        .map((statement) => this.Node(statement, options))
        .join('\n')}
    }`;
  },
  BinaryExpression(node: ts.BinaryExpression, options: ToSwiftOptions): string {
    return `${this.Node(
      node.left,
      options,
    )} ${node.operatorToken.getText()} ${this.Node(node.right, options)}`;
  },
  Identifier(node: ts.Identifier, options: ToSwiftOptions): string {
    return node.getText();
  },
  ExpressionStatement(
    node: ts.ExpressionStatement,
    options: ToSwiftOptions,
  ): string {
    return this.Node(node.expression, options);
  },
  WhileStatement(node: ts.WhileStatement, options: ToSwiftOptions): string {
    return `while ${this.Node(node.expression, options)} ${this.Node(
      node.statement,
      options,
    )}`;
  },
  PrefixUnaryExpression(
    node: ts.PrefixUnaryExpression,
    options: ToSwiftOptions,
  ): string {
    // TODo: operator map
    return `${node.operator === 46 ? '--' : '++'}${this.Node(
      node.operand,
      options,
    )}`;
  },
  IfStatement(node: ts.IfStatement, options: ToSwiftOptions): string {
    return dedent`if ${this.Node(node.expression, options)} ${this.Node(
      node.thenStatement,
      options,
    )}`;
  },
  Parameter(node: ts.ParameterDeclaration, options: ToSwiftOptions): string {
    return `${node.name.getText()}${
      node.type ? `: ${node.type.getText()}` : ''
    }`;
  },
  FunctionDeclaration(
    node: ts.FunctionDeclaration,
    options: ToSwiftOptions,
  ): string {
    return dedent`func ${
      node.name?.escapedText
    }(${node.parameters
      .map((param) => this.Parameter(param, options))
      .join(', ')})${node.type ? ` -> ${node.type.getText()}` : ''} {
        ${node.body?.statements
          .map((statement) => this.Node(statement, options))
          .join('\n')}
      }`;
  },
  Node(node: ts.Node, options: ToSwiftOptions): string {
    for (const key in this) {
      if (key === 'Node') {
        continue;
      }
      const checker = (ts as any)[`is${key}`];
      if (checker) {
        if (checker(node)) {
          return ((this as any) as TypesMap)[key](node, options);
        }
      }
    }

    console.warn(`Node type not found for node ${node.kind}`, node);
    return `/* Unsupported node type: ${node.kind} */`;
  },
};
