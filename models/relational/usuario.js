
module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define('usuario', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true, allowNull: false, primaryKey: true
        },
        login: {
            type: Sequelize.STRING, allowNull: false
        },
        senha: {
            type: Sequelize.STRING, allowNull: false
        },
        tipo: {
            type: Sequelize.INTEGER, allowNull: false
        }
    });
    return Usuario;
}