const Sequelize = require('sequelize');
const sequelize = new Sequelize('web_back2', 'utfpr', 'utfpr', {
    host: 'localhost',
    dialect: 'postgres'
  });

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Usuario = require('../models/relational/usuario.js')(sequelize, Sequelize);
db.Projeto = require('../models/relational/projeto.js')(sequelize, Sequelize);
db.PalavraChave = require('../models/relational/palavraChave.js')(sequelize, Sequelize);
db.Conhecimento = require('../models/relational/conhecimento.js')(sequelize, Sequelize);
db.ConhecimentoUsuario = require('../models/relational/ConhecimentoUsuario.js')(sequelize, Sequelize);

db.Usuario.belongsToMany(db.Conhecimento, {
  through: db.ConhecimentoUsuario,
  //foreignKey: 'usuarioId',
  //otherKey: 'conhecimentoId'
});
db.Conhecimento.belongsToMany(db.Usuario, {
  through: db.ConhecimentoUsuario,
  //foreignKey: 'conhecimentoId',
  //otherKey: 'usuarioId'
});


module.exports = db;

