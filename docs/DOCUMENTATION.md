# Entertainment Suite Documentation

## Overview

Entertainment Suite is a web application that combines the features of two previous projects: `MovieRecommendationBasedOnMood` and `NowShowing`. It allows users to discover movies and TV shows through direct search or mood-based recommendations, and then view details and stream them from various third-party sources.

## Features

*   **Movie & TV Show Search:** Search for movies and TV shows using the OMDb API.
*   **Mood-Based Recommendations:** Get movie recommendations based on your current mood.
*   **Movie/TV Show Details Page:** View titles, overviews, posters, and other details on a dedicated page (`detail.html`).
*   **Streaming:** Stream movies and TV shows from multiple third-party sources using the **Watch Now** button on the `detail.html` page.
*   **News Widget:** Stay updated with the latest movie and TV show news from the GNews API.
*   **Responsive Design:** Optimized for viewing on desktops, tablets, and mobile devices, with a consistent and adaptive layout.
*   **Modern UI/UX:** A dark-mode-first design with a refined visual language, utilizing CSS variables for cohesive styling, subtle animations, and a dynamic hero section.

## Tech Stack

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js (Vercel Serverless Functions)
*   **APIs:**
    *   OMDb API (for movie and TV show data)
    *   GNews API (for news)
    *   Third-party video embedding services (for streaming)

## Setup and Installation

1.  **Clone or Download:** Download the project files to your local machine.
2.  **Install Dependencies:** Navigate to the project root in your terminal and run `npm install`.
3.  **Set Environment Variables:** Create a `.env` file in the project root and add your OMDb and GNews API keys:
    ```
    OMDB_API_KEY=your_omdb_api_key_here
    GNEWS_API_KEY=your_gnews_api_key_here
    ```
4.  **Run Locally:** Run `vercel dev` to start a local development server.
5.  **Deploy to Vercel:**
    *   Set the `OMDB_API_KEY` and `GNEWS_API_KEY` environment variables in your Vercel project settings.
    *   Run `vercel deploy` to deploy the project.

    **Important Vercel Configuration:**
    Due to Vercel's default routing behavior, all static assets (HTML, CSS, JS files) must be explicitly listed in the `builds` and `routes` sections of `vercel.json` to ensure they are served correctly. If new static files are added, they must be added to `vercel.json`.

    **Note on Video Background:**
    The ambient video background on the homepage (`index.html`) using a Pexels video has been removed due to a 403 Forbidden error when deployed. If you wish to re-enable a video background, you will need to source a new video and update `index.html` accordingly.

## Additional Documentation

*   **API Documentation:** Detailed information on the serverless functions and their usage can be found in [API.md](api/API.md).
*   **Troubleshooting Guide:** For common issues and their solutions, please refer to the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide.
*   **Development Log:** A log of the development process can be found in [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).
*   **UI/UX Development Track:** A log of the UI/UX development process can be found in [UI_UX_DEVELOPMENT_TRACK.md](UI_UX_DEVELOPMENT_TRACK.md).
*   **Platform Outline:** The high-level design and feature roadmap can be found in [platform-outline.markdown](platform-outline.markdown).
*   **News Section:** Detailed information on the news section integration can be found in [UI_UX_DEVELOPMENT_TRACK.md#news-section-integration-new](UI_UX_DEVELOPMENT_TRACK.md#news-section-integration-new).