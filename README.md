# 한입 AI하루: 아침 식단 영양소 분석 웹앱

## 프로젝트 목적

사용자가 아침 식단을 사진 또는 텍스트로 입력하면, OpenAI API를 통해 식단과 영양소를 분석하고 부족한 영양소 및 다음 식사 추천을 제공하는 모바일 친화적 웹앱입니다.

## 주요 기능

- 아침 식단 입력(사진 업로드 또는 텍스트)
- OpenAI API 기반 식단 및 영양소 분석
- 부족한 영양소 및 다음 식사 추천
- 회원가입/로그인(구글, 카카오 소셜 로그인)
- 사용자별 식단 기록 및 리포트
- 다크/라이트 모드 지원
- 모바일 최적화 UI/UX

## 기술 스택

- **Next.js 15** (React 기반 프레임워크)
- **TypeScript**
- **Tailwind CSS** (다크/라이트 모드 지원)
- **Supabase** (DB 및 인증)
- **OpenAI API** (식단 분석)

## 환경설정

1. 레포지토리 클론

   ```bash
   git clone https://github.com/jaloveeye/hanip-aiharu.git
   cd hanip-aiharu
   ```

2. 패키지 설치

   ```bash
   npm install
   # 또는 yarn, pnpm, bun
   ```

3. 환경변수 설정
   - `.env.example` 파일 참고하여 `.env` 파일 생성 및 값 입력

4. 개발 서버 실행

   ```bash
   npm run dev
   ```

## 기여 방법

1. 이슈 등록 또는 포크 후 브랜치 생성
2. 기능 개발 및 테스트
3. PR(Pull Request) 생성

## 라이선스

MIT

---
문의: <jaloveeye@gmail.com>
