import axios from 'axios';

const base = 'http://localhost:5010';

async function register(user) {
  const res = await axios.post(`${base}/api/auth/register`, user);
  return res.data.token || res.data.user?.token;
}

async function login(creds) {
  const res = await axios.post(`${base}/api/auth/login`, creds);
  return res.data.token || res.data.user?.token;
}

(async () => {
  try {
    const uniq = Date.now();
    const userA = { name: `userA_${uniq}`, email: `a_${uniq}@test.com`, password: 'pass1234' };
    const userB = { name: `userB_${uniq}`, email: `b_${uniq}@test.com`, password: 'pass1234' };

    console.log('Registering users...');
    const tokenA = await register(userA);
    const tokenB = await register(userB);
    console.log('Tokens:', !!tokenA, !!tokenB);

    const recipeBody = {
      title: 'Delete Test Recipe ' + uniq,
      description: 'for delete test',
      category: 'Test',
      ingredients: ['1 unit test'],
      instructions: 'do test',
    };

    console.log('User A creating recipe...');
    const create = await axios.post(`${base}/api/recipes`, recipeBody, { headers: { Authorization: `Bearer ${tokenA}` } });
    const recipe = create.data.recipe || create.data;
    console.log('Recipe id=', recipe.id);

    console.log('User B adding favorite...');
    await axios.post(`${base}/api/favorites`, { recipeId: recipe.id }, { headers: { Authorization: `Bearer ${tokenB}` } });

    console.log('User B adding rating...');
    await axios.post(`${base}/api/ratings`, { recipeId: recipe.id, score: 4, comment: 'Nice' }, { headers: { Authorization: `Bearer ${tokenB}` } });

    console.log('User B attempts to delete (should 403)...');
    try {
      await axios.delete(`${base}/api/recipes/${recipe.id}`, { headers: { Authorization: `Bearer ${tokenB}` } });
      console.error('ERROR: non-author was able to delete!');
      process.exit(1);
    } catch (e) {
      if (e.response && e.response.status === 403) console.log('Correct: non-author cannot delete (403)');
      else { console.error('Unexpected response when non-author deletes', e.response ? e.response.data : e.message); process.exit(2); }
    }

    console.log('Author deletes recipe...');
    const del = await axios.delete(`${base}/api/recipes/${recipe.id}`, { headers: { Authorization: `Bearer ${tokenA}` } });
    console.log('Delete status:', del.status, del.data.message);

    console.log('Verify recipe 404...');
    try {
      await axios.get(`${base}/api/recipes/${recipe.id}`);
      console.error('ERROR: recipe still exists after delete');
      process.exit(3);
    } catch (e) {
      if (e.response && e.response.status === 404) console.log('Recipe not found: OK');
      else { console.error('Unexpected when verifying recipe gone', e.response ? e.response.data : e.message); process.exit(4); }
    }

    console.log('Verify favorite removed...');
    try {
      // favorites list for userB should no longer contain the recipe
      const favs = await axios.get(`${base}/api/favorites`, { headers: { Authorization: `Bearer ${tokenB}` } });
      const has = favs.data.favorites?.some(f => f.recipeId === recipe.id) || false;
      if (has) { console.error('ERROR: favorite still present'); process.exit(5); } else console.log('Favorite removed: OK');
    } catch (e) { console.error('Error fetching favorites', e.response ? e.response.data : e.message); process.exit(6); }

    console.log('Verify rating removed...');
    try {
      const r = await axios.get(`${base}/api/ratings/${recipe.id}`);
      if (r.data.count && r.data.count > 0) { console.error('ERROR: rating still present'); process.exit(7); } else console.log('Ratings removed: OK');
    } catch (e) {
      if (e.response && e.response.status === 404) console.log('Ratings endpoint 404 (recipe missing) — acceptable');
      else { console.error('Error checking ratings', e.response ? e.response.data : e.message); process.exit(8); }
    }

    console.log('All checks passed.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err.response ? err.response.data : err.message);
    process.exit(9);
  }
})();
