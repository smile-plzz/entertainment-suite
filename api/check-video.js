
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            const response = await fetch(url, { method: 'HEAD' });
            const available = response.ok;

            if (!response.ok) {
                console.error(`[checkVideoAvailability] Failed to fetch ${url}: Status ${response.status} ${response.statusText}`);
                // Optionally, try to read response body for more details if it's not too large
                try {
                    const errorBody = await response.text();
                    console.error(`[checkVideoAvailability] Response body: ${errorBody}`);
                } catch (bodyError) {
                    console.error(`[checkVideoAvailability] Could not read response body: ${bodyError}`);
                }
            }

            res.status(200).json({ url, available });
        } catch (error) {
            console.error(`[checkVideoAvailability] Error during fetch for ${url}:`, error);
            res.status(200).json({ url, available: false, error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
