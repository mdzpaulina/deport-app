import { DataTypes, Sequelize } from 'sequelize';

// We export a function that defines the model.
export default (sequelize: Sequelize) => {
  sequelize.define('Container', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    entryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    timestamps: false
  });
};