const apiKey = 'cbee03a4e814c6293d982e903d68ab7a';
const apiUrl = 'https://api.themoviedb.org/3';

const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const watchlistContainer = document.getElementById('watchlist');

searchInput.addEventListener('input', debounce(searchMovies, 300));

window.onload = function() {
    loadWatchlist();
    fetchPopularMovies();
};

function fetchPopularMovies() {
    fetch(`${apiUrl}/movie/popular?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => displayMovies(data.results || []))
        .catch(error => console.error("Error fetching popular movies:", error));
}

function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist.forEach(displayWatchlistItem);
}

function searchMovies() {
	const query = searchInput.value.trim();
	
	if (query.length > 2) {
	    fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`)
		   .then(response => response.json())
		   .then(data => {
			  displaySuggestions(data.results || []);
			  displayMovies(data.results || []);
		   })
		   .catch(error => {
			  console.error("Error fetching data:", error);
			  suggestions.innerHTML = '<li>Error loading suggestions</li>';
		   });
	} else {
	    suggestions.innerHTML = '';
	}
 }

 function displaySuggestions(movies) {
	suggestions.innerHTML = ''; 
	if (movies.length === 0) {
	    suggestions.innerHTML = '<li>No suggestions found</li>';
	    suggestions.style.display = 'block'; 
	    return;
	}
 
	movies.slice(0, 5).forEach(movie => {
	    const li = document.createElement('li');
	    li.textContent = movie.title;
	    li.classList.add('suggestion-item');
	    li.addEventListener('click', () => {
		   displayMovies([movie]);
		   searchInput.value = movie.title; 
		   suggestions.innerHTML = '';
		   suggestions.style.display = 'none'; 
	    });
	    suggestions.appendChild(li);
	});
 
	suggestions.style.display = 'block';
 }
 
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function displayMovies(movies) {
	const moviesGrid = document.getElementById('moviesGrid');
	moviesGrid.innerHTML = '';
	movies.forEach(movie => {
	    let ratingClass = '';
	    const rating = movie.vote_average;
 
	    if (rating >= 7) {
		   ratingClass = 'green';
	    } else if (rating >= 5) {
		   ratingClass = 'orange';
	    } else {
		   ratingClass = 'red';
	    }
 
	    const movieDiv = document.createElement('div');
	    movieDiv.classList.add('movie');
	    movieDiv.innerHTML = `
		   <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">
		   <h3>${movie.title}</h3>
		   <p>Release Date: ${movie.release_date}</p>
		   <p>Rating: <span class="rating ${ratingClass}">${movie.vote_average}</span></p>
		   <button onclick="showMovieDetails(this)" data-id="${movie.id}">More Info</button>
		   <button onclick="addToWatchlist(${movie.id}, '${movie.title}')">Add to Watchlist</button>
	    `;
	    moviesGrid.appendChild(movieDiv);
	});
 }
 

function addToWatchlist(movieId, movieTitle) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist.some(movie => movie.id === movieId)) {
        const newMovie = { id: movieId, title: movieTitle };
        watchlist.push(newMovie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlistItem(newMovie);
        alert(`${movieTitle} added to your watchlist!`);
    } else {
        alert(`${movieTitle} is already in your watchlist.`);
    }
}

function displayWatchlistItem(movie) {
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('watchlist-item');
    movieDiv.setAttribute('data-id', movie.id);
    movieDiv.innerHTML = `
        <h3>${movie.title}</h3>
        <button onclick="removeFromWatchlist(${movie.id})">Remove</button>
    `;
    watchlistContainer.appendChild(movieDiv);
}

function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    const movieDiv = watchlistContainer.querySelector(`.watchlist-item[data-id="${movieId}"]`);
    if (movieDiv) movieDiv.remove();
}

function showMovieDetails(button) {
	const movieId = button.getAttribute('data-id');
 
	fetch(`${apiUrl}/movie/${movieId}?api_key=${apiKey}`)
	    .then(response => response.json())
	    .then(movie => {
		   const movieModal = document.getElementById('movieModal');
		   
		   const genres = movie.genres ? movie.genres.map(genre => genre.name).join(', ') : 'N/A';
		   const posterPath = movie.poster_path ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}` : 'default-poster.jpg'; 
		   const releaseDate = movie.release_date || 'Unknown';
		   const rating = movie.vote_average !== undefined ? `${movie.vote_average} / 10` : 'No rating available';
		   const runtime = movie.runtime ? `${movie.runtime} minutes` : 'Runtime not available';
 
		   movieModal.innerHTML = `
			  <div class="modal_content">
				 <span class="close_button" onclick="closeModal()">&times;</span>
				 <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
				 <div class="movie-details">
					<h2>${movie.title}</h2>
					<p><strong>Release Date:</strong> ${releaseDate}</p>
					<p><strong>Rating:</strong> ${rating}</p>
					<p><strong>Genres:</strong> ${genres}</p>
					<h3>Overview</h3>
					<p>${movie.overview || "No overview available."}</p>
					<h3>Runtime</h3>
					<p>${runtime}</p>
				 </div>
			  </div>
		   `;
		   movieModal.style.display = 'flex';
	    })
	    .catch(error => console.error("Error fetching movie details:", error));
 } 

function closeModal() {
    document.getElementById('movieModal').style.display = 'none';
}
