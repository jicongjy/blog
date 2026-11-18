# GA4 설정 체크리스트 (운영용)

PRD(`docs/prd/blog-v2-analytics.md`)의 이벤트 요구사항을 구현한 뒤 GA 콘솔에서 하는 설정 목록이다. 코드 변경이 아니며 PRD 범위 밖의 운영 작업이다.

## 1. 맞춤 측정기준 (이벤트 범위, 문자 값)
`post_id`, `post_title`, `post_category`, `post_published`, `page_type`, `click_location`, `category`, `scroll_depth`, `share_method`, `search_term`, `traffic_type`

## 2. 맞춤 측정항목 (숫자 값)
`read_minutes`(분), `engaged_seconds`(초), `result_count`(개)

## 3. 기타 콘솔 설정
- 향상된 측정의 "기록 이벤트에 따른 페이지 변경" 해제 (`page_view` 이중 집계 방지)
- 핵심 이벤트 지정: `article_read`, `share`, `like`, `scrap`
- 데이터 보관 기간 14개월
- 내부 트래픽 데이터 필터: `traffic_type=internal` 제외, "테스트" 상태 확인 후 "활성" 전환

## 4. 글별 지표 확인용 GA 탐색 보고서
행에 `post_id`/`post_title`, 열에 조회수, 평균 참여 시간, `article_read`·`share`·`like`·`scrap` 이벤트 수를 배치한다. 길이 보정 참여율, 완독률, 반응률은 계산이 필요하다.

## 5. 후속 대시보드 사전 설정
GA 속성에 서비스 계정 조회 권한 부여, 서버 함수(Cloud Functions) 사용 가능한 요금제 확인. 서비스 계정 키는 저장소에 넣지 않는다.

## 6. 검증
설정 후 실시간 보고서와 DebugView에서 매개변수 값이 이벤트에 표시되는지 확인한다. 등록 이전 데이터는 소급되지 않는다.
