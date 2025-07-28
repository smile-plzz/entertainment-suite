document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const heroSection = document.querySelector('.hero-section');
    const popularMoviesSection = document.querySelector('#popular-movies').parentElement;
    const searchResultsSection = document.querySelector('#search-results').parentElement;
    const heroTitle = document.getElementById('hero-title');
    const heroOverview = document.getElementById('hero-overview');
    const watchNowButton = document.getElementById('watch-now-button');
    const popularMoviesGrid = document.getElementById('popular-movies');
    const searchResultsGrid = document.getElementById('search-results');
    const videoModal = document.getElementById('video-modal');
    const videoPlayer = document.getElementById('video-player');
    const sourceButtonsContainer = document.getElementById('source-buttons');
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
    ];

    // --- API CALLS ---
    const api = {
        async fetchMovieByTitle(title, type = '') {
            try {
                let url = `https://www.omdbapi.com/?t=${title}&apikey=${apiKey}`;
                if (type) {
                    url += `&type=${type}`;
                }
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching movie by title (${title}):`, error);
            }
        },
        async fetchMoviesBySearch(query, page = 1, type = '') {
            try {
                let url = `https://www.omdbapi.com/?s=${query}&page=${page}&apikey=${apiKey}`;
                if (type) {
                    url += `&type=${type}`;
                }
                const response = await fetch(url);
                return await response.json();
            } catch (error) {
                console.error(`Error fetching search results (${query}):`, error);
            }
        },
    };

    // --- UI RENDERING ---
    const ui = {
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
        async renderHero(title) {
            const movie = await api.fetchMovieByTitle(title, 'movie');
            if (movie && movie.Response === 'True') {
                heroSection.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.7), transparent), url(${movie.Poster})`;
                heroTitle.textContent = movie.Title;
                heroOverview.textContent = movie.Plot;
                watchNowButton.onclick = () => this.openVideoModal(movie.imdbID);
            }
        },
        async renderMovies(container, movieTitles, append = false) {
            if (!append) {
                this.renderSkeletons(container, movieTitles.length);
            }
            const moviePromises = movieTitles.map(title => api.fetchMovieByTitle(title));
            const movies = await Promise.all(moviePromises);
            if (!append) {
                container.innerHTML = '';
            }
            movies.forEach(movie => {
                const movieCard = this.createMovieCard(movie);
                if (movieCard) {
                    container.appendChild(movieCard);
                }
            });
        },
        async renderPopularMovies(append = false) {
            const popularTitles = ['Inception', 'The Matrix', 'Interstellar', 'The Avengers', 'Avatar', 'Titanic', 'Jurassic Park', 'Forrest Gump', 'The Lion King', 'Gladiator', 'Pulp Fiction', 'Fight Club', 'The Lord of the Rings', 'Star Wars', 'Dune'];
            const startIndex = (popularMoviesPage - 1) * 4;
            const endIndex = startIndex + 4;
            const titlesToLoad = popularTitles.slice(startIndex, endIndex);

            if (titlesToLoad.length === 0) {
                loadMorePopularButton.style.display = 'none';
                return;
            }

            if (!append) {
                popularMoviesGrid.innerHTML = '';
                this.renderSkeletons(popularMoviesGrid, 4);
            }

            const moviePromises = titlesToLoad.map(title => api.fetchMovieByTitle(title, 'movie'));
            const movies = await Promise.all(moviePromises);

            if (!append) {
                popularMoviesGrid.innerHTML = '';
            }
            movies.forEach(movie => {
                const movieCard = this.createMovieCard(movie);
                if (movieCard) {
                    popularMoviesGrid.appendChild(movieCard);
                }
            });

            if (endIndex >= popularTitles.length) {
                loadMorePopularButton.style.display = 'none';
            } else {
                loadMorePopularButton.style.display = 'block';
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

            if (!append) {
                searchResultsGrid.innerHTML = '';
            }

            if (results && results.Response === 'True') {
                results.Search.forEach(movie => {
                    const movieCard = this.createMovieCard(movie);
                    if (movieCard) {
                        searchResultsGrid.appendChild(movieCard);
                    }
                });
                if (results.totalResults > searchResultsPage * 10) {
                    loadMoreSearchButton.style.display = 'block';
                } else {
                    loadMoreSearchButton.style.display = 'none';
                }
            } else {
                if (!append) {
                    searchResultsGrid.innerHTML = '<h2>No movies or TV shows found. Please try another search.</h2>';
                }
                loadMoreSearchButton.style.display = 'none';
            }
        },
        showHomeView() {
            heroSection.style.display = 'flex';
            popularMoviesSection.style.display = 'block';
            searchResultsSection.style.display = 'none';
            searchInput.value = '';
            loadMorePopularButton.style.display = 'block'; // Ensure it's visible on home view
            popularMoviesPage = 1; // Reset popular movies page
            this.renderPopularMovies(); // Re-render popular movies from start
        },
        showSearchView() {
            heroSection.style.display = 'none';
            popularMoviesSection.style.display = 'none';
            searchResultsSection.style.display = 'block';
        },
        openVideoModal(imdbID) {
            sourceButtonsContainer.innerHTML = '';
            videoSources.forEach((source, index) => {
                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                button.onclick = () => {
                    videoPlayer.src = `${source.url}${imdbID}`;
                    document.querySelectorAll('.source-button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                };
                sourceButtonsContainer.appendChild(button);

                if (index === 0) {
                    button.click();
                }
            });

            videoModal.style.display = 'block';
        },
        closeVideoModal() {
            videoPlayer.src = '';
            videoModal.style.display = 'none';
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

        ui.showHomeView();
        ui.renderHero('Inception');
    };

    init();
});