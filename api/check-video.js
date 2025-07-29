
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Temporarily return true to check if the Vercel function is working
        res.status(200).json({ url, available: true });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
