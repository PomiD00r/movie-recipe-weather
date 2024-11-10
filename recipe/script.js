const apiKey = 'b1da44980b4442e4b102d7c67852d568';
const apiUrl = 'https://api.spoonacular.com/recipes/complexSearch';
const randomRecipeUrl = `https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`;

const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const searchButton = document.querySelector('header .header_top button');

searchInput.addEventListener('input', debounce(searchRecipe, 300));
searchButton.addEventListener('click', () => {
    suggestions.style.display = 'block'; 
    searchRecipe(true);
});

window.onload = function() {
    loadWatchlist();
    fetchRandomRecipes(); 
};

function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (watchlist.length > 0) {
        watchlist.forEach(recipe => {
            displayRecipe([recipe]);
        });
    }
}

function fetchRandomRecipes() {
    fetch(randomRecipeUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            displayRecipe(data.recipes || []);
        })
        .catch(error => {
            console.error("Error fetching random recipes:", error);
        });
}

function searchRecipe(fromButtonClick = false) {
	const query = searchInput.value.trim();
	
	if (query.length > 2 || fromButtonClick) {
	    fetch(`${apiUrl}?query=${query}&apiKey=${apiKey}`)
		   .then(response => {
			  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
			  return response.json();
		   })
		   .then(data => {
			  displaySuggestions(data.results || [], fromButtonClick);
			  displayRecipe(data.results || []);
		   })
		   .catch(error => {
			  console.error("Error fetching data:", error);
		   });
	} else {
	    suggestions.style.display = 'none';
	    displayRecipe([]);
	}
 }
 

 function displaySuggestions(recipes) {
	suggestions.innerHTML = '';
 
	if (recipes.length === 0) {
	    suggestions.innerHTML = '<li>No suggestions found</li>';
	    suggestions.style.display = 'block'; 
	    return;
	}
 
	recipes.slice(0, 5).forEach(recipe => {
	    const li = document.createElement('li');
	    li.textContent = recipe.title;
	    li.classList.add('suggestion-item');
 
	    li.addEventListener('click', () => {
		   displayRecipe([recipe]);
		   searchInput.value = recipe.title;
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

function displayRecipe(recipes) {
    const recipeGrid = document.getElementById('recipeGrid');
    recipeGrid.innerHTML = '';
    if (recipes.length > 0) {
        recipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');
            recipeDiv.innerHTML = `
                <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
                <h3>${recipe.title}</h3>
            `;
            recipeDiv.addEventListener('click', () => openRecipeModal(recipe.id));
            recipeGrid.appendChild(recipeDiv);
        });
    } else {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'No recipes found. Please try a different search.';
        recipeGrid.appendChild(noResultsMessage);
    }
}

function openRecipeModal(recipeId) {
	const apiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
	fetch(apiUrl)
	    .then(response => response.json())
	    .then(data => {
		   displayRecipeModal(data);
		   fetchSimilarRecipes(recipeId);
	    })
	    .catch(error => console.error("Error fetching recipe details: ", error));
 }

 function fetchSimilarRecipes(recipeId) {
	const similarRecipesUrl = `https://api.spoonacular.com/recipes/${recipeId}/similar?apiKey=${apiKey}&number=5`;
	fetch(similarRecipesUrl)
	    .then(response => response.json())
	    .then(data => {
		   displaySimilarRecipes(data);
	    })
	    .catch(error => console.error("Error fetching similar recipes:", error));
 }
 function displayRecipeModal(recipe) {
	const modal = document.getElementById('recipeModal');
	const modalContent = `
	    <div class="modal_content">
		   <span class="close_button" onclick="closeRecipeModal()">&times;</span>
		   <h2>${recipe.title}</h2>
		   <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
		   
		   <h3>Ingredients</h3>
		   <ul>
			  ${recipe.extendedIngredients.map(ingredient => `
				 <li>${ingredient.amount} ${ingredient.unit} ${ingredient.name}</li>
			  `).join('')}
		   </ul>
		   
		   <h3>Instructions</h3>
		   <p>${recipe.instructions || "No instructions available."}</p>
		   
		   <h3>Nutritional Information</h3>
		   <p>Calories: ${recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || "N/A"} kcal</p>
		   <p>Protein: ${recipe.nutrition?.nutrients?.find(n => n.name === "Protein")?.amount || "N/A"} g</p>
		   <p>Fat: ${recipe.nutrition?.nutrients?.find(n => n.name === "Fat")?.amount || "N/A"} g</p>
		   
		   <h3>Similar Recipes</h3>
		   <div id="similarRecipesGrid"></div> <!-- Add a grid for similar recipes -->
	    </div>
	`;
	modal.innerHTML = modalContent;
	modal.style.display = 'flex';
 }

 function displaySimilarRecipes(recipes) {
	const similarRecipesGrid = document.getElementById('similarRecipesGrid');
	similarRecipesGrid.innerHTML = '';
 
	if (recipes.length > 0) {
	    recipes.forEach(recipe => {
		   const recipeDiv = document.createElement('div');
		   recipeDiv.classList.add('recipe');
		   recipeDiv.innerHTML = `
			  <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
			  <h3>${recipe.title}</h3>
		   `;
		   recipeDiv.addEventListener('click', () => openRecipeModal(recipe.id));
		   similarRecipesGrid.appendChild(recipeDiv);
	    });
	} else {
	    const noSimilarResultsMessage = document.createElement('p');
	    noSimilarResultsMessage.textContent = 'No similar recipes found.';
	    similarRecipesGrid.appendChild(noSimilarResultsMessage);
	}
 }
 
 

function closeRecipeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}
