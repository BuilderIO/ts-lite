import {
  createMuiTheme,
  MenuItem,
  Select,
  Tab,
  Tabs,
  ThemeProvider,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-webpack-loader-syntax
import React, { useState } from 'react';
import { toSwift, toGo, toKotlin } from '@ts-lite/core';
import MonacoEditor from 'react-monaco-editor';
import githubLogo from '../assets/GitHub-Mark-Light-64px.png';
import logo from '../assets/ts-lite-logo-white.png';
import { breakpoints } from '../constants/breakpoints';
import { colors } from '../constants/colors';
import { device } from '../constants/device';
import { defaultCode, templates } from '../constants/templates';
import { theme } from '../constants/theme';
import { deleteQueryParam } from '../functions/delete-query-param';
import { getQueryParam } from '../functions/get-query-param';
import { localStorageGet } from '../functions/local-storage-get';
import { localStorageSet } from '../functions/local-storage-set';
import { setQueryParam } from '../functions/set-query-param';
import { useEventListener } from '../hooks/use-event-listener';
import { useReaction } from '../hooks/use-reaction';
import { Show } from './Show';
import { TextLink } from './TextLink';

const debug = getQueryParam('debug') === 'true';

const AlphaPreviewMessage = () => (
  <ThemeProvider
    theme={createMuiTheme({
      palette: {
        type: 'dark',
        primary: { main: colors.primary },
      },
    })}
  >
    <Alert
      severity="info"
      css={{
        background: 'none',
        fontSize: 15,
      }}
    >
      This is an early alpha preview, please{' '}
      <TextLink
        css={{ color: 'inherit', textDecoration: 'underline' }}
        href="https://github.com/BuilderIO/ts-lite/issues"
        target="_blank"
      >
        report bugs and share feedback
      </TextLink>
    </Alert>
  </ThemeProvider>
);

const smallBreakpoint = breakpoints.mediaQueries.small;
const responsiveColHeight = 'calc(50vh - 30px)';

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.Latest,
  allowNonTsExtensions: true,
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS,
  noEmit: true,
  esModuleInterop: true,
  jsx: monaco.languages.typescript.JsxEmit.React,
  reactNamespace: 'React',
  allowJs: true,
  typeRoots: ['node_modules/@types'],
});

monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
});

// TODO: add this
monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `
    declare type Int = number;
  `,
  'ts:filename/index.d.ts'
);

