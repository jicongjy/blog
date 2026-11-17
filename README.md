# blog

홍지영 블로그. 주소: https://jicongjy.github.io/blog/

- 화면: Vite + React (HashRouter, base `/blog/`)
- 배포: GitHub Pages (`main` 푸시 시 `.github/workflows/deploy.yml`)
- 데이터·로그인: Firebase (Firestore, Google 로그인). **아직 연결 전**이며, 지금은 `src/data/posts.js`(localStorage)와 `src/lib/auth.jsx`(미리보기 로그인)가 대신한다.

## 개발
```bash
npm install
npm run dev      # http://localhost:5173/blog/
npm run build
```

## Firebase 연결 (코드는 준비됨, 설정값만 넣으면 켜진다)

설정값(`VITE_FIREBASE_*`)이 없으면 지금처럼 브라우저 임시 저장과 미리보기 로그인으로 동작한다. 값이 있으면 자동으로 Firestore와 Google 로그인으로 바뀐다.

1. Firebase 콘솔에서 프로젝트 생성 → 웹 앱(`</>`) 등록 → 화면에 나오는 `firebaseConfig` 값을 확인
2. Authentication → 로그인 방법 → Google 사용 설정
3. Authentication → 설정 → 승인된 도메인에 `jicongjy.github.io` 추가 (`localhost`는 기본 포함)
4. Firestore Database 생성 (프로덕션 모드, 위치 `asia-northeast3` 서울)
5. Firestore → 규칙에 `firestore.rules` 내용을 붙여 넣고, `ADMIN_EMAIL_HERE`를 글을 쓸 구글 계정으로 바꿔 게시
6. 값 입력
   - 로컬: `.env.example`을 `.env`로 복사해 채운다 (`.env`는 git에 올라가지 않는다)
   - 배포: GitHub 저장소 Settings → Secrets and variables → Actions → **Variables**에 같은 이름으로 7개 등록 후 `Deploy to GitHub Pages` 워크플로를 다시 실행
7. 사이트에서 `#/login`으로 로그인해 글을 써 본다

웹 앱 설정값(`apiKey` 등)은 공개되는 값이라 Variables에 넣어도 된다. 권한은 `firestore.rules`가 지킨다.

## 데이터 구조
`posts/{id}`: `title`, `excerpt`, `category`, `thumbnail`(이미지 주소, 비면 자동 표지), `visibility`(`public`/`private`), `status`(`published`/`draft`), `body`(마크다운), `createdAt`, `updatedAt`
