# MovieLog 성능 비교 보고서

기록일: 2026-11-19. 최종 갱신: 2026-11-23. 종합표의 `—`는 비교 가능한 측정값이 없음을 뜻한다.

## 1. 구분

| 구분        | 실제 구현·변경                                                                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSR 기본    | 검색 및 전체 카드 렌더링 (`654b4b7`)                                                                                                                     |
| CSR 최적화  | 카드 및 목록 `memo`, 필터 결과 재사용, 같은 필터 결과의 정렬 기준별 캐시, 150 ms 검색 디바운스, `content-visibility: auto`, 이미지 지연 로딩 (`1f541f7`) |
| Next 기본   | 구현 내역 없음                                                                                                                                           |
| Next 최적화 | 구현 내역 없음                                                                                                                                           |

## 2. 고정 조건

| 항목        | 값                              |
| ----------- | ------------------------------- |
| 데이터      | `src/data/movies.json`, 7,956개 |
| 초기 검색어 | `t`                             |

## 3. 총 지표

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

상세 과정: [CSR 최적화](performance/csr-opt.md).
