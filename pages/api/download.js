import { getDownloadLink } from '../../lib/kai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, id } = req.query;
    if (!token || !id) {
      return res.status(400).json({ error: 'Token and ID are required' });
    }

    const url = await getDownloadLink(token, id);
    res.status(200).json({ url });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get download link',
      details: error.message 
    });
  }
}