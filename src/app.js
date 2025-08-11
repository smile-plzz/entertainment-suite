import { api, videoSources } from './utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    // From NowShowing/app.js
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

    // Notification Elements
    const notificationButton = document.getElementById('notification-button');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationModal = document.getElementById('close-notification-modal');
    const switchSourceNotificationModal = document.getElementById('switch-source-notification-modal');
    const closeSwitchSourceNotification = document.getElementById('close-switch-source-notification');
    const developerMessageButton = document.getElementById('developer-message-button');
    const developerMessageModal = document.getElementById('developer-message-modal');
    const closeDeveloperMessageModal = document.getElementById('close-developer-message-modal');

    // From MovieRecommendationBasedOnMood/script.js
    const moodButtons = document.querySelectorAll('.mood-btn');
    const movieRecommendationsGrid = document.getElementById('movie-recommendations'); // Renamed to avoid conflict
    const historyList = document.getElementById('history-list');
    const categoryButtonsContainer = document.getElementById('category-buttons');
    const sortBySelect = document.getElementById('sort-by');
    const filterTextInput = document.getElementById('filter-text');
    const loadMoreMoodBtn = document.getElementById('load-more-mood-btn'); // Renamed to avoid conflict
    

    // --- API & CONFIG ---
    let popularMoviesPage = 1;
    let popularTvShowsPage = 1;
    let newsPage = 1;
    let searchResultsPage = 1;
    let currentSearchQuery = '';
    

    let moodGenreMapping = {}; // From MovieRecommendationBasedOnMood
    let currentMoodGenres = []; // From MovieRecommendationBasedOnMood
    let displayedMovieIds = new Set(); // From MovieRecommendationBasedOnMood
    let currentMoviesMood = []; // From MovieRecommendationBasedOnMood
    let currentPageMood = 1; // From MovieRecommendationBasedOnMood



    // --- API CALLS (from NowShowing/app.js, adapted for unified proxy) ---
    



    // --- UI RENDERING ---
    const ui = {
        displayError(message, container) {
            container.innerHTML = `<h2 class="error-message">${message}</h2>`;
            // Adjust display based on which section is showing the error
            if (container === searchResultsGrid) {
                searchResultsSection.style.display = 'block';
                popularMoviesSection.style.display = 'none';
                // Hide mood-based sections if search results are shown
                document.getElementById('movie-recommendations').parentElement.style.display = 'none';
            } else if (container === movieRecommendationsGrid) {
                document.getElementById('movie-recommendations').parentElement.style.display = 'block';
                popularMoviesSection.style.display = 'none';
                searchResultsSection.style.display = 'none';
            }
            loadMorePopularButton.style.display = 'none';
            loadMoreSearchButton.style.display = 'none';
            loadMoreMoodBtn.style.display = 'none';
        },
        createMovieCard(movie) {
            if (!movie || !movie.Poster || movie.Poster === 'N/A') return null;

            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.innerHTML = `
                <div class="movie-card-image-container">
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <i class="fas fa-play play-icon" aria-hidden="true"></i>
                </div>
                <div class="movie-card-body">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                </div>
            `;
            // Link to the unified detail.html
            movieCard.addEventListener('click', () => {
                window.location.href = `detail.html?imdbID=${movie.imdbID}`;
            });
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
                    hasMore = currentPage * 10 < totalResults;
                } else {
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
                    newsGrid.innerHTML = `<p class="error-message">Could not load news: ${error.message}. Please try again later.</p>`;
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
                let errorMessage = 'No movies or TV shows found. Please try another search.';
                if (results.Error) {
                    if (results.Error === 'Movie not found!') {
                        errorMessage = 'No movies or TV shows found matching your search. Please try a different query.';
                    } else if (results.Error.includes('limit')) {
                        errorMessage = 'API request limit reached. Please try again later.';
                    }
                }
                this.displayError(errorMessage, searchResultsGrid);
            }
        },
        showHomeView() {
            popularMoviesSection.style.display = 'block';
            searchResultsSection.style.display = 'none';
            popularTvShowsSection.style.display = 'none';
            // Hide mood-based sections when showing popular movies
            document.getElementById('movie-recommendations').parentElement.style.display = 'none';
            searchInput.value = '';
            loadMorePopularButton.style.display = 'block'; // Ensure it's visible on home view
            popularMoviesPage = 1; // Reset popular movies page
            this.renderPopularMovies(); // Re-render popular movies from start
        },
        showSearchView() {
            popularMoviesSection.style.display = 'none';
            searchResultsSection.style.display = 'block';
            popularTvShowsSection.style.display = 'none';
            // Hide mood-based sections when showing search results
            document.getElementById('movie-recommendations').parentElement.style.display = 'none';
        },
        showMoodView() {
            document.getElementById('movie-recommendations').parentElement.style.display = 'block';
            popularMoviesSection.style.display = 'none';
            searchResultsSection.style.display = 'none';
            popularTvShowsSection.style.display = 'none';
            searchInput.value = '';
            loadMoreMoodBtn.style.display = 'block';
            currentPageMood = 1;
            // Initial mood-based load (e.g., Happy movies)
            // This will be triggered by mood button clicks
        },
        ,

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
                switchSourceNotificationModal.style.display = 'flex'; // Show the switch source notification
                ui.trapFocus(switchSourceNotificationModal); // Trap focus within the notification modal
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
                switchSourceNotificationModal.style.display = 'flex'; // Show the switch source notification
                ui.trapFocus(switchSourceNotificationModal); // Trap focus within the notification modal
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
            videoPlayer.src = 'about:blank'; // Clear iframe content to stop playback and release resources
            videoModal.style.display = 'none';
            videoAvailabilityStatus.style.display = 'none'; // Hide status when modal is closed
            videoPlayOverlay.style.display = 'none'; // Hide play overlay when modal is closed

            // Remove event listeners to prevent memory leaks
            if (seasonSelect && ui.currentSeasonChangeListener) {
                seasonSelect.removeEventListener('change', ui.currentSeasonChangeListener);
                ui.currentSeasonChangeListener = null; // Clear reference
            }
            if (episodeSelect && ui.currentEpisodeChangeListener) {
                episodeSelect.removeEventListener('change', ui.currentEpisodeChangeListener);
                ui.currentEpisodeChangeListener = null; // Clear reference
            }

            if (lastFocusedElement) {
                lastFocusedElement.focus(); // Return focus to the element that opened the modal
                lastFocusedElement = null;
            }
            document.removeEventListener('keydown', this.handleModalTabKey);
        },
        handleModalTabKey: null, // To store the function reference for removal
        trapFocus(modalElement) {
            const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableableElements.length - 1];

            this.handleModalTabKey = (event) => {
                const isTabPressed = (event.key === 'Tab' || event.keyCode === 9);

                if (!isTabPressed) {
                    return;
                }

                if (event.shiftKey) { // if shift key pressed for shift + tab combination
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus(); // add focus to the last focusable element
                        event.preventDefault();
                    }
                } else { // if tab key is pressed
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus(); // add focus to the first focusable element
                        event.preventDefault();
                    }
                }
            };

            document.addEventListener('keydown', this.handleModalTabKey);
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

        // From MovieRecommendationBasedOnMood/script.js
        displayMoviesMood(moviesToDisplay) {
            if (!moviesToDisplay || moviesToDisplay.length === 0) {
                movieRecommendationsGrid.innerHTML = '<p>No movies found matching your criteria.</p>';
                return;
            }

            // Clear only if not appending
            if (currentPageMood === 1) {
                movieRecommendationsGrid.innerHTML = '';
            }

            moviesToDisplay.forEach(movie => {
                const movieCard = ui.createMovieCard(movie); // Use unified createMovieCard
                if (movieCard) {
                    movieRecommendationsGrid.appendChild(movieCard);
                }
            });
        },

        applyFiltersAndSortMood() {
            let filteredMovies = [...currentMoviesMood];

            // Apply filter
            const filterText = filterTextInput.value.toLowerCase();
            if (filterText) {
                filteredMovies = filteredMovies.filter(movie =>
                    movie.Title.toLowerCase().includes(filterText)
                );
            }

            // Apply sort
            const sortBy = sortBySelect.value;
            if (sortBy === 'title') {
                filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
            } else if (sortBy === 'year') {
                filteredMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
            }

            ui.displayMoviesMood(filteredMovies);
        },

        addToHistory(mood, genres) {
            const historyItem = document.createElement('li');
            const genresString = Array.isArray(genres) ? genres.join(', ') : String(genres);
            historyItem.textContent = `Searched for ${mood} movies (Genres: ${genresString})`;
            historyList.prepend(historyItem);

            // Store in local storage
            let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
            history.unshift({ mood, genres: genresString, date: new Date().toISOString() });
            if (history.length > 5) {
                history.pop();
            }
            localStorage.setItem('movieHistory', JSON.stringify(history));
        },

        loadHistory() {
            let history = JSON.parse(localStorage.getItem('movieHistory')) || [];
            history.forEach(item => {
                const historyItem = document.createElement('li');
                historyItem.textContent = `Searched for ${item.mood} movies (Genres: ${item.genres})`;
                historyList.appendChild(historyItem);
            });
        },

        populateCategories() {
            const allGenres = new Set();

            for (const mood in moodGenreMapping) {
                moodGenreMapping[mood].genres.forEach(genre => allGenres.add(genre));
            }

            categoryButtonsContainer.innerHTML = ''; // Clear existing buttons
            allGenres.forEach(genre => {
                const button = document.createElement('button');
                button.classList.add('category-btn');
                button.textContent = genre;
                button.dataset.genre = genre;
                button.addEventListener('click', () => {
                    currentPageMood = 1;
                    currentMoodGenres = [genre];
                    displayedMovieIds.clear();
                    ui.findMoviesByGenre(genre, currentPageMood, false); // Pass genre as mood for history
                });
                categoryButtonsContainer.appendChild(button);
            });
        },

        async findMoviesByGenre(moodOrGenre, page = 1, append = false) {
            if (!append) {
                movieRecommendationsGrid.innerHTML = '<p>Loading mood-based movies...</p>';
                loadMoreMoodBtn.style.display = 'none';
            }

            const genres = moodGenreMapping[moodOrGenre] ? moodGenreMapping[moodOrGenre].genres : [moodOrGenre];
            const genreSearchTerm = genres[0];

            try {
                const omdbSearchUrl = `/api/omdb-proxy?s=${encodeURIComponent(genreSearchTerm)}&type=movie&page=${page}`;
                const omdbResponse = await fetch(omdbSearchUrl);
                const omdbData = await omdbResponse.json();

                if (omdbData.Response === "True" && omdbData.Search) {
                    const moviePromises = omdbData.Search.map(async movie => {
                        return api.fetchOmdbMovieDetailsMood(movie.imdbID, movie.Title, movie.Year);
                    });

                    const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                    const newOmdbMovies = omdbMovies.filter(movie => movie.Response === "True" && !displayedMovieIds.has(movie.imdbID));

                    newOmdbMovies.forEach(movie => displayedMovieIds.add(movie.imdbID));

                    if (append) {
                        currentMoviesMood = [...currentMoviesMood, ...newOmdbMovies];
                    } else {
                        currentMoviesMood = newOmdbMovies;
                    }

                    ui.applyFiltersAndSortMood();
                    ui.addToHistory(moodOrGenre, genres.join(', '));

                    const totalResults = parseInt(omdbData.totalResults);
                    const moviesPerPage = omdbData.Search.length;
                    const totalPages = Math.ceil(totalResults / moviesPerPage);

                    if (page < totalPages) {
                        loadMoreMoodBtn.style.display = 'block';
                    } else {
                        loadMoreMoodBtn.style.display = 'none';
                    }

                } else {
                    ui.displayError(`Could not find movies for the mood/genre: ${moodOrGenre}.`, movieRecommendationsGrid);
                    loadMoreMoodBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching movies from OMDB:', error);
                ui.displayError('An error occurred while fetching movie recommendations. Please check your internet connection or try again later.', movieRecommendationsGrid);
                loadMoreMoodBtn.style.display = 'none';
            }
        },

        async searchAllMoviesUnified(searchTerm) {
            ui.showSearchView(); // Show search results section
            searchResultsGrid.innerHTML = '<p>Searching for movies...</p>';
            loadMoreSearchButton.style.display = 'none';
            currentMoviesMood = []; // Clear mood-based movies
            displayedMovieIds.clear(); // Clear displayed movies for new search

            try {
                const omdbSearchUrl = `/api/omdb-proxy?s=${encodeURIComponent(searchTerm)}&type=movie`;
                const response = await fetch(omdbSearchUrl);
                const data = await response.json();

                if (data.Response === "True" && data.Search) {
                    const moviePromises = data.Search.map(async movie => {
                        return api.fetchOmdbMovieDetailsMood(movie.imdbID, movie.Title, movie.Year);
                    });

                    const omdbMovies = (await Promise.all(moviePromises)).filter(movie => movie !== null);
                    const newOmdbMovies = omdbMovies.filter(movie => movie.Response === "True" && !displayedMovieIds.has(movie.imdbID));

                    newOmdbMovies.forEach(movie => displayedMovieIds.add(movie.imdbID));

                    ui.renderMovieGrid(searchResultsGrid, newOmdbMovies, false, loadMoreSearchButton, searchResultsPage, data.totalResults);
                } else {
                    ui.displayError(`No movies found for "${searchTerm}".`, searchResultsGrid);
                }
            } catch (error) {
                console.error('Error searching all movies:', error);
                ui.displayError('An error occurred while searching for movies. Please check your internet connection or try again later.', searchResultsGrid);
            }
        },
    };

    // --- EVENT LISTENERS ---
    const setupLoadMoreButton = (button, pageVar, renderFunction, query = null) => {
        button.addEventListener('click', () => {
            window[pageVar]++;
            renderFunction(true, query);
        });
    };

    // Main Search Bar (from NowShowing)
    searchButton.addEventListener('click', () => ui.searchAllMoviesUnified(searchInput.value.trim()));
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            ui.searchAllMoviesUnified(searchInput.value.trim());
        }
    });

    

    // Mood Buttons
    moodButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const mood = button.dataset.mood;
            ui.showMoodView(); // Show mood-based section
            currentPageMood = 1; // Reset page for new mood search
            currentMoodGenres = moodGenreMapping[mood].genres; // Store current genres
            displayedMovieIds.clear(); // Clear displayed movies for new mood
            ui.findMoviesByGenre(mood, currentPageMood, false); // Pass mood for history
        });
    });

    // Category Buttons (populated dynamically)
    categoryButtonsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('category-btn')) {
            const genre = event.target.dataset.genre;
            ui.showMoodView(); // Show mood-based section
            currentPageMood = 1;
            currentMoodGenres = [genre];
            displayedMovieIds.clear();
            ui.findMoviesByGenre(genre, currentPageMood, false); // Pass genre as mood for history
        }
    });

    // Sort and Filter for Mood-based recommendations
    sortBySelect.addEventListener('change', ui.applyFiltersAndSortMood);
    filterTextInput.addEventListener('input', ui.applyFiltersAndSortMood);
    loadMoreMoodBtn.addEventListener('click', () => {
        currentPageMood++;
        ui.findMoviesByGenre(currentMoodGenres[0], currentPageMood, true); // Use first genre as mood for consistency
    });

    // NowShowing specific event listeners
    

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (notificationModal.style.display === 'flex') {
                notificationModal.style.display = 'none';
                localStorage.setItem('hasSeenBraveNotification', 'true');
            } else if (switchSourceNotificationModal.style.display === 'flex') {
                switchSourceNotificationModal.style.display = 'none';
                document.removeEventListener('keydown', ui.handleModalTabKey);
            } else if (developerMessageModal.style.display === 'flex') {
                developerMessageModal.style.display = 'none';
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                }
                document.removeEventListener('keydown', ui.handleModalTabKey);
            }
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

    setupLoadMoreButton(loadMorePopularButton, 'popularMoviesPage', ui.renderPopularMovies);
    setupLoadMoreButton(loadMoreSearchButton, 'searchResultsPage', ui.searchAllMoviesUnified, currentSearchQuery);
    setupLoadMoreButton(loadMorePopularTvButton, 'popularTvShowsPage', ui.renderPopularTvShows);
    setupLoadMoreButton(loadMoreNewsButton, 'newsPage', ui.renderNews);

    moviesNavLink.addEventListener('click', (e) => {
        e.preventDefault();
        ui.showHomeView();
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
        ui.showHomeView();
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

    // Notification Logic
    const hasSeenNotification = localStorage.getItem('hasSeenBraveNotification');
    if (!hasSeenNotification) {
        notificationModal.style.display = 'flex';
        ui.trapFocus(notificationModal);
    }

    notificationButton.addEventListener('click', () => {
        notificationModal.style.display = 'flex';
        ui.trapFocus(notificationModal);
    });

    closeNotificationModal.addEventListener('click', () => {
        notificationModal.style.display = 'none';
        localStorage.setItem('hasSeenBraveNotification', 'true');
        document.removeEventListener('keydown', ui.handleModalTabKey);
    });

    window.addEventListener('click', (event) => {
        if (event.target === notificationModal) {
            notificationModal.style.display = 'none';
            localStorage.setItem('hasSeenBraveNotification', 'true');
            document.removeEventListener('keydown', ui.handleModalTabKey);
        }
    });

    developerMessageButton.addEventListener('click', () => {
        developerMessageModal.style.display = 'flex';
        ui.trapFocus(developerMessageModal);
    });

    closeDeveloperMessageModal.addEventListener('click', () => {
        developerMessageModal.style.display = 'none';
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
        document.removeEventListener('keydown', ui.handleModalTabKey);
    });

    window.addEventListener('click', (event) => {
        if (event.target === developerMessageModal) {
            developerMessageModal.style.display = 'none';
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
            document.removeEventListener('keydown', ui.handleModalTabKey);
        }
    });

    // Service Worker Registration (from MovieRecommendationBasedOnMood/script.js)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // Fetch mood-genre mapping from config.json (from MovieRecommendationBasedOnMood/script.js)
    fetch('config.json') // Adjusted path
        .then(response => response.json())
        .then(data => {
            moodGenreMapping = data.moodGenreMapping;
            ui.populateCategories(); // Populate categories after mapping is loaded
            ui.loadHistory(); // Load history after mapping is loaded
        })
        .catch(error => {
            console.error('Error fetching config:', error);
            movieRecommendationsGrid.innerHTML = `<p>Could not load mood configurations. Please try again later.</p>`;
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
        // Initially show mood-based recommendations or popular movies
        ui.showMoodView(); // Start with mood view
    };

    init();
});