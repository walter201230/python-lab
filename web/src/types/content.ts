/**
 * 课程内容数据格式定义（对应 OpenSpec lesson-content-format spec）。
 *
 * 目录结构：
 *   content/lessons/<chapter-slug>/<lesson-slug>/
 *     ├── lesson.json
 *     ├── steps/NN-*.mdx
 *     └── exercises/NN-*.json
 */

/** lesson.json 中 blocks 数组的元素：step 或 exercise，按顺序渲染。 */
export type LessonBlockRef =
  | { kind: 'step'; file: string }
  | { kind: 'exercise'; file: string };

/** 一节课的元数据（lesson.json）。 */
export interface LessonMeta {
  /** kebab-case，跟目录同名 */
  id: string;
  /** 显示标题 */
  title: string;
  /** 所属章节 slug，如 "python2" */
  chapter: string;
  /** 章节内排序，整数 */
  order: number;
  /** 预计学习时长（分钟），整数 */
  estimatedMinutes: number;
  /** 渲染顺序：step 与 exercise 交错排列 */
  blocks: LessonBlockRef[];
}

/** 判分规则——三类规则的组合，AND 关系。 */
export interface GradingRules {
  /** 期望 stdout 完全匹配 */
  stdoutEquals?: string;
  /** 期望执行后全局变量值的键值对 */
  varsEqual?: Record<string, string | number | boolean | null>;
  /** 必须存在的 AST 节点（格式 "NodeType:Name"，如 "FunctionDef:greet"） */
  requiredAst?: string[];
}

/** 一道练习题。 */
export interface Exercise {
  id: string;
  title: string;
  /** markdown 题面 */
  prompt: string;
  /** 编辑器初始代码 */
  starterCode: string;
  /** 参考答案 */
  solution: string;
  grading: GradingRules;
  /** 提示数组，0-3 条 */
  hints: string[];
}

/** 校验错误。 */
export interface ValidationError {
  file: string;
  message: string;
}
