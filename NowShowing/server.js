const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json()); // Use express.json() for parsing JSON body

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the API route (this will need to be run separately or proxied to Vercel)
// For local development, you would typically run `vercel dev` in parallel
// or implement the API logic directly here.
app.post('/api/check-video', async (req, res) => {
  // In a real scenario, you'd import and run your check-video.js logic here
  // or proxy to a running vercel dev instance.
  // For now, we'll return a dummy response to unblock the frontend.
  console.log('Received API request for /api/check-video', req.body.url);
  // Simulate a delay for network request
  await new Promise(resolve => setTimeout(resolve, 500)); 
  // For local testing, always return true for availability
  res.json({ url: req.body.url, available: true }); 
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});