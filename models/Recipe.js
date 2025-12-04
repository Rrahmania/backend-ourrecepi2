import { DataTypes } from 'sequelize';

const defineRecipe = (sequelize, User) => {
  const Recipe = sequelize.define('Recipe', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ingredients: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    prepTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Waktu persiapan dalam menit',
    },
    cookTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Waktu memasak dalam menit',
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    difficulty: {
      type: DataTypes.ENUM('Mudah', 'Sedang', 'Sulit'),
      allowNull: false,
      defaultValue: 'Sedang',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    timestamps: true,
    tableName: 'recipes',
  });

  // Relasi
  Recipe.belongsTo(User, { foreignKey: 'userId', as: 'author' });
  User.hasMany(Recipe, { foreignKey: 'userId', as: 'recipes' });

  return Recipe;
};

export default defineRecipe;
