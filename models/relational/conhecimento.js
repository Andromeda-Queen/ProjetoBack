module.exports = (sequelize, Sequelize) => {
    const Conhecimento = sequelize.define('conhecimento', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, allowNull: false, primaryKey: true
        },
        conhecimento: {
            type: Sequelize.STRING, allowNull: false
        }
    });
    return Conhecimento
}