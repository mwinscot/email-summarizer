// utils/auth.js
import { serialize } from 'cookie';

export function setTokenCookie(res, tokens) {
  // Set httpOnly cookies for security
  res.setHeader('Set-Cookie', [
    serialize('accessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 // 1 hour
    }),
    serialize('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 1 week
    })
  ]);
}