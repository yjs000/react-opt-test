# MovieLog — React CSR vs Next.js 성능 최적화 비교 프로젝트

## 1. 프로젝트 개요

### 목적

React CSR과 Next.js App Router로 동일한 영화 기록 웹 애플리케이션을 각각 구현하고, 성능 최적화 전후의 차이와 두 Framework의 Rendering 특성을 비교한다.

단순 CRUD 구현이 아니라 프론트엔드 성능 문제를 직접 재현하고, 원인을 분석하고, 개선 효과를 측정하는 학습 프로젝트다.

### 프로젝트 목표

1. React Rendering과 Reconciliation 이해
2. React.memo, useMemo, useCallback을 활용한 Memoization
3. 대량 데이터 Rendering 최적화
4. useDeferredValue를 활용한 입력 반응성 개선
5. React Query를 활용한 비동기 데이터 및 Cache 관리
6. Code Splitting과 Lazy Loading
7. 이미지 최적화와 Layout Shift 개선
8. CSR, SSR, Server Component, Client Component, Hydration 비교
9. Core Web Vitals 및 React Profiler 기반 성능 측정
10. 실험 결과를 바탕으로 기술적 판단과 개선 근거 설명

### 개발 제약

- 총 개발 및 측정 시간: **4시간 이내**
- TypeScript 필수
- React Query 필수
- 실제 Backend API 개발 금지
- 데이터베이스 및 인증 기능 제외
- 두 프로젝트는 동일한 사용자 기능과 데이터 사용
- 공통 코드와 UI를 최대한 재사용
- 성능 실험에 직접 기여하지 않는 기능은 최소화
- 개발 완료뿐 아니라 실제 성능 측정까지 4시간에 포함

---

## 2. 기술 스택

| 구분 | CSR | Next.js |
|---|---|---|
| Framework | React + Vite | Next.js App Router |
| Language | TypeScript | TypeScript |
| Data Fetching | TanStack Query | TanStack Query + Server Component |
| Mock Data | JSON + Promise 기반 Mock | 동일 데이터 |
| Styling | CSS Modules | CSS Modules |
| Client State | useState | useState |
| Local Persistence | localStorage | localStorage |
| Performance | React Profiler, Chrome DevTools, Lighthouse | 동일 |
| Backend | 없음 | 없음 |

### Mock API 정책

MSW와 별도 HTTP 서버는 초기 범위에서 제외한다.

Promise 기반 Mock Function을 사용한다.

```tsx
const getMovies = async (): Promise<Movie[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return movies;
};

const { data, isPending, isFetching, isError } = useQuery({
  queryKey: ["movies"],
  queryFn: getMovies,
  staleTime: 60_000,
});
```

Mock Function은 다음 기능을 지원해야 한다.

- 정상 응답
- 300ms 지연 응답
- 의도적 Error 발생
- Retry
- Query Cache
- Query Invalidation

단, Promise Mock은 실제 HTTP 요청이 아니므로 Network Waterfall과 HTTP Cache 성능을 검증하는 실험으로 간주하지 않는다.

공식 문서: https://tanstack.com/query/latest/docs/framework/react/guides/query-functions

---

## 3. 기능 요구사항

프로젝트 이름: MovieLog

### 필수 기능

| ID | 기능 | 요구사항 |
|---|---|---|
| F-01 | 영화 목록 | Poster, 제목, 개봉 연도, 평점 표시 |
| F-02 | 영화 검색 | 제목 기준 실시간 검색 |
| F-03 | 영화 정렬 | 제목순, 평점순 |
| F-04 | 영화 상세 | Modal로 상세 정보 표시 |
| F-05 | 감상 기록 | 감상 여부 및 개인 평점 1~5점 |
| F-06 | 내 기록 | 감상한 영화만 표시 |
| F-07 | 비동기 상태 | Loading, Error, Retry 처리 |
| F-08 | 성능 실험 | 최적화 전후 비교 가능 |

### 데이터 정책

- 동일한 영화 데이터 사용
- 기본 데이터 약 100개
- 성능 테스트용 5,000개 데이터 생성
- 데이터 생성은 Deterministic하게 수행
- 동일 Seed와 동일 순서 유지
- Poster 이미지도 양쪽에서 동일하게 사용
- 감상 기록은 localStorage에 저장
- 실제 외부 영화 API 사용하지 않음

### 제외 기능

- 로그인
- 회원가입
- Backend API
- 데이터베이스
- 리뷰 작성
- 이미지 업로드
- 복잡한 페이지 Routing
- 고급 디자인 및 애니메이션

---

## 4. 성능 최적화 실험 요구사항

