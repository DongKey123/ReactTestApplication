# MemoAI 📝

> 빠르고 간편한 AI 보조 메모 앱 — React Native (Expo) 개인 프로젝트

**개발 기간**: 2025년 12월 ~ 3월 24일
**플랫폼**: Android

---

## 주요 기능

- **메모 작성 / 수정 / 삭제** — 제목, 본문, 날짜 선택
- **자동 저장** — 수정 모드에서 2초 debounce 자동 저장
- **폴더 관리** — 폴더 생성·수정·삭제·순서 변경
- **체크리스트** — 할 일 목록 추가 및 완료 체크
- **링크 첨부** — URL 유효성 검증 및 제목 설정
- **이미지 첨부** — 갤러리 선택 / 카메라 촬영 후 영구 저장
- **달력 연동** — 날짜별 메모 조회, 공휴일 표시
- **메모 검색** — 실시간 검색 및 최근 검색어 기록
- **북마크** — 중요 메모 즐겨찾기
- **서식 지원** — Bold, Italic 등 텍스트 서식 적용
- **AI 도우미** — 제목 추천, 내용 요약, 내용 확장, 문법 교정
- **다크 / 라이트 테마** — 시스템 설정 연동
- **개인정보처리방침** — 앱 내 인라인 표시

---

## 기술 스택

**Frontend**

- `React Native 0.81` `Expo SDK 54` `JavaScript`

**네비게이션**

- `@react-navigation/native` `@react-navigation/bottom-tabs` `@react-navigation/native-stack`

**데이터 저장**

- `AsyncStorage` — 모든 메모/폴더 데이터 로컬 저장
- `expo-file-system` — 첨부 이미지 영구 저장

**UI / 기능**

- `react-native-calendars` — 달력 및 공휴일 표시
- `react-native-gesture-handler` — 스와이프 제스처
- `expo-image-picker` — 갤러리 및 카메라 접근
- `react-native-safe-area-context` — Safe Area 처리

**배포**

- `EAS Build` — Android APK 빌드 및 배포

---

## 아키텍처

```
memo/
├── App.js                  # 네비게이션 구조 및 탭바
├── app.config.js           # Expo 앱 설정
├── context/
│   ├── MemoContext.js      # 메모/폴더 전역 상태 관리
│   └── ThemeContext.js     # 다크/라이트 테마 관리
├── screens/
│   ├── HomeScreen.js       # 홈 (달력 + 메모 목록)
│   ├── CreateScreen.js     # 메모 작성 / 수정
│   ├── MemoDetailScreen.js # 메모 상세 보기
│   ├── MemoScreen.js       # 폴더별 메모 목록
│   ├── SearchScreen.js     # 메모 검색
│   └── ProfileScreen.js    # 프로필 및 설정
├── services/
│   └── AIService.js        # AI 보조 기능 (로컬 처리)
└── components/
    └── FormattedText.js    # 서식 텍스트 렌더러
```

---

## APK 다운로드

[▶ 최신 APK 다운로드 (expo.dev)](https://expo.dev/accounts/ressna/projects/memoai)

---

## 개발 및 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npx expo start

# Android APK 빌드
eas build --platform android --profile preview
```

---

## 향후 개선 사항

- 실제 AI API (Claude / GPT) 연동
- 메모 간 태그 기능
- 메모 공유 기능
- iOS 버전 빌드
- 위젯 지원

## 회고록

처음 개발을 시작할 때 현직 개발자 지인의 도움을 받아 실무 환경 기준의 초기 세팅을 함께 진행했습니다.
덕분에 실제 프로젝트가 어떤 방식으로 구성되는지 빠르게 파악할 수 있었고, 그 과정 자체가 매우 즐겁고 값진 경험이었습니다.

다만 초기 세팅을 온전히 혼자 처음부터 구성한 것이 아니다 보니, 시간이 지나면서 일부 설정의 맥락이 흐릿해지는 부분이 있었습니다.
이를 통해 단순히 따라하는 것에 그치지 않고, 각 설정이 왜 필요한지 직접 찾아보고 이해하는 과정의 중요성을 깨달았습니다.

개발을 진행하면서 가장 크게 느낀 점은 **구현에 한계가 없다**는 것이었습니다.
아이디어를 코드로 실현할 수 있다는 사실이 개발의 재미를 더해주었고, 기능을 하나씩 완성해가는 과정에서 큰 성취감을 얻었습니다.

마지막으로 개발 환경(에뮬레이터)에서의 테스트 결과와 실제 기기 배포 결과가 다를 수 있다는 점을 직접 경험했습니다.
UI 배치나 Safe Area 처리 등 실기기에서만 확인할 수 있는 이슈들이 있었고, **테스트 환경과 실제 환경의 차이를 항상 염두에 두어야 한다**는 교훈을 얻었습니다.
