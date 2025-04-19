import animePahe from '../../lib/animepahe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await animePahe.search(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ 
      error: 'Failed to search anime',
      details: error.message 
    });
  }
}