### P-01. React Re-rendering 및 Memoization

목적: 불필요한 Component Re-rendering을 관찰하고 개선한다.

실험 전:

- 부모 State 변경 시 영화 Card Re-rendering 발생
- Filtering 및 Sorting 반복 계산
- Callback Reference 반복 생성

실험 후:

- React.memo 적용
- useMemo 적용
- useCallback 적용

측정:

- React Profiler
- Component Render Duration
- Re-rendering 횟수
- Commit Duration

요구사항:

- 최적화 전후 동일한 사용자 동작 수행
- 실제 차이가 발생하는 상황을 재현할 것
- 최적화 효과가 없다면 그 이유도 기록할 것
- 불필요한 Memoization을 무조건 적용하지 말 것

공식 문서:

- https://react.dev/reference/react/memo
- https://react.dev/reference/react/useMemo
- https://react.dev/reference/react/useCallback
- https://react.dev/reference/react/Profiler

### P-02. 대량 목록 Rendering 최적화

목적: 대량 DOM Rendering에 따른 성능 문제를 경험한다.

데이터 규모:

- 기본 모드: 100개
- 성능 테스트 모드: 5,000개

비교 조건:

1. 전체 목록 Rendering
2. Pagination 적용

Pagination:

- 페이지당 20개
- 다음/이전 페이지 이동
- 검색 및 정렬 결과에 Pagination 적용

측정:

- Render Duration
- DOM Node Count
- 사용자 반응성

Virtualization은 4시간 제한을 고려하여 제외한다.

### P-03. 검색 입력 반응성 개선

목적: 검색 입력 시 발생하는 Rendering 지연을 개선한다.

비교:

1. 즉시 Filtering
2. useDeferredValue 적용
3. useMemo 적용
4. 필요하다면 두 기법 조합

측정:

- 입력 반응성
- 검색 결과 Rendering 시간
- React Profiler

주의사항:

- useDeferredValue가 JavaScript 계산 자체를 제거하는 것은 아님
- useMemo가 입력값 변경마다 발생하는 계산을 항상 줄여주는 것은 아님
- Debounce와 useDeferredValue의 목적을 구분할 것

공식 문서:
https://react.dev/reference/react/useDeferredValue

### P-04. Code Splitting 및 Lazy Loading

목적: 초기 JavaScript Bundle 크기를 줄이는 기법을 경험한다.

대상:

- 영화 상세 Modal

비교:

1. 정적 Import
2. Dynamic Import

CSR:

- React.lazy
- Suspense

Next.js:

- Dynamic Import
- 해당 환경에 적합한 Loading 처리

측정:

- 초기 JavaScript Bundle 크기
- 초기 다운로드 리소스
- Modal 최초 실행 지연

공식 문서:
https://react.dev/reference/react/lazy

### P-05. 이미지 최적화 및 CLS

목적: Poster 이미지로 인한 Loading 비용과 Layout Shift를 관찰한다.

실험:

1. 이미지 크기 미지정
2. width, height, aspect-ratio 적용
3. Lazy Loading 적용
4. Next.js Image 적용

측정:

- CLS
- LCP
- 이미지 Transfer Size
- 이미지 요청 시점

주의사항:

- 동일한 원본 이미지 사용
- 이미지 크기와 압축률 차이를 기록
- Above-the-fold 이미지와 Below-the-fold 이미지 구분
- Next.js Image 최적화 결과와 일반 img의 차이를 분석

공식 문서:
https://web.dev/articles/cls

---

## 5. CSR vs Next.js 비교 요구사항

### R-01. CSR Rendering

React + Vite 기반 CSR 구현.

기본 흐름:

1. HTML 다운로드
2. JavaScript 다운로드 및 실행
3. React 실행
4. Mock Query 호출
5. 영화 목록 Rendering

### R-02. Next.js Rendering

Next.js App Router 기반 구현.

기본 구성:

- Server Component: 초기 영화 데이터 준비 및 전달
- Client Component: 검색, 정렬, 기록, Modal
- Client Component에 React Query 적용

실험 대상:

- Server Component
- Client Component
- Hydration
- 초기 HTML
- JavaScript Bundle
- 초기 콘텐츠 표시

### R-03. 비교의 공정성

두 프로젝트는 아래 조건을 동일하게 유지한다.

- 영화 데이터
- UI 구조 및 CSS
- 검색 및 정렬 알고리즘
- 카드 수
- 이미지
- 사용자 동작
- 실행 기기
- 브라우저
- Network Throttling
- CPU Throttling

실험은 다음 두 종류로 구분한다.

**실험 A — Rendering 비교**

