const Sequelize = require('sequelize');
const sequelize = new Sequelize('web_back2', 'utfpr', 'utfpr', {
    host: 'localhost',
    dialect: 'postgres'
  });

var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Usuario = require('../models/relational/Usuario.js')(sequelize, Sequelize);
db.Projeto = require('../models/relational/projeto.js')(sequelize, Sequelize);
db.PalavraChave = require('../models/relational/palavraChave.js')(sequelize, Sequelize);
db.Conhecimento = require('../models/relational/Conhecimento.js')(sequelize, Sequelize);

// Relações N:N

//Relação entre Projeto e Usuario
db.ProjetoUsuario = require('../models/relational/ProjetoUsuario.js')(sequelize, Sequelize);
db.Projeto.belongsToMany(db.Usuario, {
  through: db.ProjetoUsuario
});
db.Usuario.belongsToMany(db.Projeto, {
  through: db.ProjetoUsuario
});

//Relação entre Usuario e Conhecimento
db.ConhecimentoUsuario = require('../models/relational/ConhecimentoUsuario.js')(sequelize, Sequelize);
db.Usuario.belongsToMany(db.Conhecimento, {
  through: db.ConhecimentoUsuario
});
db.Conhecimento.belongsToMany(db.Usuario, {
  through: db.ConhecimentoUsuario
});

//Relação entre Projeto e PalavraChave
db.ProjetoPalavraChave = require('../models/relational/ProjetoPalavraChave.js')(sequelize, Sequelize);
db.PalavraChave.belongsToMany(db.Projeto, {
  through: db.ProjetoPalavraChave
});
db.Projeto.belongsToMany(db.PalavraChave, {
  through: db.ProjetoPalavraChave
});

module.exports = db;

