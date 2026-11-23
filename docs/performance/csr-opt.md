# CSR 최적화 상세 기록

## 1차 확인사항

1. 초기 로딩이 느려보이진 않는다.
2. 초기 로딩 중 긴 작업이 존재한다. 그로인해 입력 처리가 지연될 수 있다.
3. aspect-ratio가 안정적인 역할을 헀다.
4. 검색 입력이 버벅거리는데, 입력 값을 처리하는데 많은 시간을 소모했다.
5. 초반 렌더링은 무게가 많이 나갔다. (검색어를 입력할때마다 commit시간 변화가 362.5ms -> 202.1ms -> 29ms...로 변했다.) 처음에는 그릴게 많기 때문이다. 후에는 filtering되므로 react계산, reconciliation, commit 할 내용 등이 줄어든다. 따라서 렌더링 비용이 점점 작아진다.
6. bottom-up으로 확인한 결과, DOM을 계산하고 그리는데에도 오랜 시간이 걸렸다. javascript작업이 오래걸릴 뿐만 아니라, 브라우저 작업도 오래걸린다.
7. 한 글자마다 입력시, filtered item을 계산하고, 이에따라 DOM을 다시 그리므로 오래 걸릴 것으로 예상된다.

## 1차 해결방향

1. memo, usecallback등의 최적화를 시도한다. movieCard의 내용은 변하지 않지만, 객체가 계속 재생성되고있다.
2. 이미지 lazy loading을 사용한다.
3. SearchBar debouncing을 적용한다.

## 2차 확인사항

1. 데이터 filtering결과, filtering된 데이터의 옵션별 정렬결과를 memo하여 캐싱했다. 데이터 배열을 memo했지만, jsx는 memo하지 않았다. 컴포넌트의 재렌더링이 계속된다.
2. 데이터 양이 많아서 여전히 느린 감이 있다.
3. SearchBar debouncing은 비교 실험 결과 300ms 보다 150ms가 효과가 더 좋다.

## 2차 해결방향

1. MovieList Component자체를 memo한다.
2. 현재 스크롤안에 보이는 것만 먼저 로딩한다.
3. SearchBaar debouncing을 150ms로 조정한다.
