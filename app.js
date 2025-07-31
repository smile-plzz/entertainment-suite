document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const popularMoviesSection = document.querySelector('#popular-movies').parentElement;
    const searchResultsSection = document.querySelector('#search-results').parentElement;
    const popularTvShowsSection = document.querySelector('#popular-tv-shows').parentElement;
    const popularMoviesGrid = document.getElementById('popular-movies');
    const searchResultsGrid = document.getElementById('search-results');
    const popularTvShowsGrid = document.getElementById('popular-tv-shows');
    const newsGrid = document.getElementById('news-grid');
    const loadMoreNewsButton = document.getElementById('load-more-news');
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const videoPlayOverlay = document.getElementById('video-play-overlay');
    const sourceButtonsContainer = document.getElementById('source-buttons');
    const videoAvailabilityStatus = document.getElementById('video-availability-status');
    const seasonEpisodeSelector = document.getElementById('season-episode-selector');
    const seasonSelect = document.getElementById('season-select');
    const episodeSelect = document.getElementById('episode-select');
    const closeButton = document.querySelector('.close-button');
    const homeButton = document.querySelector('.navbar-nav a[href="#"]');
    const themeToggle = document.getElementById('theme-toggle');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavLinks = document.querySelector('.mobile-nav-links');
    const loadMorePopularButton = document.getElementById('load-more-popular');
    const loadMoreSearchButton = document.getElementById('load-more-search');
    const loadMorePopularTvButton = document.getElementById('load-more-popular-tv');

    const moviesNavLink = document.getElementById('movies-nav-link');
    const tvShowsNavLink = document.getElementById('tv-shows-nav-link');
    const mobileMoviesNavLink = document.getElementById('mobile-movies-nav-link');
    const mobileTvShowsNavLink = document.getElementById('mobile-tv-shows-nav-link');

    // --- API & CONFIG ---
    const apiKey = '1a944117';
    let popularMoviesPage = 1;
    let popularTvShowsPage = 1;
    let newsPage = 1;
    let searchResultsPage = 1;
    let currentSearchQuery = '';

    const videoSources = [
        { name: 'VidCloud', url: 'https://vidcloud.stream/', tvUrl: 'https://vidcloud.stream/' },
        { name: 'fsapi.xyz', url: 'https://fsapi.xyz/movie/', tvUrl: 'https://fsapi.xyz/tv-imdb/' },
        { name: 'CurtStream', url: 'https://curtstream.com/movies/imdb/', tvUrl: null },
        { name: 'VidSrc.to', url: 'https://vidsrc.to/embed/movie/', tvUrl: 'https://vidsrc.to/embed/tv/' },
        { name: 'VidSrc.xyz', url: 'https://vidsrc.xyz/embed/movie/', tvUrl: 'https://vidsrc.xyz/embed/tv/' },
        { name: 'VidSrc.in', url: 'https://vidsrc.in/embed/movie/', tvUrl: 'https://vidsrc.in/embed/tv/' },
        { name: 'SuperEmbed', url: 'https://superembed.stream/movie/', tvUrl: 'https://superembed.stream/tv/' },
        { name: 'MoviesAPI', url: 'https://moviesapi.club/movie/', tvUrl: 'https://moviesapi.club/tv/' },
        { name: '2Embed', url: 'https://2embed.cc/embed/', tvUrl: 'https://2embed.cc/embed/' },
        { name: 'Fmovies', url: 'https://fmovies.to/embed/', tvUrl: 'https://fmovies.to/embed/' },
        { name: 'LookMovie', url: 'https://lookmovie.io/player/', tvUrl: 'https://lookmovie.io/player/' },
    ];

    // --- API CALLS ---
    const api = {
        async checkVideoAvailability(url) {
            console.log(`[checkVideoAvailability] Checking URL: ${url}`);
            try {
                const response = await fetch('/api/check-video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                });
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    console.error(`[checkVideoAvailability] Failed to parse JSON response for ${url}:`, jsonError);
                    const textResponse = await response.text();
                    console.error(`[checkVideoAvailability] Non-JSON response for ${url}:`, textResponse);
                    return false; // Treat as unavailable if response is not valid JSON
                }
                console.log(`[checkVideoAvailability] Response for ${url}:`, data);
                return data.available;
            } catch (error) {
                console.error(`[checkVideoAvailability] Error checking video availability for ${url}:`, error);
                return false;
            }
        },
        async fetchMovieByTitle(title, type = '') {
            try {
                let url = `https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`;
                if (type) {
                    url += `&type=${type}`;
                }
                console.log(`Fetching movie by title: ${title}, URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Response for ${title}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching movie by title (${title}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchMovieDetails(imdbID) {
            try {
                const url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${apiKey}`;
                console.log(`Fetching movie details for IMDB ID: ${imdbID}, URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Details response for ${imdbID}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching movie details (${imdbID}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchMoviesBySearch(query, page = 1, type = '') {
            try {
                let url = `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${apiKey}`;
                if (type) {
                    url += `&type=${type}`;
                }
                console.log(`Searching movies: ${query}, Page: ${page}, Type: ${type}, URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Search response for ${query}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching search results (${query}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchTvShowSeason(imdbID, seasonNumber) {
            try {
                const url = `https://www.omdbapi.com/?i=${imdbID}&Season=${seasonNumber}&apikey=${apiKey}`;
                console.log(`Fetching season ${seasonNumber} for IMDB ID: ${imdbID}, URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log(`Season ${seasonNumber} response for ${imdbID}:`, data);
                return data;
            } catch (error) {
                console.error(`Error fetching season ${seasonNumber} for ${imdbID}:`, error);
                return { Response: 'False', Error: error.message };
            }
        },
    };

    // --- UI RENDERING ---
    const ui = {
        displayError(message, container = searchResultsGrid) {
            container.innerHTML = `<h2 class="error-message">${message}</h2>`;
            if (container === searchResultsGrid) {
                searchResultsSection.style.display = 'block';
                popularMoviesSection.style.display = 'none';
            }
            loadMorePopularButton.style.display = 'none';
            loadMoreSearchButton.style.display = 'none';
        },
        createMovieCard(movie) {
            if (!movie || !movie.Poster || movie.Poster === 'N/A') return null;

            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <div class="movie-card-image-container">
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <i class="fas fa-play play-icon"></i>
                </div>
                <div class="movie-card-body">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                </div>
            `;
            movieCard.addEventListener('click', () => this.openVideoModal(movie.imdbID));
            return movieCard;
        },
        createSkeletonCard() {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'skeleton-card';
            skeletonCard.innerHTML = `
                <div class="skeleton-img"></div>
                <div class="skeleton-body">
                    <div class="skeleton-title"></div>
                </div>
            `;
            return skeletonCard;
        },
        renderSkeletons(container, count) {
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                container.appendChild(this.createSkeletonCard());
            }
        },
        
        async renderMovieGrid(container, movies, append, loadMoreButton, currentPage, totalResults) {
            if (!append) {
                container.innerHTML = '';
            }
            movies.forEach(movie => {
                const movieCard = this.createMovieCard(movie);
                if (movieCard) {
                    container.appendChild(movieCard);
                }
            });

            if (loadMoreButton) {
                let hasMore = false;
                if (container.id === 'search-results') {
                    // OMDb API search returns 10 per page
                    hasMore = currentPage * 10 < totalResults;
                } else {
                    // Popular lists are hardcoded with 4 per page
                    const itemsPerPage = 4;
                    hasMore = currentPage * itemsPerPage < totalResults;
                }

                if (hasMore) {
                    loadMoreButton.style.display = 'block';
                } else {
                    loadMoreButton.style.display = 'none';
                }
            }
        },

        async renderPopularMovies(append = false) {
            const popularTitles = ['Inception', 'The Matrix', 'Interstellar', 'The Avengers', 'Avatar', 'Titanic', 'Jurassic Park', 'Forrest Gump', 'The Lion King', 'Gladiator', 'Pulp Fiction', 'Fight Club', 'The Lord of the Rings', 'Star Wars', 'Dune'];
            const moviesPerPage = 4;
            const startIndex = (popularMoviesPage - 1) * moviesPerPage;
            const endIndex = startIndex + moviesPerPage;
            const titlesToLoad = popularTitles.slice(startIndex, endIndex);

            if (titlesToLoad.length === 0 && append) {
                loadMorePopularButton.style.display = 'none';
                return;
            }

            if (!append) {
                popularMoviesGrid.innerHTML = '';
                this.renderSkeletons(popularMoviesGrid, moviesPerPage);
            }

            const moviePromises = titlesToLoad.map(title => api.fetchMovieByTitle(title, 'movie'));
            const movies = await Promise.all(moviePromises);

            this.renderMovieGrid(popularMoviesGrid, movies, append, loadMorePopularButton, popularMoviesPage, popularTitles.length);
        },

        async renderPopularTvShows(append = false) {
            const popularTitles = ['Breaking Bad', 'Game of Thrones', 'The Office', 'Friends', 'The Simpsons', 'Stranger Things', 'The Mandalorian', 'The Crown', 'Westworld', 'Chernobyl', 'The Witcher', 'Black Mirror'];
            const showsPerPage = 4;
            const startIndex = (popularTvShowsPage - 1) * showsPerPage;
            const endIndex = startIndex + showsPerPage;
            const titlesToLoad = popularTitles.slice(startIndex, endIndex);

            if (titlesToLoad.length === 0 && append) {
                loadMorePopularTvButton.style.display = 'none';
                return;
            }

            if (!append) {
                popularTvShowsGrid.innerHTML = '';
                this.renderSkeletons(popularTvShowsGrid, showsPerPage);
            }

            const showPromises = titlesToLoad.map(title => api.fetchMovieByTitle(title, 'series'));
            const shows = await Promise.all(showPromises);

            this.renderMovieGrid(popularTvShowsGrid, shows, append, loadMorePopularTvButton, popularMoviesPage, popularTitles.length);
        },

        async renderNews(append = false) {
            const url = `/api/fetch-news?page=${newsPage}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                if (data.articles) {
                    if (!append) {
                        newsGrid.innerHTML = '';
                    }
                    data.articles.forEach(article => {
                        const newsCard = document.createElement('a');
                        newsCard.className = 'news-card';
                        newsCard.href = article.url;
                        newsCard.target = '_blank';

                        newsCard.innerHTML = `
                            <img src="${article.urlToImage || ''}" alt="${article.title}">
                            <div class="news-card-body">
                                <h3 class="news-card-title">${article.title}</h3>
                                <p class="news-card-source">${article.source.name}</p>
                            </div>
                        `;

                        newsGrid.appendChild(newsCard);
                    });

                    // Show/hide load more button
                    if (newsPage * 6 < data.totalResults) {
                        loadMoreNewsButton.style.display = 'block';
                    } else {
                        loadMoreNewsButton.style.display = 'none';
                    }

                }
            } catch (error) {
                console.error('Error fetching news:', error);
                if (!append) { // Only show the error message on the initial load
                    newsGrid.innerHTML = `<p class="error-message">Could not load news. Please try again later.</p>`;
                }
                loadMoreNewsButton.style.display = 'none';
            }
        },

        async renderSearchResults(query, append = false) {
            currentSearchQuery = query;
            if (!append) {
                searchResultsPage = 1;
                this.showSearchView();
                searchResultsGrid.innerHTML = '';
                this.renderSkeletons(searchResultsGrid, 8);
            }

            const results = await api.fetchMoviesBySearch(query, searchResultsPage);

            if (results && results.Response === 'True' && results.Search) {
                this.renderMovieGrid(searchResultsGrid, results.Search, append, loadMoreSearchButton, searchResultsPage, results.totalResults);
            } else {
                this.displayError(results.Error || 'No movies or TV shows found. Please try another search.', searchResultsGrid);
            }
        },
        showHomeView() {
            popularMoviesSection.style.display = 'block';
            searchResultsSection.style.display = 'none';
            popularTvShowsSection.style.display = 'none';
            searchInput.value = '';
            loadMorePopularButton.style.display = 'block'; // Ensure it's visible on home view
            popularMoviesPage = 1; // Reset popular movies page
            this.renderPopularMovies(); // Re-render popular movies from start
        },
        showSearchView() {
            popularMoviesSection.style.display = 'none';
            searchResultsSection.style.display = 'block';
            popularTvShowsSection.style.display = 'none';
        },
        async openVideoModal(imdbID) {
            sourceButtonsContainer.innerHTML = '';
            videoPlayer.src = ''; // Clear previous video
            videoAvailabilityStatus.textContent = 'Loading video sources...';
            videoAvailabilityStatus.style.display = 'block';
            seasonEpisodeSelector.style.display = 'none'; // Hide by default

            const details = await api.fetchMovieDetails(imdbID);

            if (details && details.Response === 'True') {
                document.getElementById('modal-movie-title').textContent = details.Title;
                document.getElementById('modal-movie-plot').textContent = details.Plot;
                document.getElementById('modal-movie-genre').textContent = details.Genre;
                document.getElementById('modal-movie-released').textContent = details.Released;
                document.getElementById('modal-movie-rating').textContent = details.imdbRating;
                document.getElementById('modal-movie-poster').src = details.Poster;
                document.getElementById('modal-movie-director').textContent = details.Director;
                document.getElementById('modal-movie-writer').textContent = details.Writer;
                document.getElementById('modal-movie-actors').textContent = details.Actors;
                document.getElementById('modal-movie-awards').textContent = details.Awards;

                if (details.Type === 'series') {
                    seasonEpisodeSelector.style.display = 'block';
                    // Populate seasons
                    seasonSelect.innerHTML = '';
                    for (let i = 1; i <= parseInt(details.totalSeasons); i++) {
                        const option = document.createElement('option');
                        option.value = i;
                        option.textContent = `Season ${i}`;
                        seasonSelect.appendChild(option);
                    }
                    // Load episodes for the first season by default
                    await this.populateEpisodes(imdbID, 1);

                    seasonSelect.onchange = async (event) => {
                        await this.populateEpisodes(imdbID, event.target.value);
                    };
                    episodeSelect.onchange = () => this.loadVideoForSelectedEpisode(imdbID);

                } else { // It's a movie
                    seasonEpisodeSelector.style.display = 'none';
                    this.loadVideoForMovie(imdbID);
                }
            } else {
                videoAvailabilityStatus.textContent = 'Could not fetch details for this title.';
                videoAvailabilityStatus.style.display = 'block';
                return;
            }

            videoModal.style.display = 'flex';
            videoPlayOverlay.style.display = 'flex'; // Show play overlay initially
        },

        async populateEpisodes(imdbID, seasonNumber) {
            episodeSelect.innerHTML = '';
            const seasonData = await api.fetchTvShowSeason(imdbID, seasonNumber);
            if (seasonData && seasonData.Response === 'True' && seasonData.Episodes) {
                seasonData.Episodes.forEach(episode => {
                    const option = document.createElement('option');
                    option.value = episode.Episode;
                    option.textContent = `Episode ${episode.Episode}: ${episode.Title}`;
                    episodeSelect.appendChild(option);
                });
                this.loadVideoForSelectedEpisode(imdbID); // Load video for the first episode of the selected season
            } else {
                videoAvailabilityStatus.textContent = 'No episodes found for this season.';
                videoAvailabilityStatus.style.display = 'block';
            }
        },

        async loadVideoForMovie(imdbID) {
            videoPlayer.src = '';
            sourceButtonsContainer.innerHTML = ''; // Clear buttons
            videoAvailabilityStatus.textContent = 'Loading video sources...';
            videoAvailabilityStatus.style.display = 'block';

            const defaultSource = videoSources.find(s => s.name === 'VidSrc.to');
            const activeSource = defaultSource || videoSources[0];

            if (activeSource) {
                const activeUrl = this.constructVideoUrl(activeSource, imdbID, null, null, 'movie');
                if (activeUrl) {
                    videoPlayer.src = activeUrl;
                    videoAvailabilityStatus.textContent = `Attempting to load from ${activeSource.name}...`;
                }
            } else {
                videoAvailabilityStatus.textContent = 'No video sources available.';
                return;
            }

            // Create buttons for all sources
            for (const source of videoSources) {
                const fullUrl = this.constructVideoUrl(source, imdbID, null, null, 'movie');
                if (!fullUrl) continue; // Skip sources that don't support this media type

                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                sourceButtonsContainer.appendChild(button);

                // Set the active class on the default button
                if (source.name === activeSource.name) {
                    button.classList.add('active');
                }

                button.onclick = () => {
                    videoPlayer.src = fullUrl;
                    document.querySelectorAll('.source-button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    videoAvailabilityStatus.textContent = `Loading from ${source.name}...`;
                };

                api.checkVideoAvailability(fullUrl).then(isAvailable => {
                    if (isAvailable) {
                        button.classList.add('is-available');
                    } else {
                        button.classList.add('is-unavailable');
                    }
                });
            }
        },

        async loadVideoForSelectedEpisode(imdbID) {
            const season = seasonSelect.value;
            const episode = episodeSelect.value;
            if (!season || !episode) return;

            videoPlayer.src = '';
            sourceButtonsContainer.innerHTML = ''; // Clear old source buttons
            videoAvailabilityStatus.textContent = `Loading video sources for S${season}E${episode}...`;
            videoAvailabilityStatus.style.display = 'block';

            const defaultSource = videoSources.find(s => s.name === 'VidSrc.to');
            const activeSource = defaultSource || videoSources.find(s => s.tvUrl); // Find first source that supports TV

            if (activeSource) {
                const activeUrl = this.constructVideoUrl(activeSource, imdbID, season, episode, 'series');
                if (activeUrl) {
                    videoPlayer.src = activeUrl;
                    videoAvailabilityStatus.textContent = `Attempting to load from ${activeSource.name} (S${season}E${episode})...`;
                }
            } else {
                videoAvailabilityStatus.textContent = 'No TV show sources available.';
                return;
            }

            for (const source of videoSources) {
                const fullUrl = this.constructVideoUrl(source, imdbID, season, episode, 'series');
                if (!fullUrl) continue; // Skip sources that don't support TV shows

                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                sourceButtonsContainer.appendChild(button);

                if (source.name === activeSource.name) {
                    button.classList.add('active');
                }

                button.onclick = () => {
                    videoPlayer.src = fullUrl;
                    document.querySelectorAll('.source-button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    videoAvailabilityStatus.textContent = `Loading from ${source.name} (S${season}E${episode})...`;
                };

                api.checkVideoAvailability(fullUrl).then(isAvailable => {
                    if (isAvailable) {
                        button.classList.add('is-available');
                    } else {
                        button.classList.add('is-unavailable');
                    }
                });
            }
        },

        closeVideoModal() {
            videoPlayer.src = '';
            videoModal.style.display = 'none';
            videoAvailabilityStatus.style.display = 'none'; // Hide status when modal is closed
            videoPlayOverlay.style.display = 'none'; // Hide play overlay when modal is closed
        },
        constructVideoUrl(source, imdbID, season = null, episode = null, mediaType) {
            if (mediaType === 'series' && !source.tvUrl) return null; // Don't construct a URL if the source doesn't support TV shows

            let baseUrl = mediaType === 'series' && source.tvUrl ? source.tvUrl : source.url;
            let url = `${baseUrl}${imdbID}`;

            if (mediaType === 'series' && season && episode) {
                // Specific handling for VidSrc sources
                if (source.name.includes('VidSrc')) {
                    url = `${baseUrl}${imdbID}/${season}/${episode}`;
                } else if (source.name === 'VidCloud') {
                    url = `${baseUrl}${imdbID}-S${season}-E${episode}.html`;
                } else if (source.name === 'fsapi.xyz') {
                    url = `${baseUrl}${imdbID}-${season}-${episode}`;
                } else if (source.name === '2Embed') {
                    url = `${baseUrl}tv?id=${imdbID}&s=${season}&e=${episode}`;
                } else if (source.name === 'SuperEmbed') {
                    url = `${baseUrl}${imdbID}-${season}-${episode}`;
                } else if (source.name === 'MoviesAPI') {
                    url = `${baseUrl}${imdbID}/season/${season}/episode/${episode}`;
                } else if (source.name === 'Fmovies') {
                    url = `${baseUrl}tv/${imdbID}/season/${season}/episode/${episode}`;
                } else if (source.name === 'LookMovie') {
                    url = `${baseUrl}tv/${imdbID}/season/${season}/episode/${episode}`;
                } else {
                    // Generic fallback for other TV show sources
                    url = `${baseUrl}${imdbID}-S${season}E${episode}`;
                }
            }
            return url;
        },
    };

    // --- EVENT LISTENERS ---
    searchButton.addEventListener('click', () => ui.renderSearchResults(searchInput.value.trim()));
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            ui.renderSearchResults(searchInput.value.trim());
        }
    });

    homeButton.addEventListener('click', (e) => {
        e.preventDefault();
        ui.showHomeView();
    });

    closeButton.addEventListener('click', ui.closeVideoModal);
    window.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            ui.closeVideoModal();
        }
    });

    videoPlayOverlay.addEventListener('click', () => {
        videoPlayOverlay.style.display = 'none';
        // The iframe src is already set in openVideoModal, so just ensure it's loaded/playing
        // For some embeds, simply setting display to none might not trigger play, 
        // but for most iframe embeds, the content loads when the iframe is visible.
        // If issues persist, consider re-setting videoPlayer.src here or adding a specific play method if the embed API allows.
    });

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });

    hamburgerMenu.addEventListener('click', () => {
        mobileNavOverlay.classList.toggle('active');
    });

    if (mobileNavLinks) {
        mobileNavLinks.addEventListener('click', () => {
            mobileNavOverlay.classList.remove('active');
        });
    }

    loadMorePopularButton.addEventListener('click', () => {
        popularMoviesPage++;
        ui.renderPopularMovies(true);
    });

    loadMoreSearchButton.addEventListener('click', () => {
        searchResultsPage++;
        ui.renderSearchResults(currentSearchQuery, true);
    });

    loadMorePopularTvButton.addEventListener('click', () => {
        popularTvShowsPage++;
        ui.renderPopularTvShows(true);
    });

    loadMoreNewsButton.addEventListener('click', () => {
        newsPage++;
        ui.renderNews(true);
    });

    moviesNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        popularMoviesSection.style.display = 'block';
        searchResultsSection.style.display = 'none';
        popularTvShowsSection.style.display = 'none';
        popularMoviesPage = 1;
        popularTvShowsPage = 1;
        ui.renderPopularMovies();
    });

    tvShowsNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        popularMoviesSection.style.display = 'none';
        searchResultsSection.style.display = 'none';
        popularTvShowsSection.style.display = 'block';
        popularMoviesPage = 1;
        popularTvShowsPage = 1;
        ui.renderPopularTvShows();
    });

    mobileMoviesNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavOverlay.classList.remove('active');
        popularMoviesSection.style.display = 'block';
        searchResultsSection.style.display = 'none';
        popularTvShowsSection.style.display = 'none';
        popularMoviesPage = 1;
        popularTvShowsPage = 1;
        ui.renderPopularMovies();
    });

    mobileTvShowsNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavOverlay.classList.remove('active');
        popularMoviesSection.style.display = 'none';
        searchResultsSection.style.display = 'none';
        popularTvShowsSection.style.display = 'block';
        popularMoviesPage = 1;
        popularTvShowsPage = 1;
        ui.renderPopularTvShows();
    });

    // --- INITIAL LOAD ---
    const init = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.checked = true;
        }

        ui.renderPopularMovies();
        ui.renderNews();
    };

    init();
});