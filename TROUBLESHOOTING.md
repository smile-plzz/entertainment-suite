# NowShowing Troubleshooting Guide

This guide provides solutions to common issues you might encounter while using or developing the NowShowing application.

## 1. Video Playback Issues (Continuous Reloading, Not Loading, Black Screen)

**Problem:** The video player in the modal is continuously reloading, showing a black screen, or not loading the stream at all.

**Reason:** This is almost always due to the aggressive nature of third-party video embed services. They often employ tactics like ad injection, redirects, or anti-bot measures that are blocked by browsers (especially with ad blockers), leading to playback failures.

**Solutions:**

*   **Try Other Sources:** Inside the video modal, click the different source buttons below the video player. Green buttons indicate sources that are likely available, but sometimes a red (unavailable) source might still work, or vice-versa. Experiment with all available options.
*   **Disable Ad Blocker (Temporarily):** If you are using an ad blocker (e.g., uBlock Origin, AdBlock Plus), try temporarily disabling it for `nowshowing-app.vercel.app` (or your local development URL) and then reloading the page. Ad blockers can sometimes interfere with legitimate video embeds.
*   **Use Brave Browser:** NowShowing is optimized for Brave Browser. Brave has built-in ad and tracker blocking that handles many of these third-party embed issues more gracefully, often providing a smoother and more reliable streaming experience.
*   **Check Your Internet Connection:** Ensure you have a stable and reasonably fast internet connection.
*   **Clear Browser Cache:** Sometimes old cached data can cause conflicts. Try clearing your browser's cache and cookies.

## 2. API Key Not Set (500 Internal Server Error for OMDb or GNews)

**Problem:** You see 500 Internal Server Errors in the console or network tab when the application tries to fetch movie data (OMDb) or news (GNews).

**Reason:** This typically means that the required API keys (`OMDB_API_KEY` or `GNEWS_API_KEY`) are not correctly set as environment variables in your Vercel project settings (for deployment) or in your local `.env` file (for local development).

**Solutions:**

*   **For Local Development:**
    1.  Create a file named `.env` in the root directory of your project.
    2.  Add your API keys to this file:
        ```
        OMDB_API_KEY=your_omdb_api_key_here
        GNEWS_API_KEY=your_gnews_api_key_here
        ```
    3.  Replace `your_omdb_api_key_here` and `your_gnews_api_key_here` with your actual API keys.
    4.  Restart your local development server (`vercel dev`).
*   **For Vercel Deployment:**
    1.  Go to your Vercel project dashboard.
    2.  Navigate to **Settings** > **Environment Variables**.
    3.  Add new environment variables named `OMDB_API_KEY` and `GNEWS_API_KEY` with their respective values.
    4.  Redeploy your project for the changes to take effect.

## 3. Jest Testing Errors (`ReferenceError: module is not defined`, `SyntaxError: Unexpected token`)

**Problem:** Jest tests fail with module-related errors.

**Reason:** This often occurs due to conflicts between ES Modules (ESM) and CommonJS (CJS) syntax in Node.js environments, especially when using Babel for transpilation.

**Solution:** Ensure your Jest and Babel configuration files are correctly named and configured:

*   **`jest.config.cjs`:** Jest configuration should be in a `.cjs` file to explicitly use CommonJS syntax (`module.exports`).
*   **`babel.config.cjs`:** Babel configuration should also be in a `.cjs` file for consistency and proper module resolution.

These files should contain:

*   **`jest.config.cjs`:**
    ```javascript
    module.exports = {
      testEnvironment: 'node',
      transform: {
        '^.+\.js$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!node-fetch)/',
      ],
    };
    ```
*   **`babel.config.cjs`:**
    ```javascript
    module.exports = {
      presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
    };
    ```

If you encounter these errors, verify these file names and their contents.
