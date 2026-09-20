import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = {
  title: '결 — 나를 발견하는 12가지 질문',
  description:
    '12개의 질문으로 만나는 나다운 모습. MBTI 간이 성향 검사와 결과 공유.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <a className="skip" href="#main">
          본문으로 건너뛰기
        </a>
        <header className="header">
          <Link href="/" className="brand" aria-label="결 홈">
            결<span className="brandDot" />
          </Link>
          <span className="headerLabel">나를 알아가는 작은 시간</span>
          <span className="headerTag">MBTI 성향 검사</span>
        </header>
        {children}
        <footer className="footer">
          <span>
            결 <span className="footerCopy">다름을 이해하는 시작</span>
          </span>
          <span>정답 없이, 나답게.</span>
        </footer>
      </body>
    </html>
  );
}
