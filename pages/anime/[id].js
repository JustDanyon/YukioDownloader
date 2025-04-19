import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AnimeDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnimeDetails = async () => {
      try {
        setLoading(true);
        
        // First get anime info (we'll reuse the search API)
        const searchRes = await fetch(`/api/search?query=${id}`);
        const searchData = await searchRes.json();
        const animeInfo = searchData.find(a => a.id === id);
        setAnime(animeInfo);
        
        // Then get episodes
        const episodesRes = await fetch(`/api/episodes?id=${id}`);
        const episodesData = await episodesRes.json();
        setEpisodes(episodesData.episodes);
        
      } catch (err) {
        console.error('Failed to fetch anime details:', err);
        setError('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id]);

  const handleDownload = async (episodeId) => {
    try {
      setDownloading(episodeId);
      
      // First get the token (we need to get episodes again)
      const episodesRes = await fetch(`/api/episodes?id=${id}`);
      const episodesData = await episodesRes.json();
      
      // Then get the download link
      const downloadRes = await fetch(`/api/download?token=${episodesData.token}&id=${episodeId}`);
      const { url } = await downloadRes.json();
      
      // Open download in new tab
      window.open(url, '_blank');
      
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to get download link');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{anime?.title || 'Anime Details'}</title>
      </Head>

      <main className="container mx-auto py-8 px-4">
        <button 
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ← Back
        </button>

        {anime && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={anime.image} 
                alt={anime.title} 
                className="w-full md:w-1/3 h-auto object-cover rounded-md"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-4">{anime.title}</h1>
                {/* Add more anime details here if available */}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Episodes</h2>
          
          {episodes.length > 0 ? (
            <div className="space-y-2">
              {episodes.map((episode) => (
                <div 
                  key={episode.id} 
                  className="flex justify-between items-center p-3 border-b border-gray-200 last:border-0"
                >
                  <span>{episode.title}</span>
                  <button
                    onClick={() => handleDownload(episode.id)}
                    disabled={downloading === episode.id}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {downloading === episode.id ? 'Preparing...' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No episodes available</p>
          )}
        </div>
      </main>
    </div>
  );
}