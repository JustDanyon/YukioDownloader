const { evaluate, fetch } = require('../lib/animekai');

module.exports = async (req, res) => {
    try {
        const episodeId = req.query.id;
        
        // First get the token
        const encodedTokenParam = evaluate("generate_token", episodeId);
        const tokenUrl = new URL('https://animekai.to/ajax/links/list');
        tokenUrl.searchParams.append('token', episodeId);
        tokenUrl.searchParams.append('_', encodedTokenParam);
        
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();
        
        const tokenMatch = tokenData.result.match(/data-lid="([^"]+)"/);
        if (!tokenMatch) throw new Error('Token not found');
        
        const lid = tokenMatch[1];
        
        // Now get the download link
        const encodedLinkParam = evaluate("generate_token", lid);
        const linkUrl = new URL('https://animekai.to/ajax/links/view');
        linkUrl.searchParams.append('id', lid);
        linkUrl.searchParams.append('_', encodedLinkParam);
        
        const linkResponse = await fetch(linkUrl);
        const linkData = await linkResponse.json();
        
        // Decode the result to get the actual URL
        const decodedUrl = evaluate("decode_iframe_data", linkData.result);
        const megaUrl = JSON.parse(decodeURIComponent(decodedUrl)).url;
        
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ 
            downloadUrl: megaUrl,
            directDownload: null
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to fetch download link' });
    }
};