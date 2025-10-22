const express = require('express');
const db = require('../config/db_sequelize');
const controllerUsuario = require('../controllers/controllerUsuario');
const controllerPalavraChave = require('../controllers/controllerPalavraChave');
const route = express.Router();

db.sequelize.sync({force: false}).then(() => {
});

if(!db.Usuario.findAll({ where: { login: 'admin' } })){
    db.Usuario.create({login:'admin', senha:'admin', tipo:2});
}

module.exports = route;

//Home
route.get("/home", function (req, res) {

    if (req.session.login) {
        res.render('home')
    }
    else
        res.redirect('/');
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
// route.get("/projetoCreate", controllerProjeto.getCreate);
// route.post("/projetoCreate", controllerProjeto.postCreate);
// route.get("/projetoList", controllerProjeto.getList);
// route.get("/projetoUpdate/:id", controllerProjeto.getUpdate);
// route.post("/projetoUpdate", controllerProjeto.postUpdate);
// route.get("/projetoDelete/:id", controllerProjeto.getDelete);

// //Controller Conhecimento
// route.get("/conhecimentoCreate", controllerConhecimento.getCreate);
// route.post("/conhecimentoCreate", controllerConhecimento.postCreate);
// route.get("/conhecimentoList", controllerConhecimento.getList);
// route.get("/conhecimentoUpdate/:id", controllerConhecimento.getUpdate);
// route.post("/conhecimentoUpdate", controllerConhecimento.postUpdate);
// route.get("/conhecimentoDelete/:id", controllerConhecimento.getDelete);