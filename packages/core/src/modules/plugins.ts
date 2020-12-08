import { SourceFile } from 'typescript';

export type Plugin = {
  json?: {
    // Happens before any modifiers
    pre?: (json: SourceFile) => SourceFile | void;
    // Happens after built in modifiers
    post?: (json: SourceFile) => SourceFile | void;
  };
  code?: {
    // Happens before formatting
    pre?: (code: string) => string;
    // Happens after formatting
    post?: (code: string) => string;
  };
};

export const runPreJsonPlugins = (json: SourceFile, plugins: Plugin[]) => {
  let useJson = json;
  for (const plugin of plugins) {
    const preFunction = plugin.json?.pre;
    if (preFunction) {
      useJson = preFunction(json) || json;
    }
  }
  return useJson;
};

export const runPostJsonPlugins = (json: SourceFile, plugins: Plugin[]) => {
  let useJson = json;
  for (const plugin of plugins) {
    const postFunction = plugin.json?.post;
    if (postFunction) {
      useJson = postFunction(json) || json;
    }
  }
  return useJson;
};

export const runPreCodePlugins = (code: string, plugins: Plugin[]) => {
  let string = code;
  for (const plugin of plugins) {
    const preFunction = plugin.code?.pre;
    if (preFunction) {
      string = preFunction(string);
    }
  }
  return string;
};

export const runPostCodePlugins = (code: string, plugins: Plugin[]) => {
  let string = code;
  for (const plugin of plugins) {
    const postFunction = plugin.code?.post;
    if (postFunction) {
      string = postFunction(string);
    }
  }
  return string;
};
