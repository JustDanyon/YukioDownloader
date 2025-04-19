const { evaluate, fetch } = require('../lib/animekai');

module.exports = async (req, res) => {
    try {
        const animeId = req.query.id;
        const encodedParam = evaluate("generate_token", animeId);
        
        const url = new URL('https://animekai.to/ajax/episodes/list');
        url.searchParams.append('ani_id', animeId);
        url.searchParams.append('_', encodedParam);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Extract episodes from the result
        const episodes = [];
        const episodeRegex = /data-id="([^"]+)"[^>]*>([^<]+)</g;
        let episodeMatch;
        
        while ((episodeMatch = episodeRegex.exec(data.result)) !== null) {
            episodes.push({
                id: episodeMatch[1],
                title: episodeMatch[2]
            });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(episodes);
    } catch (error) {
        console.error('Episodes error:', error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
};