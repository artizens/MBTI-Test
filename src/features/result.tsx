'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  clearSession,
  personalityTypes,
  readSession,
  score,
} from '@/lib/assessment';
import styles from './result.module.css';
type Profile = (typeof personalityTypes)[number];
const meanings: Record<string, string> = {
  E: '외향',
  I: '내향',
  S: '감각',
  N: '직관',
  T: '사고',
  F: '감정',
  J: '판단',
  P: '인식',
};
export default function Result({ profile: p }: { profile: Profile }) {
  const router = useRouter();
  const [own, setOwn] = useState(false);
  const [message, setMessage] = useState('');
  const [showUrl, setShowUrl] = useState(false);
  const [url, setUrl] = useState('');
  const [nativeShare, setNativeShare] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  useEffect(() => {
    setUrl(`${location.origin}/result/${p.type}/`);
    setNativeShare(typeof navigator.share === 'function');
    const saved = readSession();
    if (saved) {
      try {
        setOwn(score(saved.answers).type === p.type);
      } catch {}
    }
    const controller = new AbortController();
    fetch(`/results/${p.type}.png`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('이미지 없음');
        return r.blob();
      })
      .then((blob) => {
        const file = new File([blob], `나의성향_${p.type}.png`, {
          type: 'image/png',
        });
        if (navigator.canShare?.({ files: [file] })) setImageFile(file);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [p.type]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setShowUrl(false);
      setMessage('결과 링크를 복사했어요. 원하는 곳에 붙여넣어 주세요.');
    } catch {
      setShowUrl(true);
      setMessage('아래 주소를 선택해 직접 복사해 주세요.');
    }
  }
  async function share(file?: File) {
    try {
      if (!navigator.share) {
        await copy();
        return;
      }
      await navigator.share(
        file
          ? { files: [file], title: `${p.type} — ${p.name}` }
          : {
              title: `${p.type} — ${p.name}`,
              text: `나의 성향 결과는 ${p.type}! 당신의 유형도 알아보세요.`,
              url,
            },
      );
      setMessage('공유 메뉴를 닫았어요.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessage(
        '공유를 열지 못했어요. 링크 복사나 이미지 저장을 이용해 주세요.',
      );
    }
  }
  function restart() {
    clearSession();
    router.push('/test/');
  }
  return (
    <main id="main" className={styles.shell}>
      <div className={styles.resultIntro}>
        <span className="eyebrow">
          {own ? '열두 번의 선택으로 발견한 나' : '이 유형의 특징'}
        </span>
        <h1>{own ? '지금의 나는,' : '이런 결을 가진 사람'}</h1>
        <p>하나의 유형보다 더 다채로운 당신을 알아가는 시작.</p>
      </div>
      <div className={styles.layout}>
        <aside className={styles.left}>
          <div className={styles.identity}>
            <div className={styles.cardTop}>
              <span>나의 성향 카드</span>
              <span>결.</span>
            </div>
            <div className={styles.code}>{p.type}</div>
            <h2>{p.name}</h2>
            <p>{p.summary}</p>
            <div className={styles.badges}>
              {p.type.split('').map((t) => (
                <span key={t}>
                  <b>{t}</b> {meanings[t]}
                </span>
              ))}
            </div>
            <div className={styles.cardBottom}>
              <span>12문항 간이 성향 검사</span>
              <span>✳</span>
            </div>
          </div>
          <div className={styles.shareBox}>
            <h2>나의 결을 나눠보세요</h2>
            <a
              className={styles.save}
              href={`/results/${p.type}.png`}
              download={`나의성향_${p.type}.png`}
            >
              ↓ 결과 이미지 저장
            </a>
            <div className={styles.shareRow}>
              <button onClick={() => share()}>
                {nativeShare ? '↗ SNS 공유' : '↗ 링크로 공유'}
              </button>
              <button onClick={copy}>⌁ 링크 복사</button>
            </div>
            {imageFile && (
              <button
                className={styles.imageShare}
                onClick={() => share(imageFile)}
              >
                이미지로 공유하기
              </button>
            )}
            <a
              className={styles.imageLink}
              href={`/results/${p.type}.png`}
              target="_blank"
              rel="noreferrer"
            >
              저장이 안 되나요? 이미지 열기 ↗
            </a>
            <p className={styles.shareHint}>공유 링크에는 유형만 담겨요.</p>
            <p className={styles.message} role="status">
              {message}
            </p>
            {showUrl && (
              <input
                className={styles.urlInput}
                aria-label="직접 복사할 결과 주소"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
              />
            )}
          </div>
        </aside>
        <div className={styles.details}>
          <section className={styles.section}>
            <div className={styles.sectionLabel}>
              01 <span>이런 모습이 있나요?</span>
            </div>
            <h2>나를 설명하는 세 가지 장면</h2>
            <ul className={styles.traits}>
              {p.traits.map((text, i) => (
                <li key={text}>
                  <span>0{i + 1}</span>
                  {text}
                </li>
              ))}
            </ul>
          </section>
          <section className={styles.section}>
            <div className={styles.sectionLabel}>
              02 <span>강점과 성장</span>
            </div>
            <h2>잘하는 것, 그리고 더 나아질 것</h2>
            <div className={styles.strengths}>
              {p.strengths.map((s) => (
                <span key={s}>✦ {s}</span>
              ))}
            </div>
            <h3>조금만 신경 쓰면 좋은 점</h3>
            <ul className={styles.cautions}>
              {p.cautions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section className={styles.section}>
            <div className={styles.sectionLabel}>
              03 <span>관심을 넓히는 힌트</span>
            </div>
            <h2>이런 일도 탐색해 보세요</h2>
            <div className={styles.careers}>
              {p.careers.map((c, i) => (
                <article key={c.name}>
                  <span className={styles.careerNumber}>0{i + 1}</span>
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.reason}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.careerNote}>
              직업은 성향만으로 결정되지 않아요. 관심과 경험, 역량을 함께
              살펴보세요.
            </p>
          </section>
        </div>
      </div>
      <section className={styles.end}>
        <span>어떤 결과든, 나는 나.</span>
        <h2>
          {own ? '다른 순간의 나도 궁금한가요?' : '당신은 어떤 결을 가졌나요?'}
        </h2>
        <button className="primary" onClick={restart}>
          {own ? '다시 검사하기' : '나도 검사하기'} <span>→</span>
        </button>
        <Link href="/">처음 화면으로</Link>
      </section>
      <p className={styles.disclaimer}>
        이 결과는 자체 제작한 12개 문항을 바탕으로 한 간이 성향 안내입니다. 공식
        MBTI 검사나 전문 심리 평가가 아니며, 상황에 따라 결과가 달라질 수
        있습니다. 추천 직업은 관심 분야를 탐색하는 참고 자료입니다.
      </p>
    </main>
  );
}
