import fetch from 'node-fetch';

export default async function (req, res) {
    const { imdbID, title, type, s, page, seasonNumber } = req.query;
    const OMDB_API_KEY = process.env.OMDB_API_KEY;

    if (!OMDB_API_KEY) {
        return res.status(500).json({ error: 'OMDB_API_KEY is not set in environment variables.' });
    }

    let url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

    if (imdbID) {
        url += `&i=${imdbID}`;
    } else if (title) {
        url += `&t=${title}`;
    } else if (s) {
        url += `&s=${s}`;
    }

    if (type) {
        url += `&type=${type}`;
    }
    if (page) {
        url += `&page=${page}`;
    }
    if (seasonNumber) {
        url += `&Season=${seasonNumber}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Error proxying OMDb API request:', error);
        res.status(500).json({ error: 'Failed to fetch data from OMDb API.' });
    }
}
