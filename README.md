# Entertainment Suite

Entertainment Suite is a simple, responsive movie streaming website that allows users to search for movies, view their details, and stream them from various third-party sources. It also includes a mood-based recommendation feature to help users discover new content.

## Features

*   **Movie Search:** Search for movies and TV shows using the OMDb API.
*   **Mood-Based Recommendations:** Get movie recommendations based on your current mood.
*   **Movie/TV Show Details:** View titles, overviews, and posters.
*   **Season & Episode Selection:** For TV shows, select specific seasons and episodes to watch.
*   **Multiple Streaming Sources:** Switch between different video sources for improved reliability.
*   **Responsive Design:** Optimized for viewing on desktops, tablets, and mobile devices.
*   **Modern UI/UX:** A dark-mode-first design with subtle animations and a dynamic hero section.

*   **News Widget:** Stay updated with the latest movie and TV show news from GNews API.
*   **Video Modal:** Seamless video playback within a modal window with availability indicators and comprehensive details.
*   **Accessibility Enhancements:** Improved keyboard navigation, focus management for modals, and added ARIA attributes for better screen reader compatibility.

## Technologies Used

*   **HTML5:** For the website structure.
*   **CSS3:** For styling and responsive design.
*   **JavaScript (ES6+):** For dynamic content, API interactions, and UI logic.
*   **Node.js (Vercel Serverless Functions):** For backend video availability checks, news fetching, and as a proxy for the OMDb API.
*   **OMDb API:** Used to fetch movie and TV show data.

*   **GNews API:** Used to fetch news articles.
*   **Third-Party Video Embeds:** Integrates with various video embedding services to stream content.

## Setup and Installation

This project includes a small backend component (a Vercel Serverless Function) to check video source availability. To get started:

1.  **Clone or Download:** Download the project files to your local machine.
2.  **Install Dependencies:** Navigate to the project root in your terminal and run `npm install`.
3.  **Testing:**
    *   This project uses Jest for testing. The configuration is in `jest.config.cjs` and Babel configuration in `babel.config.cjs`.
    *   Run tests using `npm test`.
4.  **Run Locally (for development with backend):**
    *   Install Vercel CLI: `npm install -g vercel`
    *   **Set OMDb API Key & GNews API Key:** Before running, set your OMDb API key and GNews API key as environment variables. For local development, you can create a `.env` file in your project root with `OMDB_API_KEY=your_omdb_api_key_here` and `GNEWS_API_KEY=your_gnews_api_key_here`.
    *   From the project root, run `vercel dev` to start a local development server.
    *   Open the URL provided by Vercel CLI (e.g., `http://localhost:3000`) in your browser.
5.  **Deploy to Vercel:**
    *   Ensure you have a Vercel account and the Vercel CLI installed and logged in (`vercel login`).
    *   **Set OMDb API Key & GNews API Key on Vercel:** Go to your Vercel project dashboard -> Settings -> Environment Variables. Add new variables named `OMDB_API_KEY` and `GNEWS_API_KEY` with your respective API keys as their values.
    *   From the project root, run `vercel deploy`.

## Additional Documentation

*   **API Documentation:** Detailed information on the serverless functions and their usage can be found in [API.md](api/API.md).
*   **Troubleshooting Guide:** For common issues and their solutions, please refer to the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.
*   **Development Log:** A log of the development process can be found in [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).
*   **UI/UX Development Track:** A log of the UI/UX development process can be found in [UI_UX_DEVELOPMENT_TRACK.md](UI_UX_DEVELOPMENT_TRACK.md).
*   **Platform Outline:** The high-level design and feature roadmap can be found in [platform-outline.markdown](platform-outline.markdown).
