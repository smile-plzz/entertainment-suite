# API Documentation for NowShowing Serverless Functions

This document outlines the API endpoints provided by the Vercel Serverless Functions used in the NowShowing application. These endpoints handle sensitive operations and external API calls, abstracting them from the client-side.

## 1. Video Availability Check API

Checks the availability of a given video URL.

*   **Endpoint:** `/api/check-video`
*   **Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
        "url": "string" // The URL of the video to check (e.g., an embed URL)
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
        "url": "string",     // The URL that was checked
        "available": boolean // `true` if the video is likely available, `false` otherwise
    }
    ```
*   **Error Responses:**
    *   **400 Bad Request:**
        ```json
        {
            "error": "URL is required"
        }
        ```
        (Occurs if `url` is missing from the request body)
    *   **200 OK (with error in body):**
        ```json
        {
            "url": "string",
            "available": false,
            "error": "Network error: [details]" // Details about the network error during fetch
        }
        ```
        (Occurs if there's a network issue when trying to reach the video URL)
    *   **405 Method Not Allowed:**
        ```json
        {
            "error": "Method Not Allowed"
        }
        ```
        (Occurs if the request method is not `POST`)

## 2. News Fetch API

Fetches news articles related to movies and TV shows.

*   **Endpoint:** `/api/fetch-news`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `page`: `number` (Optional) - The page number of news articles to fetch. Defaults to 1.
*   **Success Response (200 OK):**
    ```json
    {
        "articles": [
            {
                "title": "string",
                "url": "string",
                "urlToImage": "string", // URL to the article's image (can be empty)
                "source": {
                    "name": "string" // Name of the news source
                }
            }
            // ... more articles
        ],
        "totalResults": number // Total number of articles available (subject to GNews API free tier limitations)
    }
    ```
*   **Error Responses:**
    *   **200 OK (with error in body):**
        ```json
        {
            "error": "string" // Details about the error from the GNews API or proxy
        }
        ```
        (Occurs if the GNews API returns an error or there's an issue with the proxy)

## 3. OMDb Proxy API


Proxies requests to the OMDb API to protect the API key from client-side exposure.

*   **Endpoint:** `/api/omdb-proxy`
*   **Method:** `GET`
*   **Query Parameters (one of `imdbID`, `title`, or `s` is required):**
    *   `imdbID`: `string` (Optional) - The IMDb ID of the movie/series (e.g., `tt1234567`).
    *   `title`: `string` (Optional) - The title of the movie/series (e.g., `Inception`).
    *   `s`: `string` (Optional) - Search query for movies/series (e.g., `matrix`).
    *   `type`: `string` (Optional) - Type of result to return (`movie`, `series`, `episode`).
    *   `page`: `number` (Optional) - Page number for search results.
    *   `seasonNumber`: `number` (Optional) - Season number for TV series details.
*   **Success Response (200 OK):**
    (Returns the raw JSON response directly from the OMDb API. Refer to [OMDb API Documentation](http://www.omdbapi.com/) for full response schemas.)
    Example (Movie Details):
    ```json
    {
        "Title": "Inception",
        "Year": "2010",
        "Rated": "PG-13",
        "Released": "16 Jul 2010",
        // ... more fields
        "Response": "True"
    }
    ```
*   **Error Responses:**
    *   **500 Internal Server Error:**
        ```json
        {
            "error": "OMDB_API_KEY is not set in environment variables."
        }
        ```
        (Occurs if the `OMDB_API_KEY` is not configured on the server)
    *   **500 Internal Server Error:**
        ```json
        {
            "error": "Failed to fetch data from OMDb API."
        }
        ```
        (Occurs if there's a network issue or other problem when the proxy tries to reach the OMDb API)
    *   **200 OK (with OMDb error in body):**
        (Returns the error response directly from the OMDb API)
        Example:
        ```json
        {
            "Response": "False",
            "Error": "Movie not found!"
        }
        ```
