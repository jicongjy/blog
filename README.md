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

## Firebase 연결할 때 (예정)
1. Firebase 콘솔에서 프로젝트 생성 → 웹 앱 등록 → Authentication(Google), Firestore 활성화
2. `.env.example`을 `.env`로 복사해 값 입력. 배포용은 GitHub 저장소 Settings → Variables에 같은 이름으로 등록
3. Authentication → 설정 → 승인된 도메인에 `jicongjy.github.io` 추가
4. `src/data/posts.js`와 `src/lib/auth.jsx`의 함수 본문만 Firebase 호출로 교체 (화면 코드는 그대로)
5. Firestore 규칙: 읽기는 발행된 글 공개, 쓰기는 본인 계정만
