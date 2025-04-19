const fetch = require('node-fetch');

class AnimePahe {
  constructor() {
    this.baseUrl = 'https://pahe-api-g07g.onrender.com';
    this.sessionCache = new Map();
  }

  async search(query) {
    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: this._getHeaders()
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      return data.data.map(anime => ({
        id: anime.session,
        title: anime.title,
        image: anime.poster,
        episodes: anime.episodes,
        type: anime.type
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getEpisodes(sessionId, page = 1) {
    try {
      const url = `${this.baseUrl}/episodes/${sessionId}?page=${page}`;
      const response = await fetch(url, {
        headers: this._getHeaders()
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      this.sessionCache.set(sessionId, data.session); // Cache the session
      
      return data.data.map(episode => ({
        id: episode.session,
        number: episode.episode,
        title: episode.title || `Episode ${episode.episode}`,
        duration: episode.duration
      }));
    } catch (error) {
      console.error('Episodes error:', error);
      throw error;
    }
  }

  async getDownloadLinks(sessionId, episodeSession) {
    try {
      const url = `${this.baseUrl}/links/${sessionId}/${episodeSession}`;
      const response = await fetch(url, {
        headers: this._getHeaders()
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      return data.data.map(link => ({
        quality: link.quality,
        url: link.url,
        size: link.size,
        hosts: link.hosts
      }));
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  _getHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://animepahe.com/',
      'X-Requested-With': 'XMLHttpRequest'
    };
  }
}

module.exports = new AnimePahe();
