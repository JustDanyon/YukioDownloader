import { getEpisodes } from '../../lib/kai';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Anime ID is required' });
    }

    const episodes = await getEpisodes(id);
    res.status(200).json(episodes);
  } catch (error) {
    console.error('Episodes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}