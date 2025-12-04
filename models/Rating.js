import { DataTypes } from 'sequelize';

const defineRating = (sequelize, User, Recipe) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
      comment: 'Rating dari 1-5',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'recipes',
        key: 'id',
      },
    },
  }, {
    tableName: 'ratings',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'recipeId'],
        name: 'unique_user_recipe_rating',
      },
    ],
  });

  // Set associations directly (User and Recipe are passed in)
  Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Rating.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe' });

  User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
  Recipe.hasMany(Rating, { foreignKey: 'recipeId', as: 'ratings' });

  return Rating;
};

export default defineRating;