- 동일한 정적 데이터 사용
- 초기 HTML 및 콘텐츠 표시 속도 비교
- CSR과 Next.js Rendering 방식 차이에 집중

**실험 B — Data Fetching 비교**

- 동일한 Mock 지연 시간 적용
- Loading UX 비교
- React Query의 Client Cache 동작 확인
- 실제 Network Request 성능 비교라고 해석하지 않음

Next.js의 Server Cache와 React Query의 Client Cache는 서로 다른 개념임을 명확히 구분한다.

공식 문서:
https://nextjs.org/docs/app/getting-started/server-and-client-components

---

## 6. 최적화 비교 모드

가능하다면 Optimization ON/OFF 기능을 구현한다.

대상:

- Memoization
- useDeferredValue
- Pagination
- Lazy Loading

단, 최적화 전후 코드가 달라야 하는 실험은 별도 Component로 분리해도 된다.

우선순위:

1. 실제 성능 차이가 관찰되는 코드
2. 실험 재현성
3. 비교 편의성
4. 설정 UI

설정 UI 구현에 시간을 지나치게 사용하지 않는다.

필요하다면 URL Parameter 또는 개발용 상수를 이용해 실험 모드를 전환한다.

---

## 7. 성능 측정

### 필수 측정 지표

| 지표 | 목적 | 도구 |
|---|---|---|
| LCP | 주요 콘텐츠 표시 속도 | Lighthouse |
| CLS | Layout Shift | Lighthouse |
| TBT | 초기 Main Thread Blocking | Lighthouse |
| INP | 사용자 상호작용 반응성 | Chrome DevTools |
| Render Duration | Component Rendering 비용 | React Profiler |
| JS Transfer Size | JavaScript 다운로드 크기 | Chrome DevTools |
| DOM Node Count | 대량 목록 Rendering 비용 | Chrome DevTools |

### 측정 조건

- Production Build 필수
- Development Mode 측정 결과를 최종 비교에 사용하지 않음
- 동일한 Chrome 버전
- 동일한 기기
- 동일한 화면 크기
- 동일한 CPU / Network Throttling
- 동일한 데이터
- 최소 3회 반복 측정
- Median을 대표값으로 기록
- Cold Load와 Warm Navigation을 구분

### 결과표

| 지표 | CSR 기본 | CSR 최적화 | Next.js 기본 | Next.js 최적화 |
|---|---|---|---|---|
| LCP | | | | |
| CLS | | | | |
| TBT | | | | |
| JS Transfer Size | | | | |
| Render Duration | | | | |
| DOM Node Count | | | | |

추가로 다음을 기록한다.

- 실험 조건
- 최적화 방법
- 변경 전후 수치
- 개선율
- 예상과 다른 결과
- 원인 분석
- 실무 적용 가능성

주의:

- Next.js가 반드시 CSR보다 빠르다고 가정하지 않는다.
- Lighthouse의 Lab 측정만으로 실제 사용자 INP를 단정하지 않는다.
- Framework 차이와 개별 최적화 기법의 효과를 혼동하지 않는다.

공식 문서:
https://web.dev/articles/vitals

---

## 8. 프로젝트 구조

권장 구조:

```text
movie-performance-lab/
├── apps/
│   ├── csr/
│   │   └── React + Vite
│   │
│   └── next/
│       └── Next.js App Router
│
├── packages/
│   └── shared/
│       ├── types.ts
│       ├── movies.json
│       ├── mockApi.ts
│       └── components/
│
└── README.md
```

공유 대상:

- Movie TypeScript Interface
- Mock 영화 데이터
- 검색 로직
- 정렬 로직
- MovieCard
- 공통 스타일
- 성능 테스트 데이터 생성 로직

가능하면 UI 구현 차이를 최소화하여 Framework 자체의 Rendering 차이를 비교한다.

---

## 9. 개발 일정

총 240분 이내.

| 시간 | 작업 |
|---|---|
| 0~40분 | 프로젝트 생성, 공유 데이터 및 컴포넌트 |
| 40~100분 | CSR 영화 목록, 검색, 정렬, React Query |
| 100~160분 | Next.js App Router 및 동일 기능 구현 |
| 160~210분 | Memoization, Pagination, Deferred Rendering, Lazy Loading |
| 210~240분 | Production Build, 성능 측정, 결과 정리 |

### 우선순위

**P0 — 반드시 완료**

- CSR 프로젝트
- Next.js 프로젝트
- TypeScript
- React Query
- 영화 목록
- 검색 및 정렬
- 동일한 Mock 데이터
- React Profiler 실험
- 기본적인 CSR vs Next.js 성능 비교