// TODO: Build this Fiddle app with TS Lite :)
export default function Fiddle() {
  const [staticState] = useState(() => ({
    ignoreNextBuilderUpdate: false,
  }));
  const state = useLocalObservable(() => ({
    code: getQueryParam('code') || defaultCode,
    output: '',
    outputTab: getQueryParam('outputTab') || 'vue',
    pendingBuilderChange: null as any,
    inputTab: getQueryParam('inputTab') || 'builder',
    builderData: {} as any,
    isDraggingOutputsCodeBar: false,
    isDraggingJSXCodeBar: false,
    jsxCodeTabWidth: Number(localStorageGet('jsxCodeTabWidth')) || 45,
    outputsTabHeight: Number(localStorageGet('outputsTabHeight')) || 100,
    updateOutput() {
      try {
        state.pendingBuilderChange = null;
        staticState.ignoreNextBuilderUpdate = true;
        // TODO
        state.output =
          state.outputTab === 'swift'
            ? toSwift(state.code)
            : state.outputTab === 'go'
            ? toGo(state.code)
            : toKotlin(state.code);
      } catch (err) {
        if (debug) {
          throw err;
        } else {
          console.warn(err);
        }
      }
    },
  }));

  useEventListener<MouseEvent>(document.body, 'mousemove', (e) => {
    if (state.isDraggingJSXCodeBar) {
      const windowWidth = window.innerWidth;
      const pointerRelativeXpos = e.clientX;
      const newWidth = Math.max((pointerRelativeXpos / windowWidth) * 100, 5);
      state.jsxCodeTabWidth = Math.min(newWidth, 95);
    } else if (state.isDraggingOutputsCodeBar) {
      const bannerHeight = 0;
      const windowHeight = window.innerHeight;
      const pointerRelativeYPos = e.clientY;
      const newHeight = Math.max(
        ((pointerRelativeYPos + bannerHeight) / windowHeight) * 100,
        5,
      );
      state.outputsTabHeight = Math.min(newHeight, 95);
    }
  });

  useEventListener<MouseEvent>(document.body, 'mouseup', (e) => {
    state.isDraggingJSXCodeBar = false;
    state.isDraggingOutputsCodeBar = false;
  });

  useReaction(
    () => state.jsxCodeTabWidth,
    (width) => localStorageSet('jsxCodeTabWidth', width),
    { fireImmediately: false, delay: 1000 },
  );

  useReaction(
    () => state.outputsTabHeight,
    (width) => localStorageSet('outputsTabHeight', width),
    { fireImmediately: false, delay: 1000 },
  );

  useReaction(
    () => state.code,
    (code) => setQueryParam('code', code),
    { fireImmediately: false },
  );
  useReaction(
    () => state.outputTab,
    (tab) => {
      if (state.code) {
        setQueryParam('outputTab', tab);
      } else {
        deleteQueryParam('outputTab');
      }
      state.updateOutput();
    },
  );

  useReaction(
    () => state.code,
    (code) => {
      state.updateOutput();
    },
    { delay: 1000 },
  );

  return useObserver(() => {
    const outputMonacoEditorSize = device.small
      ? `calc(${state.outputsTabHeight}vh - 50px)`
      : `calc(${state.outputsTabHeight}vh - 100px)`;
    const inputMonacoEditorSize = `calc(${
      100 - state.outputsTabHeight
    }vh - 100px)`;
    const lightColorInvert = {}; // theme.darkMode ? null : { filter: 'invert(1) ' };
    const monacoTheme = theme.darkMode ? 'vs-dark' : 'vs';
    const barStyle: any = {
      overflow: 'auto',
      whiteSpace: 'nowrap',
      ...(theme.darkMode ? null : { backgroundColor: 'white' }),
    };

    return (
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          '& .monaco-editor .margin, & .monaco-editor, & .monaco-editor-background, .monaco-editor .inputarea.ime-input': {
            backgroundColor: 'transparent !important',
          },
        }}
      >
        <div
          css={{
            backgroundColor: '#1e1e1e',
          }}
        >
          <div
            css={{
              display: 'flex',
              position: 'relative',
              flexShrink: 0,
              alignItems: 'center',
              color: 'white',
            }}
          >
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/builderio/ts-lite"
              css={{
                marginRight: 'auto',
              }}
            >
              <img
                alt="TS Lite Logo"
                src={logo}
                css={{
                  marginLeft: 20,
                  objectFit: 'contain',
                  width: 130,
                  height: 60,
                  ...lightColorInvert,
                }}
              />
            </a>
            <div
              css={{
                marginRight: 'auto',
                [smallBreakpoint]: { display: 'none' },
              }}
            >
              <AlphaPreviewMessage />
            </div>

            <a
              target="_blank"
              rel="noreferrer"
              css={{
                marginRight: 25,
                display: 'flex',
                alignItems: 'center',
              }}
              href="https://github.com/builderio/ts-lite"
            >
              Source
              <img
                width={30}
                src={githubLogo}
                css={{ marginLeft: 10, ...lightColorInvert }}
                alt="Github Mark"
              />
            </a>
          </div>
          <div
            css={{
              display: 'none',
              textAlign: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              [smallBreakpoint]: { display: 'block' },
            }}
          >
            <AlphaPreviewMessage />
          </div>
        </div>
        <div
          css={{
            display: 'flex',
            flexGrow: 1,
            [smallBreakpoint]: { flexDirection: 'column' },
          }}
        >
          <div
            css={{
              width: `${state.jsxCodeTabWidth}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${colors.contrast}`,
              [smallBreakpoint]: {
                width: '100%',
                height: responsiveColHeight,
                overflow: 'hidden',
              },
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                flexShrink: 0,
                height: 40,
                borderBottom: `1px solid ${colors.contrast}`,
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{ flexGrow: 1, textAlign: 'left', opacity: 0.7 }}
              >
                TS Lite code:
              </Typography>
              <Select
                disableUnderline
                css={{
                  marginLeft: 'auto',
                  marginRight: 10,
                }}
                renderValue={(value) => (
                  <span css={{ textTransform: 'capitalize' }}>
                    {value === '_none' ? 'Choose template' : (value as string)}
                  </span>
                )}
                defaultValue="_none"
                onChange={(e) => {
                  const template = templates[e.target.value as string];
                  if (template) {
                    state.code = template;
                  }
                }}
              >
                <MenuItem value="_none" disabled>
                  Choose template
                </MenuItem>
                {Object.keys(templates).map((key) => (
                  <MenuItem
                    key={key}
                    value={key}
                    css={{
                      textTransform: 'capitalize',
                    }}
                  >
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div css={{ paddingTop: 15, flexGrow: 1 }}>
              <MonacoEditor
                options={{
                  renderLineHighlightOnlyWhenFocus: true,
                  overviewRulerBorder: false,
                  hideCursorInOverviewRuler: true,
                  automaticLayout: true,
                  minimap: { enabled: false },
                  scrollbar: { vertical: 'hidden' },
                }}
                theme={monacoTheme}
                height="calc(100vh - 105px)"
                language="typescript"
                value={state.code}
                onChange={(val) => (state.code = val)}
              />
            </div>
          </div>
          <div
            css={{
              cursor: 'col-resize',
              position: 'relative',
              zIndex: 100,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: -5,
                right: -5,
              },
            }}
            onMouseDown={(event) => {
              event.preventDefault();
              state.isDraggingJSXCodeBar = true;
            }}
          ></div>
          <div
            css={{
              width: `${100 - state.jsxCodeTabWidth}%`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              [smallBreakpoint]: {
                width: '100%',
                height: responsiveColHeight,
                overflow: 'hidden',
              },
            }}
          >
            <div
              css={{
                display: 'flex',
                alignItems: 'center',
                height: 40,
                padding: 5,
                flexShrink: 0,
                borderBottom: `1px solid ${colors.contrast}`,
                [smallBreakpoint]: {
                  borderTop: `1px solid ${colors.contrast}`,
                },
                ...barStyle,
              }}
            >
              <Typography
                variant="body2"
                css={{
                  flexGrow: 1,
                  textAlign: 'left',
                  opacity: 0.7,
                  paddingLeft: 10,
                }}
              >
                Outputs:
              </Typography>
              <Tabs
                variant="scrollable"
                value={state.outputTab}
                css={{
                  minHeight: 0,
                  marginLeft: 'auto',
                  '& button': {
                    minHeight: 0,
                    minWidth: 100,
                  },
                }}
                onChange={(e, value) => (state.outputTab = value)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Swift" value="swift" />
                <Tab label="Go" value="go" />
                <Tab label="Kotlin" value="kotlin" />
                {/* <Tab label="WASM" value="wasm" /> */}
              </Tabs>
            </div>
            <div
              css={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
            >
              <div css={{ flexGrow: 1 }}>
                <div css={{ paddingTop: 15 }}>
                  <MonacoEditor
                    height={outputMonacoEditorSize}
                    options={{
                      automaticLayout: true,
                      overviewRulerBorder: false,
                      highlightActiveIndentGuide: false,
                      foldingHighlight: false,
                      renderLineHighlightOnlyWhenFocus: true,
                      occurrencesHighlight: false,
                      readOnly: getQueryParam('readOnly') !== 'false',
                      minimap: { enabled: false },
                      renderLineHighlight: 'none',
                      selectionHighlight: false,
                      scrollbar: { vertical: 'hidden' },
                    }}
                    theme={monacoTheme}
                    language={state.outputTab}
                    value={state.output}
                  />
                </div>
              </div>
            </div>

            <Show when={!device.small}>
              <div
                css={{
                  cursor: 'row-resize',
                  position: 'relative',
                  zIndex: 100,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    bottom: -5,
                    left: 0,
                    right: 0,
                  },
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  state.isDraggingOutputsCodeBar = true;
                }}
              ></div>
              <div
                css={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  '& builder-editor': {
                    width: '100%',
                    filter: theme.darkMode ? 'invert(0.89)' : '',
                    transition: 'filter 0.2s ease-in-out',
                    height: '100%',
                    display: state.inputTab === 'builder' ? undefined : 'none ',

                    '&:hover': {
                      ...(theme.darkMode && {
                        filter: 'invert(0)',
                      }),
                    },
                  },
                }}
              >
                {/* TODO: some other output preview */}
                {/* TODO: Builder drag/drop (Buid.) editor */}
              </div>
            </Show>
          </div>
        </div>
      </div>
    );
  });
}
