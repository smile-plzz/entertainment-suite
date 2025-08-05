document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchButtonNav = document.getElementById('search-button-nav');
    const searchInputNav = document.getElementById('search-input-nav');
    const moodSelectorButtons = document.querySelectorAll('.mood-selector-btn'); // Old mood selector
    const popularMoviesSection = document.querySelector('#popular-movies').parentElement;
    const searchResultsSection = document.querySelector('#search-results').parentElement;
    const popularTvShowsSection = document.querySelector('#popular-tv-shows').parentElement;
    const popularMoviesGrid = document.getElementById('popular-movies');
    const searchResultsGrid = document.getElementById('search-results');
    const popularTvShowsGrid = document.getElementById('popular-tv-shows');
    const movieRecommendationsGrid = document.getElementById('movie-recommendations');
    const newsSection = document.querySelector('#news-grid').parentElement;
    const newsGrid = document.getElementById('news-grid');
    const loadMoreNewsButton = document.getElementById('load-more-news');
    const loadMorePopularButton = document.getElementById('load-more-popular');
    const loadMoreSearchButton = document.getElementById('load-more-search');
    const loadMorePopularTvButton = document.getElementById('load-more-popular-tv');
    const notificationButton = document.getElementById('notification-button');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationModal = document.getElementById('close-notification-modal');

    const switchSourceNotificationModal = document.getElementById('switch-source-notification-modal');
    const closeSwitchSourceNotification = document.getElementById('close-switch-source-notification');

    const developerMessageButton = document.getElementById('developer-message-button');
    const developerMessageModal = document.getElementById('developer-message-modal');
    const closeDeveloperMessageModal = document.getElementById('close-developer-message-modal');

    // Mood Drawer Elements
    const moodDrawer = document.getElementById('mood-drawer');
    const bottomNavMoodBtn = document.getElementById('bottom-nav-mood-btn');
    const closeMoodDrawerBtn = document.getElementById('close-mood-drawer');
    const moodOptionButtons = document.querySelectorAll('.mood-option-btn'); // New mood selector

    // --- API & CONFIG ---
    let popularMoviesPage = 1;
    let popularTvShowsPage = 1;
    let searchResultsPage = 1;
    let newsPage = 1;
    let currentSearchQuery = '';
    let lastFocusedElement = null; 

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
            try {
                const response = await fetch('/api/check-video', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url }),
                });
                const data = await response.json();
                return data.available;
            } catch (error) {
                console.error(`Error checking video availability for ${url}:`, error);
                return false;
            }
        },
        async fetchMovieByTitle(title, type = '') {
            try {
                let url = `/api/omdb-proxy?title=${encodeURIComponent(title)}`;
                if (type) {
                    url += `&type=${type}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching movie by title (${title}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchMovieDetails(imdbID) {
            try {
                const url = `/api/omdb-proxy?imdbID=${imdbID}&plot=full`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching movie details (${imdbID}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchMoviesBySearch(query, page = 1, type = '') {
            try {
                let url = `/api/omdb-proxy?s=${encodeURIComponent(query)}&page=${page}`;
                if (type) {
                    url += `&type=${type}`;
                }
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching search results (${query}):`, error);
                return { Response: 'False', Error: error.message };
            }
        },
        async fetchTvShowSeason(imdbID, seasonNumber) {
            try {
                const url = `/api/omdb-proxy?imdbID=${imdbID}&seasonNumber=${seasonNumber}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return await response.json();
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
                searchResultsSection.classList.remove('hidden-section');
                popularMoviesSection.classList.add('hidden-section');
            }
            loadMorePopularButton.classList.add('hidden-button');
            loadMoreSearchButton.classList.add('hidden-button');
        },
        createMovieCard(movie) {
            if (!movie || !movie.Poster || movie.Poster === 'N/A') return null;

            const movieCard = document.createElement('div');
            movieCard.className = 'col-6 col-sm-4 col-md-3 col-lg-2';

            const cardContent = document.createElement('div');
            cardContent.className = 'movie-card';
            cardContent.innerHTML = `
                <div class="movie-card-image-container">
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <i class="fas fa-play play-icon" aria-hidden="true"></i>
                </div>
                <div class="movie-card-body">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                </div>
            `;
            cardContent.addEventListener('click', () => {
                window.location.href = `detail.html?imdbID=${movie.imdbID}`;
            });
            movieCard.appendChild(cardContent);
            return movieCard;
        },
        renderSkeletons(container, count) {
            container.innerHTML = '<div class="loader-container"><span class="emoji-loader">🎬</span></div>';
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
                    loadMoreButton.classList.remove('hidden-button');
                } else {
                    loadMoreButton.classList.add('hidden-button');
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
                loadMorePopularButton.classList.add('hidden-button');
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
                loadMorePopularTvButton.classList.add('hidden-button');
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
            popularMoviesSection.classList.remove('hidden-section');
            searchResultsSection.classList.add('hidden-section');
            popularTvShowsSection.classList.add('hidden-section');
            searchInputNav.value = '';
            loadMorePopularButton.classList.remove('hidden-button');
            popularMoviesPage = 1;
            this.renderPopularMovies();
        },
        showSearchView() {
            popularMoviesSection.classList.add('hidden-section');
            searchResultsSection.classList.remove('hidden-section');
            popularTvShowsSection.classList.add('hidden-section');
        },
        showNewsView() {
            popularMoviesSection.classList.add('hidden-section');
            searchResultsSection.classList.add('hidden-section');
            popularTvShowsSection.classList.add('hidden-section');
            newsSection.classList.remove('hidden-section');
        },
        async renderNews(append = false) {
            if (!append) {
                newsGrid.innerHTML = '';
                this.renderSkeletons(newsGrid, 8);
            }

            try {
                const response = await fetch(`/api/fetch-news?page=${newsPage}`);
                const data = await response.json();

                if (data && data.articles && data.articles.length > 0) {
                    data.articles.forEach(article => {
                        const newsCard = document.createElement('div');
                        newsCard.className = 'col-12 col-md-6 col-lg-4 news-card';
                        newsCard.innerHTML = `
                            <img src="${article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${article.title}">
                            <div class="news-card-body">
                                <h3>${article.title}</h3>
                                <p class="news-source">Source: ${article.source.name}</p>
                                <a href="${article.url}" target="_blank" class="read-more-btn">Read More</a>
                            </div>
                        `;
                        newsGrid.appendChild(newsCard);
                    });
                    if (newsPage * 10 < data.totalResults) {
                        loadMoreNewsButton.classList.remove('hidden-button');
                    } else {
                        loadMoreNewsButton.classList.add('hidden-button');
                    }
                } else {
                    this.displayError('No news articles found.', newsGrid);
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                this.displayError('Failed to load news. Please try again later.', newsGrid);
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

    searchButtonNav.addEventListener('click', () => ui.renderSearchResults(searchInputNav.value.trim()));
    searchInputNav.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            ui.renderSearchResults(searchInputNav.value.trim());
        }
    });

    // Old mood selector buttons (hidden on mobile)
    moodSelectorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            moodSelectorButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            if (mood === 'all') {
                ui.showHomeView();
            } else {
                // Removed ui.findMoviesByMood(mood);
            }
        });
    });

    // Mood Drawer Event Listeners
    bottomNavMoodBtn.addEventListener('click', () => {
        moodDrawer.classList.add('open');
    });

    closeMoodDrawerBtn.addEventListener('click', () => {
        moodDrawer.classList.remove('open');
    });

    moodOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mood = button.dataset.mood;
            // Deactivate all mood buttons (both old and new)
            moodSelectorButtons.forEach(btn => btn.classList.remove('active'));
            moodOptionButtons.forEach(btn => btn.classList.remove('active'));
            // Activate the clicked button
            button.classList.add('active');

            if (mood === 'all') {
                ui.showHomeView();
            } else {
                // Implement mood-based filtering here
                // For now, just log the mood
                console.log(`Selected mood: ${mood}`);
            }
            moodDrawer.classList.remove('open'); // Close drawer after selection
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (notificationModal.classList.contains('open')) {
                notificationModal.classList.remove('open');
                localStorage.setItem('hasSeenBraveNotification', 'true');
            } else if (switchSourceNotificationModal.classList.contains('open')) {
                switchSourceNotificationModal.classList.remove('open');
            } else if (developerMessageModal.classList.contains('open')) {
                developerMessageModal.classList.remove('open');
                if (lastFocusedElement) {
                    lastFocusedElement.focus();
                }
            } else if (moodDrawer.classList.contains('open')) {
                moodDrawer.classList.remove('open');
            }
        }
    });

    setupLoadMoreButton(loadMorePopularButton, 'popularMoviesPage', ui.renderPopularMovies);
    setupLoadMoreButton(loadMoreSearchButton, 'searchResultsPage', ui.renderSearchResults, currentSearchQuery);
    setupLoadMoreButton(loadMorePopularTvButton, 'popularTvShowsPage', ui.renderPopularTvShows);
    setupLoadMoreButton(loadMoreNewsButton, 'newsPage', ui.renderNews);

    // --- Notification Logic ---
    const hasSeenNotification = localStorage.getItem('hasSeenBraveNotification');
    if (!hasSeenNotification) {
        notificationModal.classList.add('open');
    }

    notificationButton.addEventListener('click', () => {
        notificationModal.classList.add('open');
    });

    closeNotificationModal.addEventListener('click', () => {
        notificationModal.classList.remove('open');
        localStorage.setItem('hasSeenBraveNotification', 'true');
    });

    window.addEventListener('click', (event) => {
        if (event.target === notificationModal) {
            notificationModal.classList.remove('open');
            localStorage.setItem('hasSeenBraveNotification', 'true');
        }
    });

    developerMessageButton.addEventListener('click', () => {
        developerMessageModal.classList.add('open');
    });

    closeDeveloperMessageModal.addEventListener('click', () => {
        developerMessageModal.classList.remove('open');
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === developerMessageModal) {
            developerMessageModal.classList.remove('open');
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }
    });

    // --- INITIAL LOAD ---
    const init = () => {
        ui.renderPopularMovies();
    };

    init();

    // Ambient video background on scroll
    window.addEventListener('scroll', () => {
        const heroVideo = document.getElementById('hero-video');
        if (heroVideo) {
            const scrollPosition = window.scrollY;
            const heroSectionHeight = document.querySelector('.hero-section').offsetHeight;
            const opacity = 1 - (scrollPosition / heroSectionHeight);
            heroVideo.style.opacity = Math.max(0, opacity);
        }
    });
});