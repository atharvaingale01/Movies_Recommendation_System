// static/js/recommend.js

const movieSearchInput = document.getElementById('movie-search');
const autocompleteList = document.getElementById('autocomplete-list');

function fetchMovieSuggestions(searchQuery) {
    const url = `/movie_suggestions?query=${encodeURIComponent(searchQuery)}`;
    return fetch(url)
        .then(response => response.json())
        .catch(error => console.error('Error fetching movie suggestions:', error));
}

function updateAutocompleteList(suggestions) {
    autocompleteList.innerHTML = '';
    const numSuggestionsToShow = 5;
    for (let i = 0; i < numSuggestionsToShow && i < suggestions.length; i++) {
        const movie = suggestions[i];
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'autocomplete-item';
        suggestionItem.textContent = movie;
        suggestionItem.addEventListener('click', function () {
            movieSearchInput.value = movie;
            autocompleteList.innerHTML = ''; // Clear the autocomplete list after selection
        });
        autocompleteList.appendChild(suggestionItem);
    }
    if (suggestions.length > numSuggestionsToShow) {
        const moreOption = document.createElement('div');
        moreOption.className = 'autocomplete-item';
        moreOption.textContent = `+ ${suggestions.length - numSuggestionsToShow} more...`;
        moreOption.addEventListener('click', function () {
            movieSearchInput.value = suggestions[0];
            autocompleteList.innerHTML = ''; // Clear the autocomplete list after selection
        });
        autocompleteList.appendChild(moreOption);
    }
    if (suggestions.length === 0) {
        autocompleteList.style.display = 'none'; // Hide the autocomplete list if there are no suggestions
    } else {
        autocompleteList.style.display = 'block'; // Show the autocomplete list
    }
}

function handleMovieSearch() {
    const searchQuery = movieSearchInput.value;
    if (searchQuery !== '') {
        fetchMovieSuggestions(searchQuery)
            .then(suggestions => {
                updateAutocompleteList(suggestions);
            });
    } else {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none'; // Hide the autocomplete list if the search query is empty
    }
}

movieSearchInput.addEventListener('input', handleMovieSearch);


function getRecommendations() {
    const selectedMovie = movieSearchInput.value; // Use the value from the search bar

    if (selectedMovie !== '') {
        fetch('/get_recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selected_movie: selectedMovie })
        })
        .then(response => response.json())
        .then(data => {
            displayRecommendations(data);
        })
        .catch(error => console.error('Error:', error));
    }
}

function displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations-container');
    recommendationsContainer.innerHTML = '';

    recommendations.forEach(movie => {
        const movieContainer = document.createElement('div');
        movieContainer.className = 'movie-container';

        const movieImage = document.createElement('img');
        movieImage.src = movie.image_url;
        movieImage.alt = movie.title;

        const movieTitle = document.createElement('p');
        movieTitle.textContent = movie.title;

        movieContainer.appendChild(movieImage);
        movieContainer.appendChild(movieTitle);

        recommendationsContainer.appendChild(movieContainer);
    });
}




