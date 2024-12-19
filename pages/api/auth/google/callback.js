import { getTokens } from '../../../../utils/gmail';
import { setTokenCookie } from '../../../../utils/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { code } = req.query;
      const tokens = await getTokens(code);
      await setTokenCookie(res, tokens);
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect('/error?message=auth_failed');
    }
  }
}