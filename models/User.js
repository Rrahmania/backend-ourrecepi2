import { DataTypes } from 'sequelize';

const defineUser = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'https://via.placeholder.com/150',
    },
  }, {
    timestamps: true,
    tableName: 'users',
  });

  return User;
};

export default defineUser;
