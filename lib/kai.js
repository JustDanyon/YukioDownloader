const fs = require('fs');
const path = require('path');

// Load the kai.json file
const kaiPath = path.join(process.cwd(), 'public', 'generated', 'kai.json');
const kaiData = JSON.parse(fs.readFileSync(kaiPath, 'utf8'));

// Helper functions
function transform(n, t) {
  let s = [], j = 0, x, res = '';
  for (let i = 0; i < 256; i++) {
    s[i] = i;
  }
  for (i = 0; i < 256; i++) {
    j = (j + s[i] + n.charCodeAt(i % n.length)) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  i = 0;
  j = 0;
  for (let y = 0; y < t.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res += String.fromCharCode(t.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

function substitute(n, t, i) {
  const u = {};
  for (let r = t.length; r--;) {
    u[t[r]] = i[r] || "";
  }
  return n.split("").map(c => u[c] || c).join("");
}

function base64_url_encode(n) {
  return Buffer.from(n).toString('base64')
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64_url_decode(n) {
  let t = n.replace(/-/g, "+").replace(/_/g, "/");
  const pad = t.length % 4;
  if (pad) {
    if (pad === 1) throw new Error('Invalid base64 string');
    t += "=".repeat(4 - pad);
  }
  return Buffer.from(t, 'base64').toString();
}

function reverse_it(n) {
  return n.split("").reverse().join("");
}

// API functions
async function searchAnime(query) {
  try {
    const url = `https://animekai.to/search?keyword=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://animekai.to/'
      }
    });
    
    const html = await res.text();
    const animeList = [];
    
    // Updated regex pattern for current Animekai HTML
    const regex = /<a[^>]+data-id="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*>/g;
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

async function getEpisodes(ani_id) {
  try {
    const generateToken = new Function('n', kaiData.generate_token);
    const _ = generateToken(ani_id);
    
    const url = new URL('https://animekai.to/ajax/episodes/list');
    url.searchParams.append('ani_id', ani_id);
    url.searchParams.append('_', _);
    
    const res = await fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://animekai.to/'
      }
    });
    
    const data = await res.json();
    
    if (!data.result) {
      throw new Error('No result in response');
    }
    
    const episodes = [];
    const episodeRegex = /data-id="([^"]+)"[^>]*>([^<]+)</g;
    let match;
    
    while ((match = episodeRegex.exec(data.result)) !== null) {
      episodes.push({
        id: match[1],
        title: match[2].trim()
      });
    }
    
    const tokenMatch = data.result.match(/token="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    return { episodes, token };
  } catch (error) {
    console.error('Episodes error:', error);
    throw error;
  }
}

async function getDownloadLink(token, episodeId) {
  try {
    const generateToken = new Function('n', kaiData.generate_token);
    const decodeData = new Function('n', kaiData.decode_iframe_data);
    
    // First request to get server ID
    let url = new URL('https://animekai.to/ajax/links/list');
    url.searchParams.append('token', token);
    url.searchParams.append('_', generateToken(token));
    
    let res = await fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://animekai.to/'
      }
    });
    
    let data = await res.json();
    const serverId = data.result.match(/data-lid="([^"]+)"/)[1];
    
    // Second request to get download link
    url = new URL('https://animekai.to/ajax/links/view');
    url.searchParams.append('id', serverId);
    url.searchParams.append('_', generateToken(serverId));
    
    res = await fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://animekai.to/'
      }
    });
    
    data = await res.json();
    const decoded = decodeURIComponent(decodeData(data.result));
    
    return JSON.parse(decoded).url;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

module.exports = {
  searchAnime,
  getEpisodes,
  getDownloadLink,
  transform,
  substitute,
  base64_url_encode,
  base64_url_decode,
  reverse_it
};