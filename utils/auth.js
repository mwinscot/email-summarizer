export function setTokenCookie(res, tokens) {
  res.setHeader('Set-Cookie', [
    `gmail_tokens=${JSON.stringify(tokens)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
  ]);
}

export function getTokensFromCookies(cookies) {
  try {
    const tokens = cookies.gmail_tokens ? JSON.parse(cookies.gmail_tokens) : null;
    return tokens;
  } catch (error) {
    console.error('Error parsing tokens:', error);
    return null;
  }
}