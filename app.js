document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const popularMoviesSection = document.querySelector('#popular-movies').parentElement;
    const searchResultsSection = document.querySelector('#search-results').parentElement;
    const popularMoviesGrid = document.getElementById('popular-movies');
    const searchResultsGrid = document.getElementById('search-results');
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
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

    // --- API & CONFIG ---
    const apiKey = '1a944117';
    let popularMoviesPage = 1;
    let searchResultsPage = 1;
    let currentSearchQuery = '';

    const videoSources = [
        { name: 'VidSrc.to', url: 'https://vidsrc.to/embed/movie/' },
        { name: 'VidSrc.xyz', url: 'https://vidsrc.xyz/embed/movie/' },
        { name: 'VidSrc.in', url: 'https://vidsrc.in/embed/movie/' },
        { name: 'SuperEmbed', url: 'https://superembed.stream/movie/' },
        { name: 'MoviesAPI', url: 'https://moviesapi.club/movie/' },
        { name: '2Embed', url: 'https://2embed.cc/embed/' },
        { name: 'Fmovies', url: 'https://fmovies.to/embed/' }, // Example of adding more sources
        { name: 'LookMovie', url: 'https://lookmovie.io/player/' },
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
                <img src="${movie.Poster}" alt="${movie.Title}">
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
                if (totalResults && currentPage * 10 < totalResults) {
                    loadMoreButton.style.display = 'block';
                } else if (movies.length === 0 && !totalResults) { // For popular movies when all are loaded
                    loadMoreButton.style.display = 'none';
                } else if (totalResults === undefined && movies.length < 4) { // For popular movies when less than 4 are loaded
                    loadMoreButton.style.display = 'none';
                } else if (totalResults === undefined && movies.length > 0) { // For popular movies when more are available
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
            searchInput.value = '';
            loadMorePopularButton.style.display = 'block'; // Ensure it's visible on home view
            popularMoviesPage = 1; // Reset popular movies page
            this.renderPopularMovies(); // Re-render popular movies from start
        },
        showSearchView() {
            popularMoviesSection.style.display = 'none';
            searchResultsSection.style.display = 'block';
        },
        async openVideoModal(imdbID) {
            sourceButtonsContainer.innerHTML = '';
            videoPlayer.src = ''; // Clear previous video
            videoAvailabilityStatus.textContent = 'Loading video sources...';
            videoAvailabilityStatus.style.display = 'block';
            seasonEpisodeSelector.style.display = 'none'; // Hide by default

            const details = await api.fetchMovieDetails(imdbID);

            if (details && details.Response === 'True') {
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
            videoAvailabilityStatus.textContent = 'Loading video sources...';
            videoAvailabilityStatus.style.display = 'block';
            let firstSourceAttempted = false;

            for (const source of videoSources) {
                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                sourceButtonsContainer.appendChild(button);

                const fullUrl = `${source.url}${imdbID}`;

                if (!firstSourceAttempted) {
                    videoPlayer.src = fullUrl;
                    button.classList.add('active');
                    videoAvailabilityStatus.textContent = `Attempting to load from ${source.name}...`;
                    firstSourceAttempted = true;
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
                    }
                });
            }
        },

        async loadVideoForSelectedEpisode(imdbID) {
            const season = seasonSelect.value;
            const episode = episodeSelect.value;
            if (!season || !episode) return;

            videoPlayer.src = '';
            videoAvailabilityStatus.textContent = `Loading video sources for S${season}E${episode}...`;
            videoAvailabilityStatus.style.display = 'block';
            sourceButtonsContainer.innerHTML = ''; // Clear old source buttons

            let firstSourceAttempted = false;

            for (const source of videoSources) {
                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                sourceButtonsContainer.appendChild(button);

                // Construct URL for TV show episode
                let fullUrl = source.url;
                if (source.name.includes('VidSrc')) {
                    fullUrl = `${source.url}${imdbID}/${season}/${episode}`;
                } else { // Fallback for other sources, might need adjustment based on their API
                    fullUrl = `${source.url}${imdbID}-S${season}E${episode}`;
                }

                if (!firstSourceAttempted) {
                    videoPlayer.src = fullUrl;
                    button.classList.add('active');
                    videoAvailabilityStatus.textContent = `Attempting to load from ${source.name} (S${season}E${episode})...`;
                    firstSourceAttempted = true;
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
                    }
                });
            }
        },
        closeVideoModal() {
            videoPlayer.src = '';
            videoModal.style.display = 'none';
            videoAvailabilityStatus.style.display = 'none'; // Hide status when modal is closed
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

    // --- INITIAL LOAD ---
    const init = () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.checked = true;
        }

        ui.renderPopularMovies();
    };

    init();
});