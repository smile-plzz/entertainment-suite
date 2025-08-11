export const videoSources = [
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

export const api = {
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
            let url = `/api/omdb-proxy?title=${encodeURIComponent(title)}`;
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
            const url = `/api/omdb-proxy?imdbID=${imdbID}&plot=full`;
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
            let url = `/api/omdb-proxy?s=${encodeURIComponent(query)}&page=${page}`;
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
            const url = `/api/omdb-proxy?imdbID=${imdbID}&seasonNumber=${seasonNumber}`;
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
    async fetchOmdbMovieDetailsMood(imdbID, title, year) {
        let url = '/api/omdb-proxy?type=movie';
        if (imdbID) {
            url += `&imdbID=${imdbID}`;
        } else if (title) {
            url += `&title=${encodeURIComponent(title)}`;
            if (year) {
                url += `&y=${year}`;
            }
        } else {
            console.warn('No IMDb ID or title provided for OMDB search.');
            return null;
        }

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.Response === "True") {
                return data;
            } else {
                console.warn(`OMDB search failed for ${imdbID || title}:`, data.Error);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching from OMDB proxy for ${imdbID || title}:`, error);
            return null;
        }
    },
    async fetchNews(page = 1) {
        const url = `/api/fetch-news?page=${page}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            return { error: error.message };
        }
    },

    async fetchPopularMovies(page = 1) {
        return this.fetchMoviesBySearch('popular', page);
    },
};