# 환경변수 설정 가이드

## Supabase 설정

hanip.aiharu.net에서 aiharu.net과 동일한 Google 계정으로 자동 로그인되도록 하려면 다음 환경변수를 설정해야 합니다.

### 1. .env.local 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정 (aiharu.net과 동일한 값 사용)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 사이트 URL (배포 시 변경)
NEXT_PUBLIC_SITE_URL=https://hanip.aiharu.net

# OpenAI API Key (식단 분석용)
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Supabase 대시보드 설정

1. **Supabase 대시보드** → **Authentication** → **URL Configuration**
2. **Site URL**: `https://hanip.aiharu.net`
3. **Redirect URLs**에 다음 URL들을 추가:
   - `https://hanip.aiharu.net/auth/callback`
   - `https://hanip.aiharu.net`

### 3. Google OAuth 설정

Google Cloud Console에서 OAuth 2.0 클라이언트 ID의 승인된 리디렉션 URI에 다음을 추가:
- `https://hanip.aiharu.net/auth/callback`

## 테스트 방법

1. aiharu.net에서 Google 로그인
2. "지금 시작하기" 버튼 클릭
3. hanip.aiharu.net으로 리다이렉트되면서 자동 로그인 확인
4. hanip.aiharu.net에서 사용자 정보 표시 확인

## 주의사항

- aiharu.net과 동일한 Supabase 프로젝트를 사용해야 함
- 환경변수가 올바르게 설정되어야 함
- 배포 시 NEXT_PUBLIC_SITE_URL을 실제 도메인으로 변경
