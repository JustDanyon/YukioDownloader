// lib/kai.js
const fetch = require('node-fetch');

async function searchAnime(query) {
  try {
    const url = `https://animekai.to/search?keyword=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://animekai.to/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1'
      }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const html = await res.text();
    // Continue with parsing...
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}
    
    // Debug: Save HTML to check structure
    // require('fs').writeFileSync('debug.html', html);

    // Updated regex pattern (June 2024)
    const animeList = [];
    const regex = /<a[^>]*?data-id="([^"]+)"[^>]*?>[\s\S]*?<img[^>]*?src="([^"]+)"[^>]*?alt="([^"]*)"[^>]*>/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      animeList.push({
        id: match[1],
        image: match[2].startsWith('http') ? match[2] : `https://animekai.to${match[2]}`,
        title: match[3].trim() || 'Untitled'
      });
    }

    return animeList;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}

module.exports = { searchAnime };
