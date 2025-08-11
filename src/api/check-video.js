import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            // Attempt to fetch the URL without AbortController for now
            const response = await fetch(url, {
                method: 'HEAD',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NowShowing/1.0)'
                }
            });

            const available = response.ok;

            res.status(200).json({ url, available });
        } catch (error) {
            console.error(`[checkVideoAvailability] Error during fetch for ${url}: ${error.message}`);
            res.status(200).json({ url, available: false, error: `Network error: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}