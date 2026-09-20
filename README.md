# 결 — 12문항 성향 검사

Next.js, React, TypeScript로 만든 한국어 MBTI 간이 성향 검사입니다.

## 실행

Node.js 20.9 이상과 npm이 필요합니다. 의존성 버전은 잠금 파일을 기준으로 설치합니다.

```sh
npm ci
npm run dev
```

브라우저에서 http://127.0.0.1:3000 을 엽니다.

## 검증 및 배포

```sh
npm run test:unit
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`out/`에 생성되는 정적 웹 페이지를 HTTPS 호스팅에 배포합니다. 결과 경로는 `/result/ENFP/`와 같은 폴더형 주소입니다. 다른 호스팅으로 옮길 때는 `src/lib/site.ts`의 원점을 변경하고 다시 빌드합니다.

`npm run test:e2e`는 Playwright 브라우저가 설치된 환경에서 사용할 수 있습니다. 별도 설치가 필요하면 `npx playwright install chromium`을 실행합니다. 현재 작업에서의 검증 결과는 `VALIDATION.md`를 참고하세요.

## 수정할 파일

- `src/content/questions.json`: 12개 문항과 선택지별 성향
- `src/content/personality-types.json`: 16개 유형의 설명, 강점, 유의할 점, 추천 직업
- `src/features/`: 시작·검사·결과 화면과 스타일
- `src/lib/assessment.ts`: 입력 검증, 채점, 임시 저장
- `src/app/globals.css`: 공통 색상과 시작 화면 스타일
- `public/results/`: 1080×1350 PNG 결과 카드 16종

## 콘텐츠 변경

문항이나 채점 정책을 바꾸면 검사 버전과 세션 저장 키도 변경합니다. 현재 버전은 1입니다. 문항 수와 축별 배정은 빌드에서 검증됩니다.

결과 원고를 바꾼 뒤 Windows에서 아래 명령으로 결과 카드를 다시 만듭니다. 다른 운영체제에서는 이미 생성된 PNG를 그대로 사용할 수 있습니다.

```powershell
powershell -NoProfile -File scripts/generate-cards.ps1
```

화면과 이미지는 같은 JSON을 사용합니다. 생성 후 줄바꿈과 잘림을 확인하고 빌드합니다.

## 제품 정책

- 회원가입, 백엔드, 사용자 DB가 없습니다.
- 개별 답변은 현재 탭의 세션 저장소에만 보관합니다.
- 공유 주소에는 유형만 포함합니다.
- 기기 공유 기능 미지원 시 링크 복사를 제공합니다.
- 공유 메뉴를 여는 것과 외부 SNS 게시 완료는 구분합니다.
- 서비스는 공식 MBTI 검사 또는 전문 심리 평가가 아닙니다.
- 운영 분석 도구는 연결하지 않았습니다.
- 공개된 SNS 미리보기와 타인 접근은 호스팅의 공개 범위에 따릅니다. 비공개 배포에서는 소유자만 열람할 수 있습니다.

## 개발 가이드와의 구현 차이

- 테스트 실행은 Windows 환경 호환성을 위해 TypeScript를 먼저 컴파일한 뒤 Node 테스트 실행기를 사용합니다.
- 결과 카드 생성은 Windows 기본 그래픽 기능을 사용합니다. 실행 중 이미지 생성 서버는 필요하지 않습니다.
- 시작 화면의 공통 스타일은 전역 CSS에 있고, 검사·결과 화면은 CSS Modules로 분리했습니다.
- 16개 유형 콘텐츠는 기획 초안이며, 공개 출시 전 내용 검토를 권장합니다.
