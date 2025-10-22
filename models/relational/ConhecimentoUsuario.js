module.exports = (sequelize, Sequelize) => {
    const ConhecimentoUsuario = sequelize.define('conhecimento_usuario', {
        // id: {
        //     type: Sequelize.INTEGER,
        //     autoIncrement: true, allowNull: false, primaryKey: true
        // },
        escala: {
            type: Sequelize.STRING, allowNull: false
        }
    });
    return ConhecimentoUsuario
}