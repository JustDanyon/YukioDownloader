import { getDownloadLink } from '../../lib/kai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token, id } = req.query;
    if (!token || !id) {
      return res.status(400).json({ message: 'Token and episode ID are required' });
    }

    const downloadUrl = await getDownloadLink(token, id);
    res.status(200).json({ url: downloadUrl });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}