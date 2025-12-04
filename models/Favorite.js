import { DataTypes } from 'sequelize';

const defineFavorite = (sequelize, User, Recipe) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'recipes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  }, {
    timestamps: true,
    tableName: 'favorites',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'recipeId'],
      },
    ],
  });

  // Relasi

  Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Favorite.belongsTo(Recipe, { foreignKey: 'recipeId', as: 'recipe', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
  Recipe.hasMany(Favorite, { foreignKey: 'recipeId', as: 'favoritedBy', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

  return Favorite;
};

export default defineFavorite;
