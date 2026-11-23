# MovieLog — React CSR 성능 최적화 실험

영화 7,956개를 검색·정렬하면서 React와 브라우저의 렌더링 비용을 비교하는 학습 프로젝트입니다.

- **공개 데모:** https://yjs000.github.io/react-opt-test/
- **보고서 원문:** [성능 비교 보고서](docs/PERFORMANCE_REPORT.md)
- **실험 과정:** [CSR 최적화 상세 기록](docs/performance/csr-opt.md)
- **최초 요구사항:** [PROJECT_REQUIREMENTS](PROJECT_REQUIREMENTS.md)

## 현재 구현

- 포스터, 제목, 외부 평점, 원어, 개봉 연도 표시
- 제목 검색: 초기 검색어 `t`, 150 ms 디바운스
- 기본순 / 제목 오름차순 / 평점 내림차순 정렬
- TanStack Query로 정적 JSON 로딩
- 카드·목록 `memo`, 필터 결과 `useMemo`, 동일 필터 결과의 정렬 기준별 캐시
- 포스터 비율 고정, 이미지 지연 로딩, `content-visibility: auto`

현재 데이터는 `src/data/movies.json`의 7,956개 영화입니다. 포스터만 TMDB 이미지 서버에서 불러오며 현재 실행 경로에는 API 키가 필요하지 않습니다. 최초 요구사항의 약 100개/동일 seed 5,000개 Promise Mock 구성과는 다릅니다.

Next.js App Router는 비교 목표이며 아직 구현되지 않았습니다. 상세 모달, 감상 기록, 페이지네이션, `useDeferredValue`, 코드 분할도 현재 구현 범위에 포함되지 않습니다.

## 기술 스택

`package-lock.json`의 설치 해석 버전 기준입니다.

| 기술              | 버전    |
| ----------------- | ------- |
| React / React DOM | 19.3.1  |
| Vite              | 8.3.8   |
| TypeScript        | 7.0.2   |
| TanStack Query    | 5.108.0 |
| Tailwind CSS      | 4.3.5   |

린트는 Oxlint, 포맷은 Prettier를 사용합니다.

## 로컬 실행

배포 환경과 맞추려면 Node.js 24를 사용합니다.

```sh
npm ci
npm run dev
```

터미널에 표시되는 `/react-opt-test/` 경로로 접속합니다.

```sh
npm run lint
npm run build
npm run preview
```

`build`는 TypeScript 검사 후 `dist`를 생성합니다. `preview`는 빌드 결과를 로컬에서 확인하는 용도입니다. 전체 포맷 검사는 `npm run format:check`로 실행합니다.

## GitHub Pages 배포

[배포 워크플로](.github/workflows/deploy.yml)는 `main` push 또는 Actions의 수동 실행으로 동작합니다. 의존성 설치 → 린트 → 프로덕션 빌드 → Pages 업로드·배포 순서입니다.

