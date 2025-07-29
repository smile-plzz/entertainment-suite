
import fetch from 'node-fetch';

// Ensure fetch is correctly polyfilled for older Node.js versions if necessary
// This line might not be needed if Vercel's Node.js runtime has native fetch
// global.fetch = global.fetch || require('node-fetch');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            try {
                const response = await fetch(url, {
                    method: 'HEAD',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; NowShowing/1.0)' // Add a User-Agent header
                    }
                });

                if (!response.ok) {
                    console.error(`[checkVideoAvailability] Failed to fetch ${url}: Status ${response.status} ${response.statusText}`);
                    // Attempt to read response body for more details if it's not too large
                    try {
                        const errorBody = await response.text();
                        console.error(`[checkVideoAvailability] Response body: ${errorBody.substring(0, 200)}`); // Limit body to 200 chars
                    } catch (bodyError) {
                        console.error(`[checkVideoAvailability] Could not read response body: ${bodyError.message}`);
                    }
                    return res.status(200).json({ url, available: false, error: `HTTP error: ${response.status} ${response.statusText}` });
                }

                res.status(200).json({ url, available: response.ok });
            } catch (error) {
                console.error(`[checkVideoAvailability] Error during fetch for ${url}: ${error.name} - ${error.message}`);
                res.status(200).json({ url, available: false, error: `Network error: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
