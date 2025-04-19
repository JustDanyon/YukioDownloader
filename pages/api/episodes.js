import animePahe from '../../lib/animepahe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, page = 1 } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Anime ID is required' });
    }

    const episodes = await animePahe.getEpisodes(id, page);
    res.status(200).json(episodes);
  } catch (error) {
    console.error('Episodes API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch episodes',
      details: error.message 
    });
  }
}