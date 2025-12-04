import { Sequelize } from 'sequelize';
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } from './config.js';
import defineUser from './models/User.js';
import defineRecipe from './models/Recipe.js';
import defineFavorite from './models/Favorite.js';
import defineRating from './models/Rating.js';

console.log(`🔍 Connecting to PostgreSQL:`, {
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD ? '***' : '(empty)',
});

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false, // Set true untuk melihat query
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allow self-signed certs (for Render)
    },
  },
});

// Initialize models
const User = defineUser(sequelize);
const Recipe = defineRecipe(sequelize, User);
const Favorite = defineFavorite(sequelize, User, Recipe);
const Rating = defineRating(sequelize, User, Recipe);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    
    // Sync models (create table jika belum ada)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
    if (error && error.stack) console.error(error.stack);
    process.exit(1);
  }
};

export { User, Recipe, Favorite, Rating };
export default sequelize;
