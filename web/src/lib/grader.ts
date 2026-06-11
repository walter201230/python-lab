/**
 * 判分纯函数：根据 grading rules + 实际运行结果，判定通过 / 未通过 + 提示。
 *
 * 规则全部 AND：所有声明的规则都必须满足才算通过。
 * 提示原则：第一条不满足的规则的提示——单点定位让用户改。
 */

import type { GradingRules } from '@/types/content';

export interface ActualResult {
  stdout: string;
  stderr: string;
  vars: Record<string, unknown>;
  astNodes: string[];
  error?: string;
  timedOut?: boolean;
}

export interface GradeOutcome {
  pass: boolean;
  msg: string;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  // 字符串叶子做引号归一化再比：中文手机输入法常把 "/' 自动转成全角弯引号，
  // 肉眼几乎一样、码点不同（"→“”、'→‘’），不该判错（issue #293 类）
  if (typeof a === 'string' && typeof b === 'string') {
    return normalizeQuotes(a) === normalizeQuotes(b);
  }
  if (typeof a !== 'object') return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) {
      return false;
    }
  }
  return true;
}

export function grade(actual: ActualResult, rules: GradingRules): GradeOutcome {
  // 0. 运行级前置错误
  if (actual.timedOut) {
    return { pass: false, msg: '执行超时（5 秒），可能写了死循环——检查 while/for 退出条件' };
  }
  if (actual.error) {
    return { pass: false, msg: `代码报错：${actual.error.split('\n').slice(-1)[0]}` };
  }

  // 1. stdoutEquals
  if (rules.stdoutEquals !== undefined) {
    // 引号归一化后再比（容忍全角弯引号，见 normalizeQuotes）；仍不一致才算错
    if (normalizeQuotes(actual.stdout) !== normalizeQuotes(rules.stdoutEquals)) {
      return {
        pass: false,
        msg:
          `输出与期望不一致——${describeFirstDiff(rules.stdoutEquals, actual.stdout)}。` +
          `期望 \`${escape(rules.stdoutEquals)}\`，实际 \`${escape(actual.stdout)}\``,
      };
    }
  }

  // 2. varsEqual
  if (rules.varsEqual) {
    for (const [name, expected] of Object.entries(rules.varsEqual)) {
      const got = actual.vars[name];
      if (!deepEqual(got, expected)) {
        return {
          pass: false,
          msg: got === undefined
            ? `变量 \`${name}\` 没定义——题目要求它的值是 \`${JSON.stringify(expected)}\``
            : `变量 \`${name}\` 的值不对——期望 \`${JSON.stringify(expected)}\`，实际 \`${JSON.stringify(got)}\``,
        };
      }
    }
  }

  // 3. requiredAst
  if (rules.requiredAst && rules.requiredAst.length > 0) {
    for (const required of rules.requiredAst) {
      if (!actual.astNodes.includes(required)) {
        return {
          pass: false,
          msg: `代码结构不满足要求——需要包含 \`${required}\`（格式 \`类型:名字\`，比如 \`Assign:name\` 表示要给变量 name 赋值）`,
        };
      }
    }
  }

  return { pass: true, msg: '通过 ✓ 漂亮，可以进入下一题' };
}

function escape(s: string): string {
  return s.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}

/**
 * 引号归一化：把各种弯引号 / 全角引号统一成 ASCII 直引号再比对。
 * 中文手机输入法（甚至粘贴时）会自动把 " → “”、' → ‘’，肉眼几乎一样但码点不同，
 * 严格字节比对会判错（issue #293 类）。只归一化引号，不动 ！？：，等全角标点
 * ——那些课程里本就有意使用、视觉上也能区分，归一化会掩盖真实错误。
 * 长度保持 1:1（每个引号字符→单个直引号），故归一化前后字符位置一一对应。
 */
function normalizeQuotes(s: string): string {
  return s
    .replace(/[“”＂]/g, '"') // “ ” ＂ → "
    .replace(/[‘’＇]/g, "'"); // ‘ ’ ＇ → '
}

// 常见易混字符的友好名字，用于把隐形差异点出来
const CHAR_NAMES: Record<string, string> = {
  '"': '直双引号',
  '“': '左弯双引号',
  '”': '右弯双引号',
  "'": '直单引号',
  '‘': '左弯单引号',
  '’': '右弯单引号',
  '！': '全角叹号',
  '!': '半角叹号',
  '：': '全角冒号',
  ':': '半角冒号',
  '，': '全角逗号',
  ',': '半角逗号',
  '？': '全角问号',
  '?': '半角问号',
  ' ': '空格',
  '\u00A0': '不间断空格 NBSP',
  '\u3000': '全角空格',
  '\n': '换行',
  '\t': '制表符',
};

function charDesc(c: string | undefined): string {
  if (c === undefined) return '（无）';
  const cp = (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0');
  const shown = c === '\n' ? '\\n' : c === '\t' ? '\\t' : c;
  const name = CHAR_NAMES[c];
  return `\`${shown}\`（U+${cp}${name ? ' ' + name : ''}）`;
}

/**
 * 找出期望与实际的第一个不同点，给出能看见隐形差异的提示。
 * 比较用归一化后的串（引号视为相等），但展示原始字符的码点；归一化长度不变，下标对齐。
 */
function describeFirstDiff(expected: string, actual: string): string {
  const ne = normalizeQuotes(expected);
  const na = normalizeQuotes(actual);
  const n = Math.min(ne.length, na.length);
  let i = 0;
  while (i < n && ne[i] === na[i]) i++;
  if (i === n && ne.length !== na.length) {
    const longer = na.length > ne.length ? '实际输出' : '期望输出';
    return `长度不同（${longer}多 ${Math.abs(na.length - ne.length)} 个字符，多半是多了/少了空格或换行）`;
  }
  return `第 ${i + 1} 个字符不同：你的是 ${charDesc(actual[i])}，期望 ${charDesc(expected[i])}`;
}
