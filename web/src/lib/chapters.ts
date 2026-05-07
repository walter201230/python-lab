/**
 * 章节元数据：首页章节卡片网格 + 路由生成的来源。
 *
 * 当一个章节做完后，把对应 lessons 数组填上、status 改 'available'。
 */

export interface ChapterLesson {
  id: string;
  title: string;
}

export interface Chapter {
  slug: string;
  number: number;
  title: string;
  description: string;
  lessons: ChapterLesson[];
  status: 'available' | 'planned';
  emoji: string;
}

export const CHAPTERS: Chapter[] = [
  {
    slug: 'python0',
    number: 0,
    title: '为什么学 Python',
    description: '正式开课前的开胃菜——Python 为什么火、能干啥、值不值得学。',
    lessons: [{ id: 'why-python', title: '为什么学 Python' }],
    status: 'available',
    emoji: '🌱',
  },
  {
    slug: 'python1',
    number: 1,
    title: 'Python 安装与第一个程序',
    description: '认识 Python，写下第一行代码——本课在浏览器里跑，不用装环境。',
    lessons: [{ id: 'intro-and-hello-world', title: 'Python 安装与第一个程序' }],
    status: 'available',
    emoji: '🚀',
  },
  {
    slug: 'python2',
    number: 2,
    title: '基本数据类型与变量',
    description: '从 print 开始，掌握字符串、数字、变量赋值——能让 Python 开口说话。',
    lessons: [{ id: 'data-types-and-variables', title: '基本数据类型与变量' }],
    status: 'available',
    emoji: '👋',
  },
  {
    slug: 'python3',
    number: 3,
    title: 'List 与 Tuple',
    description: '有序列表与不可变元组，最常用的两种容器类型。',
    lessons: [{ id: 'list-and-tuple', title: 'List 与 Tuple' }],
    status: 'available',
    emoji: '📋',
  },
  {
    slug: 'python4',
    number: 4,
    title: 'Dict 与 Set',
    description: '键值字典 + 去重集合，配合 List/Tuple 走遍数据世界。',
    lessons: [{ id: 'dict-and-set', title: 'Dict 与 Set' }],
    status: 'available',
    emoji: '🗂️',
  },
  {
    slug: 'python5',
    number: 5,
    title: '条件与循环',
    description: 'if / for / while + Python 3.10 新写法 match/case。',
    lessons: [{ id: 'conditions-and-loops', title: '条件与循环' }],
    status: 'available',
    emoji: '🔁',
  },
  {
    slug: 'python6',
    number: 6,
    title: '函数',
    description: '把一段逻辑包起来反复用——Python 工程的基石。',
    lessons: [{ id: 'functions', title: '函数' }],
    status: 'available',
    emoji: '🧩',
  },
  {
    slug: 'python7',
    number: 7,
    title: '迭代',
    description: 'for...in 怎么工作、自定义迭代器、生成器函数 yield。',
    lessons: [{ id: 'iteration', title: '迭代' }],
    status: 'available',
    emoji: '🔂',
  },
  {
    slug: 'python8',
    number: 8,
    title: '面向对象',
    description: '类、继承、多态——把数据和行为打包在一起。',
    lessons: [{ id: 'oop', title: '面向对象' }],
    status: 'available',
    emoji: '🏗️',
  },
  {
    slug: 'python9',
    number: 9,
    title: '模块',
    description: 'import / from-import / 标准库速览，让代码组织起来。',
    lessons: [{ id: 'modules', title: '模块' }],
    status: 'available',
    emoji: '📦',
  },
  {
    slug: 'python10',
    number: 10,
    title: '魔法方法',
    description: '__str__ / __eq__ / __len__ / __add__——让自定义类用起来像内置类型。',
    lessons: [{ id: 'magic-methods', title: '魔法方法' }],
    status: 'available',
    emoji: '🪄',
  },
  {
    slug: 'python11',
    number: 11,
    title: '枚举类',
    description: '用 Enum 取代魔法常量，让常量自己说话。',
    lessons: [{ id: 'enum', title: '枚举类' }],
    status: 'available',
    emoji: '🎯',
  },
  {
    slug: 'python12',
    number: 12,
    title: '元类 metaclass',
    description: '类也是对象——type() 三参数动态造类，metaclass 控制类的生成。',
    lessons: [{ id: 'metaclass', title: '元类' }],
    status: 'available',
    emoji: '🧬',
  },
  {
    slug: 'python13',
    number: 13,
    title: '线程与进程',
    description: 'threading / multiprocessing 概念速览：GIL、Lock、Queue、Pool。',
    lessons: [{ id: 'threading', title: '线程与进程' }],
    status: 'available',
    emoji: '🧵',
  },
  {
    slug: 'python14',
    number: 14,
    title: '正则表达式',
    description: 're 模块：用一行规则匹配/抽取/替换字符串里的复杂模式。',
    lessons: [{ id: 'regex', title: '正则表达式' }],
    status: 'available',
    emoji: '🔍',
  },
  {
    slug: 'python15',
    number: 15,
    title: '闭包',
    description: '函数里嵌函数 + 捕获外层变量——理解闭包就理解了装饰器。',
    lessons: [{ id: 'closure', title: '闭包' }],
    status: 'available',
    emoji: '🔗',
  },
  {
    slug: 'python16',
    number: 16,
    title: '装饰器',
    description: '@decorator 一行给函数加日志/缓存/权限——Python 最优雅的语法糖。',
    lessons: [{ id: 'decorator', title: '装饰器' }],
    status: 'available',
    emoji: '✨',
  },
  {
    slug: 'python17',
    number: 17,
    title: '代码可读性',
    description: '好命名 + 早返回 + 推导式 + 类型注解——让别人(和半年后的自己)看得懂。',
    lessons: [{ id: 'readable-code', title: '代码可读性' }],
    status: 'available',
    emoji: '📖',
  },
  {
    slug: 'python18',
    number: 18,
    title: 'pathlib：现代化路径处理',
    description: '用 Path 对象代替 os.path 字符串拼接——更直观、更不容易出错。',
    lessons: [{ id: 'pathlib', title: 'pathlib：现代化路径处理' }],
    status: 'available',
    emoji: '🗺️',
  },
  {
    slug: 'python19',
    number: 19,
    title: '异常处理',
    description: 'try / except / finally / raise + 自定义异常——别让一个错误搞挂整个程序。',
    lessons: [{ id: 'exception-handling', title: '异常处理' }],
    status: 'available',
    emoji: '🛡️',
  },
  {
    slug: 'python20',
    number: 20,
    title: 'dataclass',
    description: '一个装饰器自动生成 __init__/__repr__/__eq__——告别样板代码。',
    lessons: [{ id: 'dataclass', title: 'dataclass' }],
    status: 'available',
    emoji: '📐',
  },
  {
    slug: 'python21',
    number: 21,
    title: '上下文管理器（with）',
    description: 'with 到底在做什么？__enter__/__exit__ + @contextmanager 一次讲清。',
    lessons: [{ id: 'context-manager', title: '上下文管理器（with）' }],
    status: 'available',
    emoji: '🔒',
  },
  {
    slug: 'python22',
    number: 22,
    title: 'async / await',
    description: '协程基础：async def + await + asyncio.run + gather 并发。',
    lessons: [{ id: 'async', title: 'async / await' }],
    status: 'available',
    emoji: '⚡',
  },
  {
    slug: 'python23',
    number: 23,
    title: 'pyproject.toml + uv',
    description: '现代 Python 项目结构：pyproject.toml 标准配置 + uv 极速包管理。',
    lessons: [{ id: 'pyproject-uv', title: 'pyproject.toml + uv' }],
    status: 'available',
    emoji: '⚙️',
  },
  {
    slug: 'python24',
    number: 24,
    title: 'ruff：一站式代码检查',
    description: '一个工具搞定 black + flake8 + isort + pyupgrade，比传统组合快 10-100 倍。',
    lessons: [{ id: 'ruff', title: 'ruff：一站式代码检查' }],
    status: 'available',
    emoji: '🦀',
  },
  {
    slug: 'python25',
    number: 25,
    title: 'pytest：测试框架',
    description: '业界事实标准：fixture、参数化、marker、覆盖率——写测试也能很优雅。',
    lessons: [{ id: 'pytest', title: 'pytest：测试框架' }],
    status: 'available',
    emoji: '🧪',
  },
  {
    slug: 'python26',
    number: 26,
    title: '日志 logging',
    description: '把 print 调试升级成正经日志：5 个级别、format、getLogger、exception()。',
    lessons: [{ id: 'logging', title: '日志 logging' }],
    status: 'available',
    emoji: '📝',
  },
  {
    slug: 'python27',
    number: 27,
    title: '打包发布到 PyPI',
    description: '从零到能 pip install——src layout、uv build、uv publish，发个属于自己的 CLI 工具。',
    lessons: [{ id: 'pypi', title: '打包发布到 PyPI' }],
    status: 'available',
    emoji: '📤',
  },
  {
    slug: 'python28',
    number: 28,
    title: '学完之后',
    description: '29 章学完了，下一步该做啥？数据/AI、Web 后端、自动化运维三条出路。',
    lessons: [{ id: 'whats-next', title: '学完之后' }],
    status: 'available',
    emoji: '🎓',
  },
];

