
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
                const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeoutId);

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
                clearTimeout(timeoutId);
                console.error(`[checkVideoAvailability] Error during fetch for ${url}: ${error.name} - ${error.message}`);
                res.status(200).json({ url, available: false, error: `Network error: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
