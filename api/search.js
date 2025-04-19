const { evaluate, fetch } = require('../lib/animekai');

module.exports = async (req, res) => {
    try {
        const url = 'https://animekai.to/home';
        const response = await fetch(url);
        const html = await response.text();
        
        // Extract anime IDs and names
        const animeData = [];
        const regex = /data-id="([^"]+)"[^>]*>([^<]+)</g;
        let match;
        
        while ((match = regex.exec(html)) !== null) {
            animeData.push({
                id: match[1],
                title: match[2]
            });
        }
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(animeData);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch anime list' });
    }
};