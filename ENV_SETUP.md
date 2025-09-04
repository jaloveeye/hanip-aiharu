# 환경변수 및 OAuth 리디렉션 설정 가이드

## 목표

- 한입(`hanip.aiharu.net`)과 아이하루(`www.aiharu.net`)가 같은 Supabase 프로젝트를 사용해도, 각 앱에서 로그인하면 각자의 콜백으로 정확히 돌아가도록 설정합니다.

## Supabase 설정

### 1) Authentication → URL Configuration

- **Site URL**: `https://www.aiharu.net`
- **Additional Redirect URLs**:
  - `https://www.aiharu.net`
  - `https://www.aiharu.net/auth/callback`
  - `https://hanip.aiharu.net`
  - `https://hanip.aiharu.net/auth/callback`

### 2) Authentication → Providers → Google

- Authorized redirect URIs에 다음 추가:
  - `https://www.aiharu.net/auth/callback`
  - `https://hanip.aiharu.net/auth/callback`

## Vercel 환경변수 (한입)

- `NEXT_PUBLIC_SITE_URL=https://www.aiharu.net`
  - 주의: 앱 코드에서 `redirectTo`를 명시하지 않으면 Site URL로 리디렉션될 수 있으므로, 코드에서 반드시 현재 호스트 기준으로 지정해야 합니다.

## 앱 코드 수정 (한입)

- OAuth 호출 시 `redirectTo`를 반드시 현재 호스트 기준으로 지정하고, 오프라인 액세스/동의 강제 옵션을 추가합니다.

```ts
const supabase = createClient();
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: { access_type: "offline", prompt: "consent" },
  },
});
```

## 검증 체크리스트

- 한입 도메인에서 로그인 → 콜백 경로가 `https://hanip.aiharu.net/auth/callback` 인지
- 콜백 페이지에서 정상 세션 획득 후, 한입의 목적 경로로 이동하는지
- 아이하루 도메인에서도 동일하게 동작하는지
- 두 도메인 모두 Supabase/Google 콘솔의 허용 콜백 목록에 포함되어 있는지

## 주의사항

- `redirectTo`를 코드에서 명시하지 않으면 Site URL로 튈 수 있음
- 설정 변경 후 재배포/캐시 반영 필수
