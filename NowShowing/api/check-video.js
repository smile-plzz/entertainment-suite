
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            // Attempt to fetch the URL
            const response = await fetch(url, { method: 'HEAD' }); // Use HEAD request for efficiency

            // Check if the response status indicates success (2xx)
            // This is a basic check; it doesn't guarantee playable video content
            const available = response.ok; 

            res.status(200).json({ url, available });
        } catch (error) {
            console.error('Error checking video URL:', error);
            res.status(200).json({ url, available: false, error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
