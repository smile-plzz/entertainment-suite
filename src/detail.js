import { api, videoSources } from './utils/api.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const imdbID = urlParams.get('imdbID');

    let lastFocusedElement = null; // To store the element that had focus before modal opened

    if (!imdbID) {
        document.querySelector('main').innerHTML = '<p class="error-message">No movie ID provided.</p>';
        return;
    }

    // --- DOM Elements ---
    const heroImage = document.getElementById('hero-image');
    const titleElement = document.getElementById('title');
    const ratingElement = document.getElementById('rating');
    const yearElement = document.getElementById('year');
    const runtimeElement = document.getElementById('runtime');
    const moodTagsContainer = document.getElementById('mood-tags');
    const plotElement = document.getElementById('plot');
    const castCarousel = document.getElementById('cast-carousel');
    const detailsContainer = document.getElementById('details-container');
    const ratingsReviewsContainer = document.getElementById('ratings-reviews');
    const relatedTitlesContainer = document.getElementById('related-titles');
    const episodesSection = document.querySelector('.episodes-section');
    const seasonSelect = document.createElement('select'); // Will be appended to season-selector
    const episodeSelect = document.createElement('select'); // Will be appended to episodes-list
    const seasonSelectorContainer = document.getElementById('season-selector');
    const episodesListContainer = document.getElementById('episodes-list');

    // Video Modal Elements
    const trailerPlayer = document.getElementById('trailer-player');
    const trailerModal = document.getElementById('trailer-modal');
    const closeButton = trailerModal.querySelector('.close-button');
    const videoAvailabilityStatus = document.getElementById('video-availability-status');
    const sourceButtonsContainer = document.getElementById('source-buttons-container');

    // --- API Calls (re-using from app.js for consistency) ---
    

    // --- Video Sources (re-using from app.js) ---
    

    // --- UI Rendering Functions ---
    const ui = {
        displayMovieDetails(details) {
            heroImage.src = details.Poster !== 'N/A' ? details.Poster : '';
            titleElement.textContent = details.Title;
            ratingElement.textContent = `IMDb: ${details.imdbRating}`;
            yearElement.textContent = details.Year;
            runtimeElement.textContent = details.Runtime;
            plotElement.textContent = details.Plot;

            // Mood Tags (example, needs actual mood mapping)
            moodTagsContainer.innerHTML = '';
            if (details.Genre) {
                details.Genre.split(', ').forEach(genre => {
                    const span = document.createElement('span');
                    span.className = 'mood-tag';
                    span.textContent = genre;
                    moodTagsContainer.appendChild(span);
                });
            }

            // Details section
            detailsContainer.innerHTML = `
                <p><strong>Director:</strong> ${details.Director}</p>
                <p><strong>Writer:</strong> ${details.Writer}</p>
                <p><strong>Actors:</strong> ${details.Actors}</p>
                <p><strong>Awards:</strong> ${details.Awards}</p>
                <p><strong>Language:</strong> ${details.Language}</p>
                <p><strong>Country:</strong> ${details.Country}</p>
                <p><strong>Rated:</strong> ${details.Rated}</p>
                <p><strong>Released:</strong> ${details.Released}</p>
                <p><strong>Box Office:</strong> ${details.BoxOffice}</p>
                <p><strong>Production:</strong> ${details.Production}</p>
                <p><strong>Website:</strong> <a href="${details.Website}" target="_blank">${details.Website}</a></p>
            `;

            // Ratings & Reviews
            ratingsReviewsContainer.innerHTML = '';
            if (details.Ratings && details.Ratings.length > 0) {
                details.Ratings.forEach(rating => {
                    const p = document.createElement('p');
                    p.innerHTML = `<strong>${rating.Source}:</strong> ${rating.Value}`;
                    ratingsReviewsContainer.appendChild(p);
                });
            }

            // Cast (simplified for now, would need more data/carousel logic)
            castCarousel.innerHTML = `<p><strong>Cast:</strong> ${details.Actors}</p>`;

            // Related Titles (placeholder)
            relatedTitlesContainer.innerHTML = '<p>Related titles coming soon...</p>';
        },

        async populateEpisodes(id, seasonNumber) {
            episodeSelect.innerHTML = ''; // Clear previous episodes
            episodesListContainer.innerHTML = '';
            const seasonData = await api.fetchTvShowSeason(id, seasonNumber);
            if (seasonData && seasonData.Response === 'True' && seasonData.Episodes) {
                seasonData.Episodes.forEach(episode => {
                    const option = document.createElement('option');
                    option.value = episode.Episode;
                    option.textContent = `Episode ${episode.Episode}: ${episode.Title}`;
                    episodeSelect.appendChild(option);

                    const episodeDiv = document.createElement('div');
                    episodeDiv.className = 'episode-item';
                    episodeDiv.innerHTML = `
                        <h4>E${episode.Episode}: ${episode.Title}</h4>
                        <p>${episode.Plot}</p>
                    `;
                    episodesListContainer.appendChild(episodeDiv);
                });
                // Set the selected episode to the first one by default
                if (seasonData.Episodes.length > 0) {
                    episodeSelect.value = seasonData.Episodes[0].Episode;
                }
            } else {
                episodesListContainer.innerHTML = '<p>No episodes found for this season.</p>';
            }
        },

        constructVideoUrl(source, id, season = null, episode = null, mediaType) {
            if (mediaType === 'series' && !source.tvUrl) return null;

            let baseUrl = mediaType === 'series' && source.tvUrl ? source.tvUrl : source.url;
            let url = `${baseUrl}${id}`;

            if (mediaType === 'series' && season && episode) {
                if (source.name.includes('VidSrc')) {
                    url = `${baseUrl}${id}/${season}/${episode}`;
                } else if (source.name === 'VidCloud') {
                    url = `${baseUrl}${id}-S${season}-E${episode}.html`;
                } else if (source.name === 'fsapi.xyz') {
                    url = `${baseUrl}${id}-${season}-${episode}`;
                } else if (source.name === '2Embed') {
                    url = `${baseUrl}tv?id=${id}&s=${season}&e=${episode}`;
                } else if (source.name === 'SuperEmbed') {
                    url = `${baseUrl}${id}-${season}-${episode}`;
                } else if (source.name === 'MoviesAPI') {
                    url = `${baseUrl}${id}/season/${season}/episode/${episode}`;
                } else if (source.name === 'Fmovies') {
                    url = `${baseUrl}tv/${id}/season/${season}/episode/${episode}`;
                } else if (source.name === 'LookMovie') {
                    url = `${baseUrl}tv/${id}/season/${season}/episode/${episode}`;
                } else {
                    url = `${baseUrl}${id}-S${season}E${episode}`;
                }
            }
            return url;
        },

        handleModalTabKey: null, // To store the function reference for removal
        trapFocus(modalElement) {
            const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

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

        async loadVideoPlayer(id, type, season = null, episode = null) {
            trailerPlayer.src = '';
            sourceButtonsContainer.innerHTML = '';
            videoAvailabilityStatus.textContent = 'Loading video sources...';
            videoAvailabilityStatus.style.display = 'block';

            console.log('Attempting to display trailer modal.'); // Debug log
            trailerModal.style.display = 'flex';
            lastFocusedElement = document.activeElement; // Save the element that had focus
            trailerModal.focus(); // Set focus to the modal
            this.trapFocus(trailerModal);

            let defaultSource = null;
            if (type === 'movie') {
                defaultSource = videoSources.find(s => s.name === 'VidSrc.to');
            } else if (type === 'series') {
                defaultSource = videoSources.find(s => s.name === 'VidSrc.to' && s.tvUrl);
            }

            const activeSource = defaultSource || videoSources.find(s => (type === 'movie' && s.url) || (type === 'series' && s.tvUrl));

            if (activeSource) {
                const activeUrl = this.constructVideoUrl(activeSource, id, season, episode, type);
                if (activeUrl) {
                    trailerPlayer.src = activeUrl;
                    videoAvailabilityStatus.textContent = `Attempting to load from ${activeSource.name}...`;
                } else {
                    videoAvailabilityStatus.textContent = 'No suitable URL found for the default source.';
                }
            } else {
                videoAvailabilityStatus.textContent = 'No video sources available for this type.';
            }

            for (const source of videoSources) {
                const fullUrl = this.constructVideoUrl(source, id, season, episode, type);
                if (!fullUrl) continue;

                const button = document.createElement('button');
                button.className = 'source-button';
                button.textContent = source.name;
                sourceButtonsContainer.appendChild(button);

                if (source.name === (activeSource && activeSource.name)) {
                    button.classList.add('active');
                }

                button.onclick = () => {
                    trailerPlayer.src = fullUrl;
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

            closeButton.onclick = () => {
                trailerModal.style.display = 'none';
                trailerPlayer.src = ''; // Stop video playback
                if (lastFocusedElement) {
                    lastFocusedElement.focus(); // Return focus to the element that opened the modal
                    lastFocusedElement = null;
                }
                document.removeEventListener('keydown', this.handleModalTabKey);
            };

            window.onclick = (event) => {
                if (event.target === trailerModal) {
                    trailerModal.style.display = 'none';
                    trailerPlayer.src = ''; // Stop video playback
                    if (lastFocusedElement) {
                        lastFocusedElement.focus(); // Return focus to the element that opened the modal
                        lastFocusedElement = null;
                    }
                    document.removeEventListener('keydown', this.handleModalTabKey);
                }
            };
        }
    };

    // --- Initialization ---
    async function initDetailPage() {
        const details = await api.fetchMovieDetails(imdbID);

        if (details && details.Response === 'True') {
            ui.displayMovieDetails(details);

            if (details.Type === 'series') {
                episodesSection.style.display = 'block';
                seasonSelectorContainer.appendChild(seasonSelect);
                episodesListContainer.appendChild(episodeSelect); // Placeholder, episodes will be populated dynamically

                for (let i = 1; i <= parseInt(details.totalSeasons); i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `Season ${i}`;
                    seasonSelect.appendChild(option);
                }

                seasonSelect.addEventListener('change', (event) => {
                    ui.populateEpisodes(imdbID, event.target.value);
                });

                // Populate episodes for the first season by default
                ui.populateEpisodes(imdbID, 1);

                // Add event listener for episode selection change
                episodeSelect.addEventListener('change', () => {
                    document.querySelector('.watch-now').dispatchEvent(new Event('click'));
                });

            }

            // Attach watch now button event listener
            document.querySelector('.watch-now').addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default action to avoid page reload
                const mediaType = details.Type;
                let season = null;
                let episode = null;

                if (mediaType === 'series') {
                    season = seasonSelect.value;
                    episode = episodeSelect.value;
                }
                try {
                    ui.loadVideoPlayer(imdbID, mediaType, season, episode);
                } catch (error) {
                    console.error('Error loading video player:', error);
                }
            });

        } else {
            document.querySelector('main').innerHTML = `<p class="error-message">Could not fetch details for this title: ${details.Error || 'Unknown error.'}</p>`;
        }
    }

    initDetailPage();
});