**P1 — 가능하면 완료**

- React.memo / useMemo / useCallback
- useDeferredValue
- Pagination
- Lazy Loading
- 이미지 크기 지정
- 성능 측정표

**P2 — 시간 부족 시 제외**

- localStorage 영화 기록
- 상세 Modal의 추가 정보
- Error Simulation UI
- 공통 Button Component 정교화
- Optimization 설정 UI

---

## 10. 완료 기준 (Definition of Done)

### 기능

- 두 프로젝트가 정상 실행된다.
- 동일한 데이터를 사용한다.
- 영화 목록, 검색, 정렬이 정상 작동한다.
- React Query를 사용한다.
- Next.js는 App Router와 Server Component를 활용한다.

### 성능 실험

최소 다음 실험 결과를 확보한다.

1. Memoization 적용 전후 비교
2. 대량 목록 Rendering과 Pagination 비교
3. Lazy Loading 적용 전후 Bundle 비교
4. CSR과 Next.js 초기 Rendering 비교

가능하다면 다음 실험도 수행한다.

5. useDeferredValue 적용 전후 비교
6. 이미지 최적화 전후 LCP/CLS 비교

### 산출물

- 실행 가능한 두 프로젝트
- README
- 실험 방법
- 최적화 전후 비교표
- 측정 결과 및 해석
- 한계점 및 후속 개선 사항

---

## 11. 다른 에이전트에게 요청하는 평가

당신은 Senior Frontend Engineer이자 기술면접 평가자다.

위 프로젝트 요구사항을 검토하고 다음 항목을 냉정하게 평가해 달라.

### 평가 항목

1. **학습 적합성**
   - React Rendering, Memoization, React Query, Next.js를 학습하기에 적절한가?
   - CJ ONE 프론트엔드 실무 면접 준비에 도움이 되는가?
   - 학습 내용 중 빠진 핵심 개념이 있는가?

2. **기술적 정확성**
   - React 최적화 실험이 실제 성능 차이를 검증할 수 있게 설계되었는가?
   - CSR과 Next.js 비교 방식이 공정한가?
   - Mock API 설계가 적절한가?
   - Next.js Server Component와 React Query의 역할 구분이 적절한가?
   - React Profiler, Lighthouse, Core Web Vitals 측정 방법이 타당한가?

3. **구현 가능성**
   - 총 4시간 이내에 완료 가능한가?
   - 과도한 기능이나 불필요한 복잡성이 있는가?
   - 시간 대비 학습 효과가 낮은 요구사항은 무엇인가?
   - 기능을 더 줄여야 한다면 무엇을 제외해야 하는가?

4. **성능 실험의 신뢰성**
   - 데이터량이 적절한가?
   - 실제 병목이 재현될 가능성이 높은가?
   - 최적화 효과를 객관적으로 측정할 수 있는가?
   - 실험 설계에 Confounding Variable이 있는가?
   - 결과 해석 시 주의해야 할 점은 무엇인가?

5. **개선 제안**
   - 4시간 내에서 학습 효과를 극대화할 수 있는 개선안을 제시하라.
   - 새로운 기능 추가보다는 기존 요구사항을 단순화하거나 실험의 질을 높이는 방향을 우선하라.
   - 필요하다면 기술 스택이나 프로젝트 구조도 수정 제안하라.

### 평가 결과 형식

다음 형식으로 답변하라.

**1. 종합 평가**

- 총점: 100점 만점
- 학습 적합성:
- 기술적 정확성:
- 구현 가능성:
- 실험 신뢰성:

**2. 잘 설계된 부분**

**3. 문제점 및 위험 요소**

심각도에 따라 Critical / Major / Minor로 분류.

**4. 반드시 수정해야 할 요구사항**

**5. 제외하거나 축소할 요구사항**

**6. 최종 권장 MVP**

4시간 내 구현 가능한 최소 기능 및 실험 구성.

**7. 최종 권장 개발 일정**

총 240분 이내로 구체적으로 제시.

### 평가 원칙

- 기술적 근거를 우선한다.
- 무조건 긍정적으로 평가하지 않는다.
- 성능 차이를 실제로 측정할 수 있는지 중점적으로 검토한다.
- 불필요한 Overengineering을 지적한다.
- 학습 효과와 개발 시간을 함께 고려한다.
- 공식 React, Next.js, TanStack Query, web.dev 문서를 우선 근거로 활용한다.
- 제안한 모든 기능을 구현하도록 강요하지 않는다.
- 현재 요청은 **요구사항 평가 및 개선**이며, 실제 코드를 작성하거나 프로젝트를 생성하지 않는다.