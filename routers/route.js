const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerPalavraChave = require('../controllers/controllerPalavraChave');
const controllerConhecimento = require('../controllers/controllerConhecimento');
const controllerProjeto = require('../controllers/controllerProjeto');
const controllerConhecimentoUsuario = require('../controllers/controllerConhecimentoUsuario');
const controllerProjetoUsuario = require('../controllers/controllerProjetoUsuario');
const route = express.Router();

db.sequelize.sync({force: false}).then(() => {
});

// if(!db.Usuario.findAll({ where: { login: 'admin' } })){
//     db.Usuario.create({login:'admin', senha:'admin', tipo:2});
// }
// db.Usuario.create({login:'admin', senha:'admin', tipo:2});

module.exports = route;

//Home
route.get("/home", function (req, res) {

    // If request includes ?noLogin=true allow guest access to home
    if (req.query && req.query.noLogin === 'true') {
        // do not create a login session for guest; render home and pass any existing session info
        return res.render('home', {
            login: req.session ? req.session.login : undefined,
            admin: req.session && req.session.tipo == 2
        });
    }

    if (req.session && req.session.login) {
        return res.render('home', {
            login: req.session.login,
            admin: req.session.tipo == 2
        });
    } else {
        return res.redirect('/');
    }

});

//Controller Usuario
route.get("/", controllerUsuario.getLogin);
route.post("/login", controllerUsuario.postLogin);
route.get("/logout", controllerUsuario.getLogout);
route.get("/usuarioCreate", controllerUsuario.getCreate);
route.post("/usuarioCreate", controllerUsuario.postCreate);
route.get("/usuarioList", controllerUsuario.getList);
route.get("/usuarioUpdate/:id", controllerUsuario.getUpdate);
route.post("/usuarioUpdate", controllerUsuario.postUpdate);
route.get("/usuarioDelete/:id", controllerUsuario.getDelete);

//Controller PalavraChave
route.get("/palavraChaveCreate", controllerPalavraChave.getCreate);
route.post("/palavraChaveCreate", controllerPalavraChave.postCreate);
route.get("/palavraChaveList", controllerPalavraChave.getList);
route.get("/palavraChaveUpdate/:id", controllerPalavraChave.getUpdate);
route.post("/palavraChaveUpdate", controllerPalavraChave.postUpdate);
route.get("/palavraChaveDelete/:id", controllerPalavraChave.getDelete);

//Controller Projeto
route.get("/projetoCreate", controllerProjeto.getCreate);
route.post("/projetoCreate", controllerProjeto.postCreate);
route.get("/projetoList", controllerProjeto.getList);
route.get("/projetoUpdate/:id", controllerProjeto.getUpdate);
route.post("/projetoUpdate", controllerProjeto.postUpdate);
route.get("/projetoDelete/:id", controllerProjeto.getDelete);

//Controller Conhecimento
route.get("/conhecimentoCreate", controllerConhecimento.getCreate);
route.post("/conhecimentoCreate", controllerConhecimento.postCreate);
route.get("/conhecimentoList", controllerConhecimento.getList);
route.get("/conhecimentoUpdate/:id", controllerConhecimento.getUpdate);
route.post("/conhecimentoUpdate", controllerConhecimento.postUpdate);
route.get("/conhecimentoDelete/:id", controllerConhecimento.getDelete);

//Controller ProjetoUsuario
route.get("/projetoUsuarioCreate/:id", controllerProjetoUsuario.getCreate);
route.post("/projetoUsuarioCreate", controllerProjetoUsuario.postCreate);
route.post("/projetoUsuarioDelete", controllerProjetoUsuario.postDelete);

// relatorio
route.get("/relatorio", controllerConhecimentoUsuario.getRelatorio);