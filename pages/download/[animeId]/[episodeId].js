import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DownloadPage() {
  const router = useRouter();
  const { animeId, episodeId } = router.query;
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!animeId || !episodeId) return;

    const fetchLinks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/download?animeId=${animeId}&episodeId=${episodeId}`);
        if (!res.ok) throw new Error('Failed to fetch download links');
        
        const data = await res.json();
        setLinks(data);
      } catch (err) {
        console.error('Download error:', err);
        setError('Failed to get download links');
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [animeId, episodeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading download links...</p>
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
        <title>Download Options</title>
      </Head>

      <main className="container mx-auto py-8 px-4">
        <button 
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Download Options</h2>
          
          {links.length > 0 ? (
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium mb-2">Quality: {link.quality}</h3>
                  <p className="text-sm text-gray-600 mb-2">Size: {link.size}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {link.hosts.map((host, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {host}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No download links available</p>
          )}
        </div>
      </main>
    </div>
  );
}