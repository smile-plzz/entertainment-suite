document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const loadMoreNewsButton = document.getElementById('load-more-news');
    const categoryButtons = document.querySelectorAll('.category-button');

    let newsPage = 1;

    const api = {
        async fetchNews(page = 1) {
            const url = `/api/fetch-news?page=\${page}`;
            try {
                const response = await fetch(url);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }
                return data;
            } catch (error) {
                console.error('Error fetching news:', error);
                return { error: error.message };
            }
        }
    };

    const ui = {
        renderNews(articles, append = false) {
            if (!append) {
                newsGrid.innerHTML = '';
            }

            if (articles && articles.length > 0) {
                articles.forEach(article => {
                    const newsCard = document.createElement('a');
                    newsCard.className = 'col-12 col-md-6 col-lg-4 news-card';
                    newsCard.href = article.url;
                    newsCard.target = '_blank';

                    newsCard.innerHTML = `
                        <img src="\${article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="\${article.title}">
                        <div class="news-card-body">
                            <h3 class="news-card-title">\${article.title}</h3>
                            <p class="news-card-source">\${article.source.name}</p>
                            <p class="news-card-description">\${article.description || ''}</p>
                        </div>
                    `;
                    newsGrid.appendChild(newsCard);
                });
            } else if (!append) {
                newsGrid.innerHTML = '<p class="error-message">No news articles found.</p>';
            }
        },

        async loadNews(append = false) {
            const data = await api.fetchNews(newsPage);
            if (data.articles) {
                ui.renderNews(data.articles, append);
                if (newsPage * 6 < data.totalResults) { // Assuming 6 articles per page from API
                    loadMoreNewsButton.style.display = 'block';
                } else {
                    loadMoreNewsButton.style.display = 'none';
                }
            } else {
                newsGrid.innerHTML = `<p class="error-message">Could not load news: \${data.error}. Please try again later.</p>`;
                loadMoreNewsButton.style.display = 'none';
            }
        }
    };

    // --- Event Listeners ---
    loadMoreNewsButton.addEventListener('click', () => {
        newsPage++;
        ui.loadNews(true);
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            // Implement category filtering logic here if needed
            // For now, just reload all news
            newsPage = 1;
            ui.loadNews();
        });
    });

    // Initial load
    ui.loadNews();
});
