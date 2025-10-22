module.exports = (sequelize, Sequelize) => {
    const ConhecimentoUsuario = sequelize.define('conhecimentoUsuario', {
        escala: {
            type: Sequelize.INTEGER, allowNull: false
        }
    });
    return ConhecimentoUsuario
}