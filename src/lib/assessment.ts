import questionData from '../content/questions.json';
import profiles from '../content/personality-types.json';
export type Trait = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type Answers = Record<string, string>;
export type Session = { version: 2; index: number; answers: Answers };
export const questions = questionData;
export const personalityTypes = profiles;
export const SESSION_KEY = 'gyeol:assessment:v2';
export const AXES = ['EI', 'SN', 'TF', 'JP'] as const;
export function validateAnswers(value: unknown): value is Answers {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([id, choice]) =>
    questions.some(
      (q) => q.id === id && q.options.some((o) => o.id === choice),
    ),
  );
}
export function score(answers: Answers) {
  if (!validateAnswers(answers) || Object.keys(answers).length !== 12)
    throw new Error('12개의 유효한 답변이 필요합니다.');
  const scores: Record<Trait, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };
  for (const q of questions) {
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option) throw new Error('미응답 문항이 있습니다.');
    scores[option.trait as Trait]++;
  }
  const type = AXES.map((axis) =>
    scores[axis[0] as Trait] > scores[axis[1] as Trait] ? axis[0] : axis[1],
  ).join('');
  return { type, scores };
}
export function parseSession(raw: string | null): Session | null {
  if (!raw) return null;
  try {
    const s: unknown = JSON.parse(raw);
    if (!s || typeof s !== 'object') return null;
    const v = s as Partial<Session>;
    if (
      v.version !== 2 ||
      !Number.isInteger(v.index) ||
      v.index! < 0 ||
      v.index! > 11 ||
      !validateAnswers(v.answers)
    )
      return null;
    return { version: 2, index: v.index!, answers: v.answers };
  } catch {
    return null;
  }
}
export function readSession(): Session | null {
  try {
    return parseSession(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}
export function saveSession(session: Session): boolean {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}
export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* 메모리 검사는 계속 허용한다. */
  }
}
