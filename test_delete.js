import axios from 'axios';

const base = 'http://localhost:5010';

(async () => {
  try {
    const unique = Date.now();
    const user = {
      name: `testuser_${unique}`,
      email: `test_${unique}@example.com`,
      password: 'password123'
    };

    console.log('Registering user...');
    const reg = await axios.post(`${base}/api/auth/register`, user);
    const token = reg.data.token || (reg.data.user && reg.data.user.token);
    if (!token) {
      console.error('No token returned from register', reg.data);
      process.exit(1);
    }

    console.log('Token received. Creating recipe...');
    const recipeBody = {
      title: 'Test Recipe ' + unique,
      description: 'A recipe for testing delete',
      category: 'Test',
      ingredients: ['1 cup test'],
      instructions: 'Mix and test',
    };

    const createRes = await axios.post(`${base}/api/recipes`, recipeBody, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const recipe = createRes.data.recipe || createRes.data;
    console.log('Created recipe id=', recipe.id);

    console.log('Deleting recipe...');
    const del = await axios.delete(`${base}/api/recipes/${recipe.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Delete response:', del.status, del.data);

    console.log('Verifying recipe is gone...');
    try {
      await axios.get(`${base}/api/recipes/${recipe.id}`);
      console.error('Recipe still exists (unexpected)');
      process.exit(2);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('Verified: recipe not found (404) — delete successful.');
        process.exit(0);
      } else {
        console.error('Unexpected error when verifying deletion', e.response ? e.response.data : e.message);
        process.exit(3);
      }
    }
  } catch (err) {
    console.error('Test failed', err.response ? err.response.data : err.message);
    process.exit(4);
  }
})();
