# NowShowing

NowShowing is a simple, responsive movie streaming website that allows users to search for movies, view their details, and stream them from various third-party sources.

## Features

*   **Movie Search:** Search for movies and TV shows using the OMDb API.
*   **Movie/TV Show Details:** View titles, overviews, and posters.
*   **Season & Episode Selection:** For TV shows, select specific seasons and episodes to watch.
*   **Multiple Streaming Sources:** Switch between different video sources (VidSrc.to, VidSrc.xyz, VidSrc.in, SuperEmbed, MoviesAPI, 2Embed, Fmovies, LookMovie) for improved reliability, with robust handling for both movies and TV show episodes.
*   **Responsive Design:** Optimized for viewing on desktops, tablets, and mobile devices.
*   **Modern UI/UX:** Clean design with subtle animations and skeleton loading for a smooth user experience.
*   **Video Modal:** Seamless video playback within a modal window with availability indicators.

## Technologies Used

*   **HTML5:** For the website structure.
*   **CSS3:** For styling and responsive design.
*   **JavaScript (ES6+):** For dynamic content, API interactions, and UI logic.
*   **Node.js (Vercel Serverless Function):** For backend video availability checks.
*   **OMDb API:** Used to fetch movie and TV show data (titles, plots, posters, IMDb IDs, season/episode details).
*   **Third-Party Video Embeds:** Integrates with various video embedding services (e.g., VidSrc, SuperEmbed, 2Embed, Fmovies, LookMovie) to stream content.



## Setup and Installation

This project includes a small backend component (a Vercel Serverless Function) to check video source availability. To get started:

1.  **Clone or Download:** Download the project files to your local machine.
2.  **Install Dependencies:** Navigate to the project root in your terminal and run `npm install` to install both frontend and backend dependencies.
3.  **Run Locally (for development with backend):**
    *   Install Vercel CLI: `npm install -g vercel`
    *   **Set OMDb API Key:** Before running, set your OMDb API key as an environment variable. For local development, you can create a `.env` file in your project root with `OMDB_API_KEY=your_omdb_api_key_here`.
    *   From the project root, run `vercel dev` to start a local development server that includes the serverless function.
    *   Open the URL provided by Vercel CLI (e.g., `http://localhost:3000`) in your browser.
4.  **Deploy to Vercel:**
    *   Ensure you have a Vercel account and the Vercel CLI installed and logged in (`vercel login`).
    *   **Set OMDb API Key on Vercel:** Go to your Vercel project dashboard -> Settings -> Environment Variables. Add a new variable named `OMDB_API_KEY` with your OMDb API key as its value.
    *   From the project root, run `vercel deploy`.
    *   Follow the prompts to deploy your project. Vercel will automatically detect the serverless function in the `api` directory.

## Usage

1.  **Search for a Movie:** Use the search bar in the navigation to find a movie. Type the movie title and press Enter or click the search button.
2.  **Browse Popular Movies:** The homepage displays a selection of popular movies.
3.  **Watch a Movie:** Click on a movie card to open the video player modal.
4.  **Switch Sources:** Inside the video player modal, you will see source buttons. Buttons will be colored green if the backend indicates the source is likely available, and red if it's unavailable. All buttons are clickable, allowing you to manually try any source.

## API Key

This project uses the OMDb API to fetch movie data. The API key is now securely handled server-side via a Vercel Serverless Function (`api/omdb-proxy.js`). You must set the `OMDB_API_KEY` environment variable in your Vercel project settings for the application to function correctly.

## Disclaimer

This project relies on third-party video embedding services. The availability and content of streams are dependent on these external services. While a backend check has been implemented to improve reliability, it is still an estimation. Users are advised to be aware of the terms of service and content policies of these third-party providers.

## Future Enhancements

*   **Genre/Category Filtering:** Add options to browse movies by genre or category.
*   **User Accounts:** Implement user authentication and personalized watchlists.
*   **Improved Search:** Add more advanced search filters (e.g., year, director).
*   **More Robust Backend Checks:** Enhance the backend to perform deeper content analysis (e.g., parsing HTML for "unavailable" messages).
*   **Backend Integration:** Develop a more comprehensive backend to manage movie data and user preferences more efficiently.
