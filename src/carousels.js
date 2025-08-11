document.addEventListener('DOMContentLoaded', () => {
    const createCarousel = (containerId, items) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const track = document.createElement('div');
        track.className = 'carousel-track';

        items.forEach(item => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.innerHTML = `
                <div class="movie-card">
                    <div class="movie-card-image-container">
                        <img src="${item.Poster}" alt="${item.Title}">
                        <i class="fas fa-play play-icon" aria-hidden="true"></i>
                    </div>
                    <div class="movie-card-body">
                        <h3 class="movie-card-title">${item.Title}</h3>
                    </div>
                </div>
            `;
            carouselItem.addEventListener('click', () => {
                window.location.href = `detail.html?imdbID=${item.imdbID}`;
            });
            track.appendChild(carouselItem);
        });

        container.appendChild(track);

        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        nav.innerHTML = `
            <button class="prev"><i class="fas fa-chevron-left"></i></button>
            <button class="next"><i class="fas fa-chevron-right"></i></button>
        `;
        container.appendChild(nav);

        const prevButton = nav.querySelector('.prev');
        const nextButton = nav.querySelector('.next');

        prevButton.addEventListener('click', () => {
            track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
        });

        nextButton.addEventListener('click', () => {
            track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
        });

        // Swipe functionality
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        track.addEventListener('touchmove', (e) => {
            touchEndX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', () => {
            const swipeDistance = touchStartX - touchEndX;
            const threshold = 50; // Minimum swipe distance to trigger action

            if (swipeDistance > threshold) {
                // Swiped left (move to next)
                track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
                if (navigator.vibrate) {
                    navigator.vibrate(50); // Haptic feedback
                }
            } else if (swipeDistance < -threshold) {
                // Swiped right (move to previous)
                track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
                if (navigator.vibrate) {
                    navigator.vibrate(50); // Haptic feedback
                }
            }
            // Reset touch positions
            touchStartX = 0;
            touchEndX = 0;
        });

    };

    // --- DUMMY DATA (for now) ---
    const dummyMovies = [
        { imdbID: 'tt0111161', Poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg', Title: 'The Shawshank Redemption' },
        { imdbID: 'tt0068646', Poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', Title: 'The Godfather' },
        { imdbID: 'tt0468569', Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg', Title: 'The Dark Knight' },
        { imdbID: 'tt0071562', Poster: 'https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', Title: 'The Godfather: Part II' },
        { imdbID: 'tt0050083', Poster: 'https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg', Title: '12 Angry Men' },
        { imdbID: 'tt0108052', Poster: 'https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg', Title: 'Schindler\'s List' },
        { imdbID: 'tt0167260', Poster: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', Title: 'The Lord of the Rings: The Return of the King' },
        { imdbID: 'tt0110912', Poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg', Title: 'Pulp Fiction' },
        { imdbID: 'tt0120737', Poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg', Title: 'The Lord of the Rings: The Fellowship of the Ring' },
        { imdbID: 'tt0109830', Poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg', Title: 'Forrest Gump' },
    ];

    createCarousel('mood-matched-carousel', dummyMovies);
    createCarousel('because-you-watched-carousel', dummyMovies.slice().reverse());
    createCarousel('top-10-carousel', dummyMovies);
    createCarousel('originals-carousel', dummyMovies.slice().reverse());
    createCarousel('continue-watching-carousel', dummyMovies);
});
