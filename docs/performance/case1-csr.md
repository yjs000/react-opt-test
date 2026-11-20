# case1 (CSR) 보고서

## 확인사항

1. 초기 로딩이 느려보이진 않는다. ( LCP 1.3초 )
2. 초기 로딩 중 긴 작업이 존재한다. 그로인해 입력 처리가 지연될 수 있다.
3. aspect-ratio가 안정적인 역할을 헀다.( CLS 0 )
4. 검색 입력이 버벅거리는데, 입력 값을 처리하는데 많은 시간을 소모했다.
5. 초반 렌더링은 무게가 많이 나갔다. (검색어를 입력할때마다 commit시간 변화가 362.5ms -> 202.1ms -> 29ms...로 변했다.) 처음에는 그릴게 많기 때문이다. 후에는 filtering되므로 react계산, reconciliation, commit 할 내용 등이 줄어든다. 따라서 렌더링 비용이 점점 작아진다.
6. bottom-up으로 확인한 결과, DOM을 계산하고 그리는데에도 오랜 시간이 걸렸다. javascript작업이 오래걸릴 뿐만 아니라, 브라우저 작업도 오래걸린다.
7. 한 글자마다 입력시, filtered item을 계산하고, 이에따라 DOM을 다시 그리므로 오래 걸릴 것으로 예상된다.

## 1차 해결방향

1. memo, usecallback등의 최적화를 시도한다. movieCard의 내용은 변하지 않지만, 객체가 계속 재생성되고있다.
2. 이미지 lazy loading을 사용한다.
3. SearchBar debouncing을 적용한다.

## 측정 기록

2026-11-19 · CSR 기본 · 정렬 추가 전. 단일 측정값이며 중앙값은 아니다.

[종합 보고서](../PERFORMANCE_REPORT.md)

## 초기 로딩

| 지표 |       값 |
| ---- | -------: |
| LCP  |    1.3 s |
| CLS  |        0 |
| TBT  | 3,650 ms |

## 검색 입력

| 항목                      |        값 |
| ------------------------- | --------: |
| Performance 화면 INP 표시 |    556 ms |
| 선택 Keyboard interaction | 556.23 ms |
| Input delay               |      4 ms |
| Processing duration       |    486 ms |
| Presentation delay        |     66 ms |

## 상세 측정

### Performance 선택 구간

선택 범위: 15 ms–6.77 s.

| 항목      |       값 |
| --------- | -------: |
| Total     | 6,754 ms |
| Scripting |   629 ms |
| Rendering |   285 ms |
| System    |   273 ms |
| Painting  |   105 ms |
| Messaging |     0 ms |

### React Profiler

선택 컴포넌트: MovieBoard.

- Duration: 215.1ms of 362.5ms

| 순서 | Rendered at | for 표시값 |
| ---- | ----------- | ---------: |
| 1    | 1.8 s       |   362.5 ms |
| 2    | 6.5 s       |   202.1 ms |
| 3    | 6.6 s       |      29 ms |
| 4    | 6.6 s       |     5.6 ms |
| 5    | 6.6 s       |     5.4 ms |
| 6    | 6.6 s       |     7.9 ms |

### 별도 LCP breakdown 캡처

| 항목                   |        값 |
| ---------------------- | --------: |
| Time to first byte     |     10 ms |
| Resource load delay    |  2,380 ms |
| Resource load duration |    140 ms |
| Element render delay   | 21,770 ms |
| 네 값의 합             | 24,300 ms |

### 별도 Bottom-up 캡처

| Activity                                          | Self time | Self 비율 | Total time | Total 비율 |
| ------------------------------------------------- | --------: | --------: | ---------: | ---------: |
| removeChild                                       |   84.4 ms |     19.0% |    84.4 ms |      19.0% |
| Layout                                            |   82.5 ms |     18.6% |    82.5 ms |      18.6% |
| updateVirtualChildrenRecursively (installHook.js) |   68.5 ms |     15.5% |    95.0 ms |      21.4% |
| Pre-paint                                         |   37.9 ms |      8.5% |    37.9 ms |       8.5% |
| Hit test                                          |   23.6 ms |      5.3% |    23.6 ms |       5.3% |
| Vt                                                |   23.4 ms |      5.3% |    23.4 ms |       5.3% |
| Event: pointermove                                |   22.1 ms |      5.0% |   352.8 ms |      79.6% |
| Minor GC                                          |   14.9 ms |      3.4% |    14.9 ms |       3.4% |
| releaseHostInstance (installHook.js)              |   11.0 ms |      2.5% |    14.4 ms |       3.2% |
| updateChildrenRecursively (installHook.js)        |    5.6 ms |      1.3% |    79.9 ms |      18.0% |
| Paint                                             |    3.9 ms |      0.9% |     3.9 ms |       0.9% |
| Function call                                     |    3.6 ms |      0.8% |   263.5 ms |      59.4% |

## 추후 삭제 필요

## 근거

| 자료                 | 파일                                                       |
| -------------------- | ---------------------------------------------------------- |
| Performance Summary  | `codex-clipboard-294579d8-c817-461c-97ac-80f4f4c9b107.png` |
| Keyboard interaction | `codex-clipboard-9a87a119-25c9-457d-ad61-e42ad643dda9.png` |
| Main track           | `codex-clipboard-7cc48ead-4b2d-4001-adef-869c72dd7aad.png` |
| React Profiler       | `codex-clipboard-bd7fb529-b38c-4b64-8092-2ff7cc6782f7.png` |
| LCP breakdown        | `codex-clipboard-2d1a28f3-4017-4390-b9fb-a2bbba4b959b.png` |
| Bottom-up            | `codex-clipboard-c54f7b60-e816-424d-aa86-39f68824d18b.png` |

측정 근거는 아래 캡처와 코드다. 구현 근거는 `src/MovieBoard.tsx`, `src/MovieCard.tsx`, `src/movies/movie.api.ts`, `src/movies/movie.quries.ts`, `src/movies/movie.utils.ts`, `src/data/movies.json`이다.
