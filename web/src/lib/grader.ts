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
    if (actual.stdout !== rules.stdoutEquals) {
      return {
        pass: false,
        msg: `输出与期望不一致——期望 \`${escape(rules.stdoutEquals)}\`，实际 \`${escape(actual.stdout)}\``,
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
