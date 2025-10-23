const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('web_back2', 'utfpr', 'utfpr', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// carrega todos os modelos da pasta models/relational
const modelsDir = path.join(__dirname, '..', 'models', 'relational');
fs.readdirSync(modelsDir)
  .filter(f => f.endsWith('.js'))
  .forEach(file => {
    const modelFactory = require(path.join(modelsDir, file));
    if (typeof modelFactory === 'function') {
      const model = modelFactory(sequelize, Sequelize);
      // registra com o name do modelo e também com primeira letra maiúscula (compatibilidade)
      db[model.name] = model;
      const cap = model.name.charAt(0).toUpperCase() + model.name.slice(1);
      db[cap] = model;
    }
  });

// debug: mostrar modelos carregados
console.log('Modelos carregados em db:', Object.keys(db).join(', '));

// helper para checar existência de model válido
function hasModel(key) {
  return !!db[key] && typeof db[key].prototype === 'object';
}

// Associações: condicionalmente para evitar erros se algum model faltar
if (hasModel('Projeto') && hasModel('PalavraChave')) {
  const through = db.ProjetoPalavraChave || 'ProjetoPalavraChave';
  db.Projeto.belongsToMany(db.PalavraChave, {
    through,
    as: 'palavrasChave',
    foreignKey: 'projetoId',
    otherKey: 'palavraChaveId'
  });
  db.PalavraChave.belongsToMany(db.Projeto, {
    through,
    as: 'projetos',
    foreignKey: 'palavraChaveId',
    otherKey: 'projetoId'
  });

  if (db.ProjetoPalavraChave && typeof db.ProjetoPalavraChave.prototype === 'object') {
    db.ProjetoPalavraChave.belongsTo(db.Projeto, { foreignKey: 'projetoId' });
    db.ProjetoPalavraChave.belongsTo(db.PalavraChave, { foreignKey: 'palavraChaveId' });
  }
} else {
  console.warn('Aviso: Projeto <-> PalavraChave não associados — verifique models Projeto e PalavraChave');
}

if (hasModel('Usuario') && hasModel('Conhecimento')) {
  if (hasModel('conhecimentoUsuario') || hasModel('ConhecimentoUsuario')) {
    const junction = db.ConhecimentoUsuario || db.conhecimentoUsuario;
    db.Usuario.belongsToMany(db.Conhecimento, {
      through: junction,
      as: 'conhecimentos',
      foreignKey: 'usuarioId',
      otherKey: 'conhecimentoId'
    });
    db.Conhecimento.belongsToMany(db.Usuario, {
      through: junction,
      as: 'usuarios',
      foreignKey: 'conhecimentoId',
      otherKey: 'usuarioId'
    });

    // permite include { as: 'conhecimento' / 'usuario' } no controller
    junction.belongsTo(db.Conhecimento, { foreignKey: 'conhecimentoId', as: 'conhecimento' });
    junction.belongsTo(db.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
  } else {
    // fallback usando nome de tabela string
    db.Usuario.belongsToMany(db.Conhecimento, {
      through: 'ConhecimentoUsuario',
      as: 'conhecimentos',
      foreignKey: 'usuarioId',
      otherKey: 'conhecimentoId'
    });
    db.Conhecimento.belongsToMany(db.Usuario, {
      through: 'ConhecimentoUsuario',
      as: 'usuarios',
      foreignKey: 'conhecimentoId',
      otherKey: 'usuarioId'
    });
  }
} else {
  console.warn('Aviso: Usuario <-> Conhecimento não associados — verifique models Usuario e Conhecimento');
}

db.Usuario.belongsToMany(db.Projeto, { through: db.ProjetoUsuario});
db.Projeto.belongsToMany(db.Usuario, { through: db.ProjetoUsuario});

module.exports = db;

