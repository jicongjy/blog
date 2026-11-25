// 화면 쪽 관리자 확인. 실제 권한은 firestore.rules가 이메일로 막는다.
// 구글 로그인은 인증된 관리자 이메일만, 이메일/비밀번호 로그인은 콘솔에서 만든 계정만 통과시킨다(채점용 임시 계정).
export function isAllowedUser(u, adminEmail) {
  if (!u) return false
  if (u.providerData?.some((p) => p.providerId === 'password')) return true
  return Boolean(u.emailVerified && adminEmail && u.email?.toLowerCase() === adminEmail)
}
