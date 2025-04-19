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
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First get anime info (from search cache or new search)
        const searchRes = await fetch(`/api/search?query=${id}`);
        const searchData = await searchRes.json();
        const animeInfo = searchData.find(a => a.id === id) || {};
        setAnime(animeInfo);
        
        // Then get episodes
        const episodesRes = await fetch(`/api/episodes?id=${id}&page=${page}`);
        const episodesData = await episodesRes.json();
        setEpisodes(episodesData);
        
      } catch (err) {
        console.error('Failed to fetch anime details:', err);
        setError('Failed to load anime details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, page]);

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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold">Type</h3>
                    <p>{anime.type}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Episodes</h3>
                    <p>{anime.episodes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Episodes</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {page}</span>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={episodes.length === 0}
                className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          
          {episodes.length > 0 ? (
            <div className="space-y-2">
              {episodes.map((episode) => (
                <div 
                  key={episode.id} 
                  className="flex justify-between items-center p-3 border-b border-gray-200 last:border-0"
                >
                  <span>Episode {episode.number}: {episode.title}</span>
                  <Link href={`/download/${id}/${episode.id}`} passHref>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Download
                    </button>
                  </Link>
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