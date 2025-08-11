import { api } from './utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const popularMoviesGrid = document.getElementById('popular-movies');
    const searchResultsGrid = document.getElementById('search-results');
    const popularTvShowsGrid = document.getElementById('popular-tv-shows');
    const newsGrid = document.getElementById('news-grid');
    const movieRecommendationsGrid = document.getElementById('movie-recommendations');

    const popularMoviesSection = document.querySelector('#popular-movies').parentElement;
    const searchResultsSection = document.querySelector('#search-results').parentElement;
    const popularTvShowsSection = document.querySelector('#popular-tv-shows').parentElement;
    const moodRecommendationsSection = document.querySelector('#movie-recommendations').parentElement;

    const loadMorePopularButton = document.getElementById('load-more-popular');
    const loadMoreSearchButton = document.getElementById('load-more-search');
    const loadMorePopularTvButton = document.getElementById('load-more-popular-tv');
    const loadMoreNewsButton = document.getElementById('load-more-news');
    const loadMoreMoodBtn = document.getElementById('load-more-mood-btn');

    const moodButtons = document.querySelectorAll('.mood-btn');
    const sortBySelect = document.getElementById('sort-by');
    const filterTextInput = document.getElementById('filter-text');
    const historyList = document.getElementById('history-list');

    // --- STATE VARIABLES ---
    let popularMoviesPage = 1;
    let popularTvShowsPage = 1;
    let newsPage = 1;
    let searchResultsPage = 1;
    let currentPageMood = 1;
    let currentSearchQuery = '';
    let currentMoviesMood = [];
    let currentMood = 'Happy'; // Default mood

    // --- CURATED MOOD-BASED TITLE LISTS ---
    const moodBasedTitles = {
        Happy: ["Forrest Gump", "Paddington 2", "School of Rock", "La La Land", "Amelie", "The Princess Bride"],
        Sad: ["The Shawshank Redemption", "Schindler's List", "Grave of the Fireflies", "Manchester by the Sea", "Atonement"],
        Excited: ["Mad Max: Fury Road", "The Dark Knight", "Inception", "Spider-Man: Into the Spider-Verse", "Mission: Impossible - Fallout"],
        Relaxed: ["My Neighbor Totoro", "Chef", "The Big Lebowski", "Little Miss Sunshine", "About Time"],
        Angry: ["John Wick", "Gladiator", "V for Vendetta", "The Revenant", "Kill Bill: Vol. 1"],
        Scared: ["The Shining", "Hereditary", "Get Out", "A Quiet Place", "The Conjuring"],
        Inspired: ["Rocky", "Good Will Hunting", "Hidden Figures", "The Pursuit of Happyness", "Dead Poets Society"],
        Nostalgic: ["Back to the Future", "E.T. the Extra-Terrestrial", "Stand by Me", "The Goonies", "Ferris Bueller's Day Off"],
        Curious: ["Zodiac", "Arrival", "Primer", "The Prestige", "Shutter Island"],
        Romantic: ["Before Sunrise", "Pride & Prejudice", "When Harry Met Sally...", "The Notebook", "Casablanca"],
        Adventurous: ["Indiana Jones and the Raiders of the Lost Ark", "The Lord of the Rings: The Fellowship of the Ring", "Jurassic Park", "Star Wars: A New Hope", "Pirates of the Caribbean: The Curse of the Black Pearl"],
        Thoughtful: ["Blade Runner 2049", "Her", "Eternal Sunshine of the Spotless Mind", "Gattaca", "The Truman Show"],
        Anxious: ["Uncut Gems", "Sicario", "No Country for Old Men", "Black Swan", "Whiplash"],
        Hopeful: ["It's a Wonderful Life", "The Intouchables", "Life of Pi", "Slumdog Millionaire", "Erin Brockovich"],
        Playful: ["Who Framed Roger Rabbit", "The Grand Budapest Hotel", "O Brother, Where Art Thou?", "Big Fish", "Fantastic Mr. Fox"],
        Adult: ["The Godfather", "Pulp Fiction", "No Country for Old Men", "There Will Be Blood", "A Clockwork Orange"]
    };

    // --- UI RENDERING ---
    const ui = {
        displayError(message, container) {
            container.innerHTML = `<h2 class="error-message">${message}</h2>`;
        },

        createMovieCard(movie) {
            if (!movie || !movie.Poster || movie.Poster === 'N/A') return null;

            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            const placeholderSvg = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3e%3crect width="300" height="450" fill="%23333"/%3e%3c/svg%3e';
            movieCard.innerHTML = `
                <div class="movie-card-image-container">
                    <img src="${movie.Poster}" alt="${movie.Title}" onerror="this.onerror=null;this.src='${placeholderSvg}';">
                    <i class="fas fa-play play-icon" aria-hidden="true"></i>
                </div>
                <div class="movie-card-body">
                    <h3 class="movie-card-title">${movie.Title}</h3>
                </div>
            `;
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

        renderMovieGrid(container, movies, append = false, loadMoreButton = null, currentPage = 1, totalResults = 0) {
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
                const hasMore = (currentPage * 10) < totalResults;
                loadMoreButton.style.display = hasMore ? 'block' : 'none';
            }
        },

        async renderPopularMovies() {
            this.renderSkeletons(popularMoviesGrid, 8);
            try {
                const results = await api.fetchPopularMovies(popularMoviesPage);
                if (results && results.Response === 'True') {
                    this.renderMovieGrid(popularMoviesGrid, results.Search, false, loadMorePopularButton, popularMoviesPage, results.totalResults);
                } else {
                    this.displayError(results.Error || 'No popular movies found.', popularMoviesGrid);
                }
            } catch (error) {
                this.displayError('An error occurred while fetching popular movies.', popularMoviesGrid);
            }
        },

        async renderNews() {
            try {
                const data = await api.fetchNews(newsPage);
                if (data.error) throw new Error(data.error);

                newsGrid.innerHTML = '';
                data.articles.forEach(article => {
                    const newsCard = document.createElement('a');
                    newsCard.className = 'news-card';
                    newsCard.href = article.url;
                    newsCard.target = '_blank';
                    newsCard.innerHTML = `
                        <img src="${article.image || ''}" alt="${article.title}" onerror="this.style.display='none'">
                        <div class="news-card-body">
                            <h3 class="news-card-title">${article.title}</h3>
                            <p class="news-card-source">${article.source.name}</p>
                        </div>
                    `;
                    newsGrid.appendChild(newsCard);
                });
            } catch (error) {
                console.error('Error fetching news:', error);
                this.displayError(`Could not load news: ${error.message}.`, newsGrid);
            }
        },

        async renderSearchResults(query, append = false) {
            if (!query) return;
            this.showSearchView();
            currentSearchQuery = query;
            if (!append) {
                searchResultsPage = 1;
                this.renderSkeletons(searchResultsGrid, 10);
            }

            try {
                const results = await api.fetchMoviesBySearch(query, searchResultsPage);
                if (results && results.Response === 'True') {
                    this.renderMovieGrid(searchResultsGrid, results.Search, append, loadMoreSearchButton, searchResultsPage, results.totalResults);
                } else {
                    this.displayError(results.Error || 'No movies or TV shows found.', searchResultsGrid);
                }
            } catch (error) {
                this.displayError('An error occurred during search.', searchResultsGrid);
            }
        },

        async findMoviesByMood(mood, append = false) {
            const moviesPerPage = 5;
            if (!append) {
                currentPageMood = 1;
                this.renderSkeletons(movieRecommendationsGrid, moviesPerPage);
            }

            const titlesForMood = moodBasedTitles[mood] || [];
            if (titlesForMood.length === 0) {
                this.displayError(`No curated movie list for the mood: ${mood}.`, movieRecommendationsGrid);
                loadMoreMoodBtn.style.display = 'none';
                return;
            }

            const startIndex = (currentPageMood - 1) * moviesPerPage;
            const endIndex = startIndex + moviesPerPage;
            const titlesToLoad = titlesForMood.slice(startIndex, endIndex);

            if (titlesToLoad.length === 0) {
                loadMoreMoodBtn.style.display = 'none';
                return;
            }

            try {
                const moviePromises = titlesToLoad.map(title => api.fetchMovieByTitle(title));
                const movies = await Promise.all(moviePromises);
                const validMovies = movies.filter(movie => movie && movie.Response === 'True');

                if (append) {
                    currentMoviesMood = [...currentMoviesMood, ...validMovies];
                } else {
                    currentMoviesMood = validMovies;
                }

                this.applyFiltersAndSortMood();
                this.addToHistory(mood);

                loadMoreMoodBtn.style.display = endIndex < titlesForMood.length ? 'block' : 'none';
            } catch (error) {
                console.error('Error fetching movies by mood:', error);
                this.displayError('An error occurred while fetching mood-based recommendations.', movieRecommendationsGrid);
                loadMoreMoodBtn.style.display = 'none';
            }
        },

        applyFiltersAndSortMood() {
            let filteredMovies = [...currentMoviesMood];
            const filterText = filterTextInput.value.toLowerCase();
            if (filterText) {
                filteredMovies = filteredMovies.filter(movie => movie.Title.toLowerCase().includes(filterText));
            }

            const sortBy = sortBySelect.value;
            if (sortBy === 'title') {
                filteredMovies.sort((a, b) => a.Title.localeCompare(b.Title));
            } else if (sortBy === 'year') {
                filteredMovies.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
            }
            this.renderMovieGrid(movieRecommendationsGrid, filteredMovies);
        },

        addToHistory(mood) {
            const historyItem = document.createElement('li');
            historyItem.textContent = `Searched for ${mood} movies`;
            historyList.prepend(historyItem);
            if (historyList.children.length > 5) {
                historyList.removeChild(historyList.lastChild);
            }
        },

        showHomeView() {
            popularMoviesSection.style.display = 'block';
            moodRecommendationsSection.style.display = 'block';
            searchResultsSection.style.display = 'none';
            searchInput.value = '';
        },

        showSearchView() {
            popularMoviesSection.style.display = 'none';
            moodRecommendationsSection.style.display = 'none';
            searchResultsSection.style.display = 'block';
        }
    };

    // --- EVENT LISTENERS ---
    searchButton.addEventListener('click', () => ui.renderSearchResults(searchInput.value.trim()));
    searchInput.addEventListener('keyup', e => e.key === 'Enter' && ui.renderSearchResults(searchInput.value.trim()));

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentMood = button.dataset.mood;
            ui.findMoviesByMood(currentMood, false);
        });
    });

    loadMoreMoodBtn.addEventListener('click', () => {
        currentPageMood++;
        ui.findMoviesByMood(currentMood, true);
    });

    loadMorePopularButton.addEventListener('click', () => {
        popularMoviesPage++;
        ui.renderPopularMovies(true);
    });

    sortBySelect.addEventListener('change', ui.applyFiltersAndSortMood);
    filterTextInput.addEventListener('input', ui.applyFiltersAndSortMood);

    // --- INITIAL LOAD ---
    const init = () => {
        ui.renderPopularMovies();
        ui.renderNews();
        ui.findMoviesByMood(currentMood); // Load default mood
    };

    init();
});