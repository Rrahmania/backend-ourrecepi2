import axios from 'axios';

const API = 'http://localhost:5010/api';

const main = async () => {
  try {
    // Login seed user
    const loginRes = await axios.post(`${API}/auth/login`, {
      identifier: 'seed_user',
      password: 'password123',
    });

    console.log('Login response status:', loginRes.status);
    const token = loginRes.data.token;
    console.log('Token length:', token?.length || 0);

    // Get recipes
    const recipesRes = await axios.get(`${API}/recipes`);
    console.log('GET /recipes status:', recipesRes.status);
    console.log('Recipes count:', recipesRes.data?.recipes?.length || 0);

    const recipe = recipesRes.data.recipes?.[0];
    if (!recipe) {
      console.log('No recipe found to favorite');
      return;
    }

    // Add favorite
    const favRes = await axios.post(
      `${API}/favorites`,
      { recipeId: recipe.id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('POST /favorites status:', favRes.status);

    // Get favorites
    const myFavs = await axios.get(`${API}/favorites`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('GET /favorites status:', myFavs.status);
    console.log('Favorites count:', myFavs.data?.favorites?.length || 0);
  } catch (err) {
    if (err.response) {
      console.error('API error', err.response.status, err.response.data);
    } else {
      console.error('Error', err.message);
    }
    process.exit(1);
  }
};

main();
