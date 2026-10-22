import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

const records = new Map<string, string>();
let failWrites = false;
let store: typeof import('../src/store/progress').useProgress;
const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

before(async () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (failWrites) throw new Error('QuotaExceededError');
      records.set(key, value);
    },
    removeItem: (key: string) => records.delete(key),
  } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage } });
  store = (await import('../src/store/progress')).useProgress;
});

beforeEach(() => {
  failWrites = false;
  store.setState({ byLesson: {} });
  records.clear();
});

after(() => {
  if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
  if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

test('草稿按课程和题目隔离，重水合恢复，空草稿不回退为初始代码', async () => {
  store.getState().ensureLesson('a', 'one');
  store.getState().ensureLesson('b', 'one');
  assert.equal(store.getState().saveDraft('a', 'one', 'print(123)'), true);
  assert.equal(store.getState().saveDraft('b', 'one', ''), true);
  const snapshot = records.get('lesson-progress')!;
  store.setState({ byLesson: {} });
  records.set('lesson-progress', snapshot);
  await store.persist.rehydrate();
  assert.equal(store.getState().byLesson.a.draftCode?.one, 'print(123)');
  assert.equal(store.getState().byLesson.b.draftCode?.one, '');
  assert.deepEqual(store.getState().byLesson.a.completed, []);
  assert.deepEqual(store.getState().byLesson.a.unlocked, ['one']);
});

test('旧进度兼容，保存草稿不解锁；通过后保留提交并拒绝草稿覆盖', async () => {
  const oldProgress = { unlocked: ['one'], completed: [], viewedSolution: [], currentExerciseId: 'one', submittedCode: {}, submittedOutput: {} };
  records.set('lesson-progress', JSON.stringify({ state: { byLesson: { a: oldProgress } }, version: 0 }));
  await store.persist.rehydrate();
  assert.equal(store.getState().saveDraft('a', 'locked', 'wrong'), false);
  assert.equal(store.getState().saveDraft('missing', 'one', 'wrong'), false);
  assert.equal(store.getState().saveDraft('a', 'one', 'draft'), true);
  assert.deepEqual(store.getState().byLesson.a.unlocked, ['one']);
  store.getState().markCompleted('a', 'one', 'passed', { stdout: 'ok', stderr: '' }, 'two');
  assert.equal(store.getState().saveDraft('a', 'one', 'overwrite'), false);
  assert.equal(store.getState().byLesson.a.submittedCode.one, 'passed');
  assert.deepEqual(store.getState().byLesson.a.unlocked, ['one', 'two']);
  store.getState().saveDraft('a', 'two', 'second draft');
  assert.equal(store.getState().byLesson.a.draftCode?.two, 'second draft');
});

test('存储失败可报告，输入仍在内存，恢复存储后可再次保存', () => {
  store.getState().ensureLesson('a', 'one');
  failWrites = true;
  assert.equal(store.getState().saveDraft('a', 'one', 'keep me'), false);
  assert.equal(store.getState().byLesson.a.draftCode?.one, 'keep me');
  assert.deepEqual(store.getState().byLesson.a.completed, []);
  failWrites = false;
  assert.equal(store.getState().saveDraft('a', 'one', 'keep me'), true);
  assert.equal(JSON.parse(records.get('lesson-progress')!).state.byLesson.a.draftCode.one, 'keep me');
});
