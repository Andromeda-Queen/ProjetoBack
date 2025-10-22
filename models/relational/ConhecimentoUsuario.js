module.exports = (sequelize, Sequelize) => {
    const ConhecimentoUsuario = sequelize.define('conhecimentoUsuario', {
        escala: {
            type: Sequelize.STRING, allowNull: false
        }
    });
    return ConhecimentoUsuario
}