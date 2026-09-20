'use client';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  questions,
  score,
  readSession,
  saveSession,
  SESSION_KEY,
  type Answers,
} from '@/lib/assessment';
import styles from './assessment.module.css';
type ToolContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export default function Assessment() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const title = useRef<HTMLHeadingElement>(null);
  const state = useRef({ answers, index });
  state.current = { answers, index };
  useEffect(() => {
    const saved = readSession();
    if (saved) {
      setAnswers(saved.answers);
      setIndex(saved.index);
    } else {
      try {
        if (sessionStorage.getItem(SESSION_KEY))
          setNotice('이전 진행 내용을 복원할 수 없어 새로 시작합니다.');
      } catch {
        setNotice(
          '현재 탭에서는 검사를 할 수 있지만 새로고침하면 답변이 초기화될 수 있어요.',
        );
      }
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !saveSession({ version: 1, index, answers }))
      setNotice(
        '새로고침하면 답변이 초기화될 수 있어요. 이 화면에서 계속해 주세요.',
      );
  }, [answers, index, ready]);
  useEffect(() => {
    if (ready) title.current?.focus();
  }, [index, ready]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: ToolContext })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'answer_current_question',
            description:
              '현재 검사 문항에 답변을 선택합니다. 다음 문항 이동과 결과 생성은 화면 버튼으로 합니다.',
            inputSchema: {
              type: 'object',
              properties: { optionId: { type: 'string' } },
              required: ['optionId'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute(input) {
              if (!input || typeof input !== 'object' || !('optionId' in input))
                throw new Error('선택지 식별자가 필요합니다.');
              const optionId = input.optionId;
              const q = questions[state.current.index];
              if (
                typeof optionId !== 'string' ||
                !q.options.some((o) => o.id === optionId)
              )
                throw new Error('현재 문항의 선택지가 아닙니다.');
              flushSync(() =>
                setAnswers((prev) => ({ ...prev, [q.id]: optionId })),
              );
              return { questionId: q.id, selectedOptionId: optionId };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* 미지원 환경에서는 기본 UI를 사용한다. */
    }
    return () => lifecycle.abort();
  }, []);
  const q = questions[index];
  const completed = Object.keys(answers).length;
  const progress = (completed / 12) * 100;
  function next() {
    if (!answers[q.id]) return;
    if (index < 11) {
      setIndex(index + 1);
      return;
    }
    const missing = questions.findIndex((item) => !answers[item.id]);
    if (missing >= 0) {
      setIndex(missing);
      setNotice('아직 답하지 않은 질문이 있어요.');
      return;
    }
    router.push(`/result/${score(answers).type}/`);
  }
  if (!ready)
    return (
      <main id="main" className={styles.shell}>
        <p role="status">질문을 준비하고 있어요.</p>
      </main>
    );
  return (
    <main id="main" className={styles.shell}>
      <div className={styles.topline}>
        <Link href="/">← 처음 화면</Link>
        <span>12가지 질문으로 만나는 나</span>
      </div>
      <div className={styles.progressLabel}>
        <span>
          질문 <strong>{String(index + 1).padStart(2, '0')}</strong> / 12
        </span>
        <span>
          {completed}개 답변 완료 · {Math.round(progress)}%
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="답변 완료율"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div style={{ width: `${progress}%` }} />
      </div>
      <section className={styles.card}>
        <span className={styles.number}>
          QUESTION {String(index + 1).padStart(2, '0')}
        </span>
        <h1 ref={title} tabIndex={-1}>
          {q.text}
        </h1>
        <p className={styles.hint}>평소의 나에게 더 가까운 쪽을 골라주세요.</p>
        <fieldset className={styles.options}>
          <legend className={styles.srOnly}>{q.text}</legend>
          {q.options.map((o, i) => (
            <label
              key={o.id}
              className={`${styles.option} ${answers[q.id] === o.id ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={answers[q.id] === o.id}
                onChange={() =>
                  setAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                }
              />
              <span className={styles.optionLetter}>{i === 0 ? 'A' : 'B'}</span>
              <span>{o.text}</span>
              <span aria-hidden="true" className={styles.check}>
                {answers[q.id] === o.id ? '✓' : ''}
              </span>
            </label>
          ))}
        </fieldset>
        <div className={styles.actions}>
          <button
            className={styles.previous}
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            ← 이전
          </button>
          <button className="primary" disabled={!answers[q.id]} onClick={next}>
            {index === 11 ? '결과 보기' : '다음 질문'}{' '}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      <p className={styles.reassurance}>
        정답은 없어요. 서로 다른 선택이 나만의 결을 만들어요.
      </p>
      {notice && (
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      )}
    </main>
  );
}
