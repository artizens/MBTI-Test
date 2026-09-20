import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { questions, personalityTypes, AXES } from '../src/lib/assessment';
assert.equal(questions.length, 12);
assert.equal(new Set(questions.map((q) => q.id)).size, 12);
for (const axis of AXES) {
  assert.equal(questions.filter((q) => q.axis === axis).length, 3);
}
for (const q of questions) {
  assert.equal(q.options.length, 2);
  assert.deepEqual(
    q.options.map((o) => o.trait).sort(),
    q.axis.split('').sort(),
  );
  assert.equal(new Set(q.options.map((o) => o.id)).size, 2);
}
assert.equal(personalityTypes.length, 16);
assert.equal(new Set(personalityTypes.map((p) => p.type)).size, 16);
for (const p of personalityTypes) {
  assert.match(p.type, /^[EI][SN][TF][JP]$/);
  for (const field of [p.traits, p.strengths, p.cautions, p.careers])
    assert.equal(field.length, 3);
  assert.ok(p.name && p.summary);
  assert.ok(
    existsSync(`public/results/${p.type}.png`),
    `${p.type} 이미지 없음`,
  );
}
console.log('문항 12개, 축별 배정, 유형 16종, 이미지 검증 완료');
