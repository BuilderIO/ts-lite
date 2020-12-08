import { JSON } from './json';
import { JSXLiteNode } from './ts-lite-node';

/**
 * @example
 *  // import core, { useState, someThing as someAlias } from '@ts-lite/core'
 *  {
 *    path: '@ts-lite/core',
 *    imports: {
 *      useState: 'useState',
 *      someAlias: 'someThing',
 *      core: 'default',
 *    }
 *  }
 *
 * @example
 *  // import * as core from '@ts-lite/core'
 *  {
 *    path: '@ts-lite/core',
 *    imports: {
 *      core: '*',
 *    }
 *  }
 */
export interface JSXLiteImport {
  path: string;
  imports: {
    [key: string]: string | undefined;
  };
}

export type JSXLiteComponent = {
  '@type': '@ts-lite/component';
  imports: JSXLiteImport[];
  meta: { [key: string]: JSON | undefined };
  state: { [key: string]: JSON | undefined };
  hooks: {
    [key: string]: string | undefined;
    preComponent?: string;
    postComponent?: string;
  };
  children: JSXLiteNode[];
};
