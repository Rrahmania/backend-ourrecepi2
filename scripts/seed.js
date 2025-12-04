import bcrypt from 'bcryptjs';
import { connectDB, User, Recipe, Favorite } from '../db.js';

const run = async () => {
  try {
    await connectDB();

    const passwordPlain = 'password123';
    const hashed = await bcrypt.hash(passwordPlain, 10);

    const [user] = await User.findOrCreate({
      where: { email: 'seed_user@example.com' },
      defaults: {
        name: 'seed_user',
        email: 'seed_user@example.com',
        password: hashed,
      },
    });

    console.log('User ready:', user.id, user.email);

    const [recipe] = await Recipe.findOrCreate({
      where: { title: 'Sample Nasi Goreng' },
      defaults: {
        title: 'Sample Nasi Goreng',
        description: 'Contoh resep nasi goreng sederhana',
        category: 'Main',
        ingredients: ['Nasi', 'Telur', 'Bawang', 'Kecap'],
        instructions: 'Tumis bumbu, masukkan nasi, aduk, sajikan',
        userId: user.id,
      },
    });

    console.log('Recipe ready:', recipe.id, recipe.title);

    // Optionally create a favorite entry
    await Favorite.findOrCreate({
      where: { userId: user.id, recipeId: recipe.id },
      defaults: { userId: user.id, recipeId: recipe.id },
    });

    console.log('Favorite ensured for user -> recipe');

    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
};

run();
