import { getAuthUrl } from '../../../../utils/gmail';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const url = getAuthUrl();
    res.status(200).json({ url });
  }
}