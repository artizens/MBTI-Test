'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readSession, clearSession } from '@/lib/assessment';
export default function Home() {
  const router = useRouter();
  const [resume, setResume] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    const saved = readSession();
    setResume(
      !!saved &&
        Object.keys(saved.answers).length > 0 &&
        Object.keys(saved.answers).length < 12,
    );
  }, []);
  function fresh() {
    clearSession();
    router.push('/test/');
  }
  return (
    <main id="main" className="home">
      <section className="intro">
        <div className="eyebrow">
          <span className="smallMark">✳</span> 열두 번의 선택, 하나의 나
        </div>
        <h1>
          당신은 어떤
          <br />
          <span>결</span>을 가진 사람인가요?
        </h1>
        <p className="introText">
          함께 있을 때의 나, 혼자일 때의 나.
          <br />
          일상 속 작은 선택에서 나다운 모습을 발견해 보세요.
        </p>
        <div className="facts">
          <span>12개의 질문</span>
          <i />
          <span>약 2~3분</span>
          <i />
          <span>가입 없이</span>
        </div>
        <Link
          className="primary start"
          href="/test/"
          onClick={() => {
            if (!resume) clearSession();
          }}
        >
          {resume ? '이어서 검사하기' : '나의 성향 알아보기'}{' '}
          <span aria-hidden="true">↗</span>
        </Link>
        <div>
          {resume && (
            <button className="resetLink" onClick={() => setConfirmReset(true)}>
              새로 시작하기
            </button>
          )}
        </div>
        {confirmReset && (
          <div
            className="resetPanel"
            role="alertdialog"
            aria-modal="false"
            aria-label="답변 초기화 확인"
          >
            <p>진행 중인 답변을 지우고 새로 시작할까요?</p>
            <button onClick={fresh}>새로 시작</button>
            <button autoFocus onClick={() => setConfirmReset(false)}>
              계속 이어하기
            </button>
          </div>
        )}
        <p className="startNote">깊게 고민하지 말고, 평소의 나를 골라주세요.</p>
      </section>
      <section
        className="typeArt"
        aria-label="네 가지 성향을 조합해 나를 발견하세요"
      >
        <div className="artTop">
          <span>나를 이루는 네 가지 방향</span>
          <span>01 — 04</span>
        </div>
        <div className="letterGrid">
          <div className="letterTile tileE">
            <strong>
              E<span>I</span>
            </strong>
            <small>에너지의 방향</small>
          </div>
          <div className="letterTile tileN">
            <strong>
              N<span>S</span>
            </strong>
            <small>세상을 보는 방식</small>
          </div>
          <div className="letterTile tileF">
            <strong>
              F<span>T</span>
            </strong>
            <small>마음이 향하는 기준</small>
          </div>
          <div className="letterTile tileP">
            <strong>
              P<span>J</span>
            </strong>
            <small>일상을 채우는 리듬</small>
          </div>
        </div>
        <div className="artBottom">
          <span>16가지 모습, 모두 다른 매력.</span>
          <span className="asterisk">✳</span>
        </div>
      </section>
      <aside className="bottomNote">
        <span className="noteNumber">나를 발견하는 방법</span>
        <p>
          정답은 없어요.
          <br />
          <strong>지금의 나에게 더 가까운 쪽을 선택해 주세요.</strong>
        </p>
        <p className="disclaimer">
          자체 제작한 12문항의 간이 성향 검사입니다.
          <br />
          공식 MBTI 검사나 전문 심리 평가가 아닙니다.
        </p>
      </aside>
    </main>
  );
}