저장소 Settings → Pages의 Source는 **GitHub Actions**를 사용합니다. Vite `base`는 `/react-opt-test/`입니다. 저장소 이름이나 배포 경로를 바꾸면 이 값도 확인해야 합니다. [Vite 공식 배포 가이드](https://vite.dev/guide/static-deploy.html#github-pages)를 기준으로 구성했습니다.

## 성능 결과와 해석

아래는 기존 보고서의 내용이며 공개 배포 서버에서 새로 측정한 결과가 아닙니다. 여러 최적화를 묶은 버전 비교이므로 개별 기법의 단독 효과로 해석할 수 없습니다. 목록 표시와 빠른 입력은 개선됐지만 CLS는 악화됐고, 220 ms 대기 조건에서는 전체 목록 재표시와 지연이 남았습니다. 포스터 요청을 차단한 측정이므로 공개 데모의 이미지 로딩 성능을 대표하지 않습니다.

### MovieLog 성능 비교 보고서

기록일: 2026-11-19. 최종 갱신: 2026-11-23. 종합표의 `—`는 비교 가능한 측정값이 없음을 뜻한다.

### 1. 구분

| 구분        | 실제 구현·변경                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSR 기본    | 검색 및 전체 카드 렌더링 (`654b4b7`)                                                                                                                     |
| CSR 최적화  | 카드 및 목록 `memo`, 필터 결과 재사용, 같은 필터 결과의 정렬 기준별 캐시, 150 ms 검색 디바운스, `content-visibility: auto`, 이미지 지연 로딩 (`1f541f7`) |
| Next 기본   | 구현 내역 없음                                                                                                                                           |
| Next 최적화 | 구현 내역 없음                                                                                                                                           |

### 2. 고정 조건

| 항목        | 값                              |
| ----------- | ------------------------------- |
| 데이터      | `src/data/movies.json`, 7,956개 |
| 초기 검색어 | `t`                             |

### 3. 총 지표

CSR 기본(`654b4b7`)과 CSR 최적화(`1f541f7`)를 별도 Chrome 157 창에서 비교했다. 동일한 영화 데이터, 1280 × 800 CSS 픽셀, DPR 1, HTTP 캐시 비활성화, 포스터 요청 차단 조건이다. 프로덕션 빌드를 사용했고 React 렌더 시간만 같은 방식의 별도 프로파일링 빌드에서 계측했다. 회차마다 버전 실행 순서를 바꾼 3쌍의 중앙값이다. 횟수는 전체 3회 중 관찰된 횟수다.

<table>
  <thead>
    <tr>
      <th colspan="2" scope="colgroup">지표</th>
      <th scope="col" align="right">CSR 기본</th>
      <th scope="col" align="right">CSR 최적화</th>
      <th scope="col" align="right">Next 기본</th>
      <th scope="col" align="right">Next 최적화</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="rowgroup" rowspan="4">초기 로딩</th>
      <th scope="row">목록 표시</th>
      <td align="right">2,468.7 ms</td>
      <td align="right"><strong>819.4 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">LCP</th>
      <td align="right"><strong>0.076 s</strong></td>
      <td align="right">0.080 s</td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">CLS</th>
      <td align="right"><strong>0.001</strong></td>
      <td align="right">0.193</td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">TBT (FCP~탐색 후 8초)</th>
      <td align="right">2,074.0 ms</td>
      <td align="right"><strong>2,037.0 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
  </tbody>
  <tbody>
    <tr>
      <th scope="rowgroup" rowspan="4">검색어 삭제 후 60 ms</th>
      <th scope="row">첫 글자 반영</th>
      <td align="right">2,360.5 ms</td>
      <td align="right"><strong>19.4 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">가장 느린 글자 반영</th>
      <td align="right">2,360.5 ms</td>
      <td align="right"><strong>19.4 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">전체 목록이 다시 표시된 횟수</th>
      <td align="right">3/3회</td>
      <td align="right"><strong>0/3회</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">첫 글자 요청부터 최종 결과 표시까지</th>
      <td align="right">2,360.5 ms</td>
      <td align="right"><strong>546.4 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
  </tbody>
  <tbody>
    <tr>
      <th scope="rowgroup" rowspan="4">검색어 삭제 후 220 ms</th>
      <th scope="row">첫 글자 반영</th>
      <td align="right">2,304.6 ms</td>
      <td align="right"><strong>648.8 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">전체 목록이 다시 표시된 횟수</th>
      <td align="right">3/3회</td>
      <td align="right">3/3회</td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">마지막 글자 처리 후 최종 결과 표시</th>
      <td align="right"><strong>103.3 ms</strong></td>
      <td align="right">636.0 ms</td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
    <tr>
      <th scope="row">첫 글자 요청부터 최종 결과 표시까지</th>
      <td align="right">2,304.6 ms</td>
      <td align="right"><strong>1,215.8 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
  </tbody>
  <tbody>
    <tr>
      <th scope="rowgroup">빠른 검색어 교체</th>
      <th scope="row">React 렌더링 시간 합계</th>
      <td align="right">163.4 ms</td>
      <td align="right"><strong>3.6 ms</strong></td>
      <td align="right">—</td>
      <td align="right">—</td>
    </tr>
  </tbody>
</table>

- **초기 로딩**은 첫 8초를 관찰했다. 목록 표시는 초기 7,697개가 DOM에 반영된 뒤 두 번째 프레임 콜백이다. LCP는 구간 내 마지막 후보이며 기본은 `H1`, 최적화는 `H1`이었다. CLS는 구간 내 최대 세션 창 점수다. TBT는 FCP부터 탐색 후 8초까지 긴 작업에서 50 ms를 초과한 부분의 합이다. [web.dev TBT](https://web.dev/articles/tbt)
- **검색어 교체**는 `tiger`로 시작해 새로고침 없이 두 단어로 차례로 바꿨다. 회차별 다음 두 단어는 `ice → woman`, `woman → night`, `night → ice`다. 입력을 전부 지운 뒤 첫 글자는 각각 60 ms와 220 ms에, 이어지는 글자는 90 ms 간격으로 요청했다. 글자 반영은 해당 키 명령 요청부터 `input` 이벤트 후 두 번째 프레임까지, 최종 결과 표시는 기대한 목록 개수를 확인한 뒤 두 번째 프레임까지의 근사치다. 마지막 글자 처리 후부터 잰 값에는 그 글자의 처리 전 대기가 들어가지 않는다.
- **React 렌더링 시간 합계**는 `tiger` 결과에서 첫 번째 단어로 빠르게 교체하는 동안 기록된 모든 커밋의 `actualDuration` 합이다. 초창기 버전은 입력과 결과 갱신이 결합돼 있어 두 버전 모두 검색 결과 렌더를 포함했다. DOM 커밋과 브라우저의 스타일 계산·레이아웃 시간은 포함하지 않는다. [React Profiler](https://react.dev/reference/react/Profiler)

연속 입력이 빠르면 현재 버전은 빈 검색어 때문에 전체 목록을 다시 그리는 일을 줄인다. 잠깐 쉬는 220 ms 조건은 현재 버전에도 전체 목록 갱신이 남는 재현 시나리오다. 초창기 단일 탐색 기록과 현재의 별도 INP 후보는 측정 동작이 달라 이 비교표의 수치에서 제외했다.

상세 과정: [CSR 최적화](docs/performance/csr-opt.md).
