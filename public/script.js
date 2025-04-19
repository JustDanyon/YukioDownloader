document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const animeList = document.getElementById('animeList');
    const loading = document.getElementById('loading');
    const episodesModal = new bootstrap.Modal(document.getElementById('episodesModal'));
    const episodesList = document.getElementById('episodesList');
    const episodesModalTitle = document.getElementById('episodesModalTitle');
    
    // Search anime
    searchBtn.addEventListener('click', searchAnime);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchAnime();
    });
    
    async function searchAnime() {
        const query = searchInput.value.trim();
        if (!query) return;
        
        loading.classList.remove('d-none');
        animeList.innerHTML = '';
        
        try {
            const response = await fetch('/api/search');
            const animeData = await response.json();
            
            // Filter by search query if provided
            const filteredAnime = query ? 
                animeData.filter(anime => 
                    anime.title.toLowerCase().includes(query.toLowerCase())
                ) : 
                animeData;
            
            displayAnimeList(filteredAnime);
        } catch (error) {
            console.error('Search error:', error);
            alert('Failed to search for anime');
        } finally {
            loading.classList.add('d-none');
        }
    }
    
    function displayAnimeList(animeData) {
        animeList.innerHTML = '';
        
        if (animeData.length === 0) {
            animeList.innerHTML = '<div class="col-12 text-center">No anime found</div>';
            return;
        }
        
        animeData.forEach(anime => {
            const animeCard = document.createElement('div');
            animeCard.className = 'col-md-3 col-sm-6 mb-4';
            animeCard.innerHTML = `
                <div class="card anime-card h-100" data-id="${anime.id}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${anime.title}</h5>
                        <button class="btn btn-sm btn-outline-primary view-episodes">View Episodes</button>
                    </div>
                </div>
            `;
            animeList.appendChild(animeCard);
        });
        
        // Add event listeners to all episode buttons
        document.querySelectorAll('.view-episodes').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const animeId = this.closest('.card').dataset.id;
                const animeTitle = this.closest('.card').querySelector('.card-title').textContent;
                showEpisodes(animeId, animeTitle);
            });
        });
    }
    
    async function showEpisodes(animeId, animeTitle) {
        episodesList.innerHTML = '<div class="text-center">Loading episodes...</div>';
        episodesModalTitle.textContent = `Episodes for ${animeTitle}`;
        episodesModal.show();
        
        try {
            const response = await fetch(`/api/episodes/${animeId}`);
            const episodes = await response.json();
            
            episodesList.innerHTML = '';
            
            if (episodes.length === 0) {
                episodesList.innerHTML = '<div class="text-center">No episodes found</div>';
                return;
            }
            
            episodes.forEach(episode => {
                const episodeItem = document.createElement('button');
                episodeItem.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                episodeItem.innerHTML = `
                    ${episode.title}
                    <button class="btn btn-sm btn-success download-btn" data-id="${episode.id}">Download</button>
                `;
                episodesList.appendChild(episodeItem);
                
                // Add event listener to download button
                episodeItem.querySelector('.download-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    downloadEpisode(episode.id, `${animeTitle} - ${episode.title}`);
                });
            });
        } catch (error) {
            console.error('Episodes error:', error);
            episodesList.innerHTML = '<div class="text-center text-danger">Failed to load episodes</div>';
        }
    }
    
    async function downloadEpisode(episodeId, episodeTitle) {
        try {
            const response = await fetch(`/api/download/${episodeId}`);
            const data = await response.json();
            
            if (data.downloadUrl) {
                // Open download link in new tab
                window.open(data.downloadUrl, '_blank');
                
                // If we had a direct download link, we could use this:
                // const a = document.createElement('a');
                // a.href = data.directDownload;
                // a.download = `${episodeTitle}.mp4`;
                // document.body.appendChild(a);
                // a.click();
                // document.body.removeChild(a);
            } else {
                alert('Download link not found');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to get download link');
        }
    }
    
    // Load popular anime on page load
    searchAnime();
});