# 홍지영 기획 노트: 에이전트 인수인계

다른 AI가 이어서 작업할 때 가장 먼저 읽는 문서. 작업 기록과 겪은 문제는 `docs/work-log.md`(번호순), 실행과 Firebase 설정은 `README.md`.

## 현재 상태 (2026-11-17)
- 주소: https://jicongjy.github.io/blog/ (HashRouter, `base: '/blog/'`). `main`에 푸시하면 GitHub Actions가 자동 배포한다.
- Firebase 연결 완료: 프로젝트 `gen-lang-client-0559087225`, Firestore 이름 있는 데이터베이스 `blog`, Google 로그인. 관리자 계정만 글 쓰기. 규칙은 `firestore.rules`(저장소에는 `ADMIN_EMAIL_HERE` 자리표시자, 실제 주소는 콘솔 규칙에만 있다).
- 화면: 홈(`/`), 전체 글(`/notes`), 글 상세(`/post/:id`)는 잡지형 새 디자인. 글쓰기(`/write`), 카테고리 관리(`/admin/categories`), 로그인은 아직 옛 디자인.
- GA4 코드 완료(`src/lib/analytics.js`). 측정 ID(`VITE_GA_MEASUREMENT_ID`)를 GitHub Variables에 등록하기 전까지는 꺼져 있다. 사용자가 GA 속성을 만들고 `G-...` ID를 줄 예정.
- 색 조합 기능 완료(왼쪽 아래 해 아이콘). 현재 조합 5개는 임시이며 사용자가 정한 조합을 주면 `src/lib/theme.js`의 `PALETTES`만 교체한다.

## 디자인 규칙 (사용자 확정, 어기지 말 것)
- 잡지형. 선과 테두리 없음, 글자 크기는 13px 하나로 두고 굵기와 회색으로만 위계. Pretendard만 사용, 전체 흰 화면, 흑백(강조색 없음), 마스코트 사용 안 함.
- 문구는 담담한 한국어. 대시(—)와 AI 티 나는 표현 금지.
- 색은 `.hm` 영역의 `--ink`(글자), `--hm-bg`(배경)에서 `color-mix`로 회색 단계를 만든다. 새 스타일에 `#fff`나 회색 hex를 직접 쓰지 말고 `--ink`, `--gray`, `--soft-gray`, `--slot`을 쓴다.
- 홈 스크롤은 `src/lib/sectionScroll.js`가 휠과 방향키를 가로채 첫 화면, 글 하나씩, 맨 아래로 한 칸씩 이동시킨다(CSS scroll-snap은 끊겨서 제거함).

## 구조
- `src/pages`: Home, List, Post, Editor, Categories, Login. `src/components`: HmTop(상단 한 줄), ThemeSwitch, RichEditor(Tiptap), Body.
- 글 본문은 HTML로 저장, 옛 마크다운 글은 불러올 때 변환(`src/lib/body.js`), 표시할 때 DOMPurify로 정리.
- 카테고리는 Firestore `categories`(name, order). 글에는 카테고리 이름 문자열을 저장하며, 이름을 바꾸면 글도 일괄 갱신한다.
- 이미지: `public/images/`. 홈 첫 화면 카테고리용 정사각형은 `cat-plan|design|ops.jpg`, 글 카드 기본 이미지(가로형)는 `plan|design|ops.jpg`, 임시 글 썸네일은 `post-1..4.jpg`(`src/data/categoryImages.js`, `tempPosts.js`).
- Firebase 설정값은 `VITE_FIREBASE_*` 환경 변수(로컬 `.env`는 git 제외, 배포는 GitHub Variables). 값이 없으면 localStorage 미리보기 모드로 동작.

## 남은 일
1. 사용자: GA 속성 생성 후 측정 ID 전달 → `gh variable set VITE_GA_MEASUREMENT_ID --repo jicongjy/blog --body G-XXXX` 후 재배포, GA 실시간 보고서로 확인. GA 콘솔에서 향상된 측정의 "기록 이벤트에 따른 페이지 변경"은 꺼야 중복 집계가 없다.
2. 사용자: `/admin/categories`에서 카테고리 이름을 영어로 바꾸고 "임시 글 4개 등록"을 다시 눌러 썸네일을 붙인다.
3. 색 조합: 사용자가 준 조합으로 `PALETTES` 교체.
4. 글쓰기, 카테고리 관리, 로그인 화면을 새 디자인으로 통일(완료 후 `Mascot.jsx` 삭제 가능).
5. 확인 못 한 것: 실제 마우스 휠, 트랙패드에서의 스크롤 감각(이동 시간 `sectionScroll.js`의 `DURATION` 0.6초).

## 작업 방식
- 사용자 지시가 있을 때만 커밋한다. 커밋 제목은 `유형(범위): 한 줄`(feat, fix, design, content, docs, refactor, chore), 한국어, 한 커밋에 한 변경.
- 문제를 겪고 해결하면 `docs/work-log.md`에 번호를 이어서 적는다.
- 배포 후에는 `gh run list --repo jicongjy/blog --limit 1`로 성공 여부를 확인한다.
