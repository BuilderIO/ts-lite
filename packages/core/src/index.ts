// import './jsx';

export * from './flow';

// These compile away
export const useState = <T>(obj: T) => obj;
export const useRef = () => null as any;
export const useContext = () => null as any;
export const createContext = () => null as any;

export * from './parsers/jsx';
export * from './parsers/builder';
export * from './parsers/ts';
export * from './generators/vue';
export * from './generators/angular';
export * from './generators/react';
export * from './generators/solid';
export * from './generators/liquid';
export * from './generators/builder';
export * from './generators/html';
export * from './generators/svelte';
export * from './generators/ts-lite';
export * from './generators/swift-ui';
export * from './generators/react-native';
export * from './helpers/parse-reactive-script';
