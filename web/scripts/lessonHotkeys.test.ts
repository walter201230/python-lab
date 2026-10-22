import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { handleLessonHotkey } from '../src/components/lesson/hooks/useLessonHotkeys';

// 仅模拟事件来源与布局边界；调用与页面相同的键盘处理函数。
class Target {
  card: Card | null = null;
  link: Target | null = null;
  input = false;
  hash = '';

  closest(selector: string): Target | null {
    if (selector === '[data-exercise-card]') return this.card;
    if (selector.startsWith('a[')) return this.link;
    return this.input ? this : null;
  }
}

class Card extends Target {
  dataset = { exerciseActionable: 'true' };
  disabled = false;
  clicks: string[] = [];
  rect = { top: 150, bottom: 650, left: 0, right: 900 };

  constructor() {
    super();
    this.card = this;
  }

  getBoundingClientRect() { return this.rect; }
  querySelector(selector: string) {
    return { disabled: this.disabled, click: () => this.clicks.push(selector) };
  }
}

let cards: Card[];
let toolbarBottom: number;
let directoryOpen: boolean;
const previous = new Map<string, PropertyDescriptor | undefined>();

beforeEach(() => {
  toolbarBottom = 120;
  directoryOpen = false;
  cards = [new Card(), new Card()];
  cards[0].rect = { top: -900, bottom: -100, left: 0, right: 900 };
  const globals = {
    Element: Target,
    window: { innerHeight: 800, innerWidth: 1000 },
    document: {
      querySelector: (selector: string) => selector === 'dialog[open]'
        ? (directoryOpen ? {} : null)
        : { getBoundingClientRect: () => ({ bottom: toolbarBottom }) },
      querySelectorAll: () => cards,
      getElementById: (id: string) => id === 'exercise-second' ? cards[1] : null,
    },
  };
  for (const [name, value] of Object.entries(globals)) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
});

afterEach(() => {
  for (const [name, descriptor] of previous) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});

function press(target: Target = new Target(), options: Partial<KeyboardEvent> = {}) {
  const event = {
    target, key: 'Enter', ctrlKey: true, metaKey: false, shiftKey: true,
    altKey: false, isComposing: false, repeat: false, defaultPrevented: false,
    prevented: false, stopped: false,
    preventDefault() { this.prevented = true; },
    stopPropagation() { this.stopped = true; },
    ...options,
  };
  handleLessonHotkey(event as unknown as KeyboardEvent);
  return event;
}

test('第一题查看答案后仍可编辑时，焦点在第二题就只检查第二题，并阻止默认插行', () => {
  const editor = new Target();
  editor.card = cards[1];
  const event = press(editor);
  assert.deepEqual(cards[0].clicks, []);
  assert.deepEqual(cards[1].clicks, ['[data-action="check"]']);
  assert.equal(event.prevented, true);
  assert.equal(event.stopped, true);
});

test('Mac 和 Ctrl 两种组合键均支持运行及检查，焦点优先于可见区域', () => {
  const editor = new Target();
  editor.card = cards[0];
  for (const metaKey of [false, true]) {
    press(editor, { metaKey, ctrlKey: !metaKey, shiftKey: false });
    press(editor, { metaKey, ctrlKey: !metaKey });
  }
  assert.deepEqual(cards[0].clicks, [
    '[data-action="run"]', '[data-action="check"]',
    '[data-action="run"]', '[data-action="check"]',
  ]);
  assert.deepEqual(cards[1].clicks, []);
});

test('编辑器外选择可见面积最大的题，忽略屏幕外更靠前的未通过题', () => {
  press();
  assert.deepEqual(cards[0].clicks, []);
  assert.deepEqual(cards[1].clicks, ['[data-action="check"]']);
});

test('常驻工具栏变高后，不操作被导航完全遮住的练习', () => {
  toolbarBottom = 200;
  cards[1].rect = { top: 130, bottom: 195, left: 0, right: 900 };
  assert.equal(press().prevented, false);
  cards[1].rect.bottom = 400;
  assert.equal(press().prevented, true);
  assert.equal(cards[1].clicks.length, 1);
});

test('打开目录时快捷键不运行被弹层遮住的练习', () => {
  directoryOpen = true;
  assert.equal(press().prevented, false);
  assert.deepEqual(cards.map((card) => card.clicks), [[], []]);
});

test('题号链接聚焦时以链接为准，不因另一题可见更多而选错', () => {
  cards[0].rect = { top: 120, bottom: 750, left: 0, right: 900 };
  const link = new Target();
  link.hash = '#exercise-second';
  link.link = link;
  press(link);
  assert.deepEqual(cards[0].clicks, []);
  assert.equal(cards[1].clicks.length, 1);
});

test('已通过、运行中或按钮禁用时不回退操作其他题，长按不重复执行', () => {
  const editor = new Target();
  editor.card = cards[1];
  cards[1].dataset.exerciseActionable = 'false';
  assert.equal(press(editor).prevented, true);
  cards[1].dataset.exerciseActionable = 'true';
  cards[1].disabled = true;
  press(editor);
  cards[1].disabled = false;
  press(editor, { repeat: true });
  assert.deepEqual(cards.map((card) => card.clicks), [[], []]);
});

test('没有可见题时不执行，当前可见题已通过时也不误跑其他题', () => {
  cards[1].rect.top = 900;
  assert.equal(press().prevented, false);
  cards[1].rect.top = 150;
  cards[1].dataset.exerciseActionable = 'false';
  assert.equal(press().prevented, true);
  assert.deepEqual(cards.map((card) => card.clicks), [[], []]);
});

test('其他输入框、输入法组合、额外 Alt 修饰键和非快捷键不触发练习', () => {
  const input = new Target();
  input.input = true;
  assert.equal(press(input).prevented, false);
  for (const options of [
    { isComposing: true }, { altKey: true }, { defaultPrevented: true },
    { key: 'a' }, { ctrlKey: false, metaKey: false },
  ]) assert.equal(press(new Target(), options).prevented, false);
  assert.deepEqual(cards.map((card) => card.clicks), [[], []]);
});
