import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  questions,
  score,
  validateAnswers,
  parseSession,
} from '../src/lib/assessment';
test('모든 4,096개 응답 조합을 독립적인 다수결 기준으로 검증', () => {
  const types = new Set<string>();
  for (let mask = 0; mask < 4096; mask++) {
    const answers: Record<string, string> = {};
    const letters: string[] = [];
    questions.forEach((q, i) => {
      const option = q.options[(mask >> i) & 1];
      answers[q.id] = option.id;
      letters.push(option.trait);
    });
    const expected = ['EI', 'SN', 'TF', 'JP']
      .map((pair) =>
        letters.filter((x) => x === pair[0]).length >= 2 ? pair[0] : pair[1],
      )
      .join('');
    assert.equal(score(answers).type, expected);
    assert.equal(score(answers).type, score(answers).type);
    types.add(expected);
  }
  assert.equal(types.size, 16);
});
test('미응답과 문항에 속하지 않는 선택지는 거부', () => {
  assert.throws(() => score({}));
  assert.equal(validateAnswers({ q01: 'unknown' }), false);
  assert.equal(validateAnswers({ q01: 'q02-a' }), false);
  assert.equal(validateAnswers({ q99: 'q99-a' }), false);
});
test('답변 변경은 기존 답변을 대체하며 점수를 재계산', () => {
  const answers = Object.fromEntries(
    questions.map((q) => [
      q.id,
      q.options.find((o) => 'ESTJ'.includes(o.trait))!.id,
    ]),
  );
  assert.equal(score(answers).type, 'ESTJ');
  questions
    .filter((q) => q.axis === 'EI')
    .slice(0, 2)
    .forEach((q) => {
      answers[q.id] = q.options.find((o) => o.trait === 'I')!.id;
    });
  assert.equal(score(answers).type, 'ISTJ');
  assert.equal(Object.keys(answers).length, 12);
});
test('세션 손상과 이전 버전은 복원하지 않음', () => {
  assert.equal(parseSession('not json'), null);
  assert.equal(
    parseSession(JSON.stringify({ version: 1, index: 0, answers: {} })),
    null,
  );
  assert.equal(
    parseSession(JSON.stringify({ version: 2, index: 99, answers: {} })),
    null,
  );
  assert.deepEqual(
    parseSession(JSON.stringify({ version: 2, index: 0, answers: {} })),
    { version: 2, index: 0, answers: {} },
  );
});
