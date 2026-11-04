import type { CSSProperties } from 'react';

/**
 * "Sudo Night" Prism theme for react-syntax-highlighter, built from the
 * `--term-*` tokens in globals.css. Script panels stay dark in both themes.
 */
const base: CSSProperties = {
  color: 'var(--term-ink)',
  background: 'var(--term-bg)',
  fontFamily: "var(--font-geist-mono), ui-monospace, 'SFMono-Regular', monospace",
  fontSize: '13px',
  lineHeight: '21px',
  textAlign: 'left',
  whiteSpace: 'pre',
  wordSpacing: 'normal',
  wordBreak: 'normal',
  tabSize: 2,
  hyphens: 'none',
  textShadow: 'none',
};

const dim: CSSProperties = { color: 'var(--term-dim)' };
const keyword: CSSProperties = { color: 'var(--term-keyword)' };
const command: CSSProperties = { color: 'var(--term-command)' };
const str: CSSProperties = { color: 'var(--term-string)' };
const variable: CSSProperties = { color: 'var(--term-variable)' };

export const sudoNight: Record<string, CSSProperties> = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, margin: 0, padding: '1rem', overflow: 'auto' },
  comment: { ...dim, fontStyle: 'italic' },
  prolog: dim,
  doctype: dim,
  cdata: dim,
  shebang: dim,
  important: dim,
  punctuation: dim,
  operator: dim,
  keyword,
  builtin: command,
  function: command,
  'class-name': command,
  string: str,
  char: str,
  'attr-value': str,
  regex: str,
  variable,
  parameter: variable,
  symbol: variable,
  number: variable,
  boolean: variable,
  constant: variable,
  'assign-left': variable,
  environment: variable,
};

/** Line-number gutter style to pair with `showLineNumbers`. */
export const sudoNightLineNumbers: CSSProperties = {
  color: 'var(--term-dim)',
  opacity: 0.6,
  minWidth: '2.5em',
  paddingRight: '1em',
};
