import Link from 'next/link';
export default function NotFound() {
  return (
    <main
      id="main"
      style={{ textAlign: 'center', padding: '80px 24px', minHeight: '65vh' }}
    >
      <p style={{ color: '#2455ed' }}>결과를 찾을 수 없어요</p>
      <h1>새로운 나를 발견해 볼까요?</h1>
      <p>주소를 확인하거나 12가지 질문으로 나의 성향을 알아보세요.</p>
      <Link className="primary" href="/">
        처음 화면으로 →
      </Link>
    </main>
  );
}
