import fetch from 'node-fetch';

export default async function handler(req, res) {
    const apiKey = process.env.NEWS_API_KEY;
    const { page } = req.query;

    if (!apiKey) {
        console.error('News API key is not configured.');
        return res.status(500).json({ error: 'The server has not been configured to fetch news. This is not a client-side issue.' });
    }

    const url = `https://newsapi.org/v2/everything?q=movie%20OR%20television&apiKey=${apiKey}&language=en&pageSize=6&page=${page || 1}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Forward the error from the News API
            const errorData = await response.json();
            console.error('Error from News API:', errorData);
            return res.status(response.status).json({ error: `Failed to fetch data from News API: ${errorData.message || response.statusText}` });
        }
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'An internal server error occurred while fetching news.' });
    }
}
