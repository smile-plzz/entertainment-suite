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

This project is a client-side only application and does not require any complex setup or server. To get started:

1.  **Clone or Download:** Download the project files to your local machine.
2.  **Open `index.html`:** Simply open the `index.html` file in your preferred web browser.

## Usage

1.  **Search for a Movie:** Use the search bar in the navigation to find a movie. Type the movie title and press Enter or click the search button.
2.  **Browse Popular Movies:** The homepage displays a selection of popular movies.
3.  **Watch a Movie:** Click on a movie card or the "Watch Now" button in the hero section to open the video player modal.
4.  **Switch Sources:** Inside the video player modal, if a video fails to load or play, you can click on the different source buttons (e.g., "VidSrc.to", "SuperEmbed") to try an alternative streaming source.

## API Key

This project uses the OMDb API to fetch movie data. Your API key (`1a944117`) is embedded directly in the `app.js` file:

```javascript
const apiKey = '1a944117';
```

If you wish to use a different OMDb API key, you can replace this value in `app.js`.

## Disclaimer

This project relies on third-party video embedding services. The availability and content of streams are dependent on these external services. Users are advised to be aware of the terms of service and content policies of these third-party providers.

## Future Enhancements

*   **Genre/Category Filtering:** Add options to browse movies by genre or category.
*   **User Accounts:** Implement user authentication and personalized watchlists.
*   **Improved Search:** Add more advanced search filters (e.g., year, director).
*   **Error Handling:** More robust error handling for API requests and video loading.
*   **Backend Integration:** Develop a backend to manage movie data and user preferences more efficiently.
