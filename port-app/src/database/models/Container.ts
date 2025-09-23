import { DataTypes, Sequelize } from 'sequelize';

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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'CLEAN',
      comment: 'The condition of the container (e.g., CLEAN, DAMAGED)'
    },
  }, {
    timestamps: false
  });
};