export function findFirstAvailable(): { chapter: Chapter; lesson: ChapterLesson } | null {
  for (const ch of CHAPTERS) {
    if (ch.status === 'available' && ch.lessons.length > 0) {
      return { chapter: ch, lesson: ch.lessons[0] };
    }
  }
  return null;
}

/**
 * 课程分组：把 29 章按学习路径分成三段，降低首页认知负担。
 *
 * 基础语法     0–9   入门到 OOP，能写小脚本
 * 进阶特性     10–22 魔法方法到 async，理解 Python 高级机制
 * 工程化与发布 23–28 项目结构、测试、打包发布
 */
export type ChapterGroupId = 'basics' | 'advanced' | 'engineering';

export interface ChapterGroup {
  id: ChapterGroupId;
  title: string;
  subtitle: string;
  description: string;
}

export const CHAPTER_GROUPS: ChapterGroup[] = [
  {
    id: 'basics',
    title: '基础语法',
    subtitle: '00 → 09',
    description: '从零到能写小脚本——变量、容器、控制流、函数、面向对象。',
  },
  {
    id: 'advanced',
    title: '进阶特性',
    subtitle: '10 → 22',
    description: '魔法方法、装饰器、闭包、async——理解 Python 的高级机制。',
  },
  {
    id: 'engineering',
    title: '工程化与发布',
    subtitle: '23 → 28',
    description: '现代项目工具链：pyproject + uv + ruff + pytest + 打包到 PyPI。',
  },
];

export function getChapterGroup(number: number): ChapterGroupId {
  if (number <= 9) return 'basics';
  if (number <= 22) return 'advanced';
  return 'engineering';
}

export function groupChapters(): { group: ChapterGroup; chapters: Chapter[] }[] {
  return CHAPTER_GROUPS.map((g) => ({
    group: g,
    chapters: CHAPTERS.filter((c) => getChapterGroup(c.number) === g.id),
  }));
}
