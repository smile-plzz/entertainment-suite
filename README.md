# NowShowing

NowShowing is a simple, responsive movie streaming website that allows users to search for movies, view their details, and stream them from various third-party sources.

## Features

*   **Movie Search:** Search for movies using the OMDb API.
*   **Movie Details:** View movie titles, overviews, and posters.
*   **Multiple Streaming Sources:** Switch between different video sources (VidSrc.to, VidSrc.xyz, VidSrc.in, SuperEmbed, MoviesAPI, 2Embed) for improved reliability.
*   **Responsive Design:** Optimized for viewing on desktops, tablets, and mobile devices.
*   **Modern UI/UX:** Clean design with subtle animations and skeleton loading for a smooth user experience.
*   **Video Modal:** Seamless video playback within a modal window.

## Technologies Used

*   **HTML5:** For the website structure.
*   **CSS3:** For styling and responsive design.
*   **JavaScript (ES6+):** For dynamic content, API interactions, and UI logic.
*   **OMDb API:** Used to fetch movie data (titles, plots, posters, IMDb IDs).
*   **Third-Party Video Embeds:** Integrates with various video embedding services (e.g., VidSrc, SuperEmbed, 2Embed) to stream content.

## Setup and Installation

This project now includes a small backend component (a Vercel Serverless Function) to check video source availability. To get started:

1.  **Clone or Download:** Download the project files to your local machine.
2.  **Install Dependencies (Backend):** Navigate to the project root in your terminal and run `npm install node-fetch` to install the necessary dependency for the serverless function.
3.  **Run Locally (Optional - for development with backend):**
    *   Install Vercel CLI: `npm install -g vercel`
    *   From the project root, run `vercel dev` to start a local development server that includes the serverless function.
    *   Open `http://localhost:3000` (or the port indicated by Vercel CLI) in your browser.
4.  **Deploy to Vercel:**
    *   Ensure you have a Vercel account and the Vercel CLI installed and logged in (`vercel login`).
    *   From the project root, run `vercel deploy`.
    *   Follow the prompts to deploy your project. Vercel will automatically detect the serverless function in the `api` directory.
5.  **Open `index.html` (Client-side only):** If you only want to run the client-side without the backend availability checks, simply open the `index.html` file in your preferred web browser. Note that the video source availability indicators will not function without the backend.

## Usage

1.  **Search for a Movie:** Use the search bar in the navigation to find a movie. Type the movie title and press Enter or click the search button.
2.  **Browse Popular Movies:** The homepage displays a selection of popular movies.
3.  **Watch a Movie:** Click on a movie card to open the video player modal.
4.  **Switch Sources:** Inside the video player modal, you will see source buttons. Buttons will be colored green if the backend indicates the source is likely available, and red if it's unavailable. Click on different source buttons (e.g., "VidSrc.to", "SuperEmbed") to try alternative streaming sources. Disabled (red) buttons cannot be clicked.

## API Key

This project uses the OMDb API to fetch movie data. Your API key (`1a944117`) is embedded directly in the `app.js` file:

```javascript
const apiKey = '1a944117';
```

If you wish to use a different OMDb API key, you can replace this value in `app.js`.

## Disclaimer

This project relies on third-party video embedding services. The availability and content of streams are dependent on these external services. While a backend check has been implemented to improve reliability, it is still an estimation. Users are advised to be aware of the terms of service and content policies of these third-party providers.

## Future Enhancements

*   **Genre/Category Filtering:** Add options to browse movies by genre or category.
*   **User Accounts:** Implement user authentication and personalized watchlists.
*   **Improved Search:** Add more advanced search filters (e.g., year, director).
*   **More Robust Backend Checks:** Enhance the backend to perform deeper content analysis (e.g., parsing HTML for "unavailable" messages).
*   **Backend Integration:** Develop a more comprehensive backend to manage movie data and user preferences more efficiently.
