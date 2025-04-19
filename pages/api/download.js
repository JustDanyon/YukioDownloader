import animePahe from '../../lib/animepahe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { animeId, episodeId } = req.query;
    if (!animeId || !episodeId) {
      return res.status(400).json({ error: 'Both anime ID and episode ID are required' });
    }

    const links = await animePahe.getDownloadLinks(animeId, episodeId);
    res.status(200).json(links);
  } catch (error) {
    console.error('Download API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch download links',
      details: error.message 
    });
  }
}