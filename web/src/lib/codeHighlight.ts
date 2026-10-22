import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import ini from 'highlight.js/lib/languages/ini';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import lua from 'highlight.js/lib/languages/lua';

// 只打包教程实际使用的语言；不自动猜测输出、目录树等纯文本。
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('lua', lua);

export function highlightCode(code: string, language: string): string | null {
  const lang = language.toLowerCase();
  if (!hljs.getLanguage(lang)) return null;
  return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
}

export function codeLanguageLabel(language: string): string {
  const lang = language.toLowerCase();
  const labels: Record<string, string> = {
    python: 'Python', py: 'Python', bash: 'Bash', sh: 'Shell', shell: 'Shell',
    toml: 'TOML', ini: 'INI', json: 'JSON', yaml: 'YAML', yml: 'YAML',
    markdown: 'Markdown', md: 'Markdown', lua: 'Lua', text: '文本', txt: '文本',
    plaintext: '文本',
  };
  return labels[lang] ?? (language || '文本');
}
