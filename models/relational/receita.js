module.exports = (sequelize, Sequelize) => {
    const Receita = sequelize.define('receita', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, allowNull: false, primaryKey: true
        },
        nome: {
            type: Sequelize.STRING, allowNull: true
        },
        ingredientes: {
            type: Sequelize.STRING, allowNull: true
        },
        preparo: {
            type: Sequelize.STRING, allowNull: true
        },
        imagem: {
            type: Sequelize.STRING, allowNull: true
        },
        categoriaId:{
            type: Sequelize.INTEGER, allowNull: true
        }
    });
    return Receita;
}