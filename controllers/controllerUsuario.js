const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getLogin(req, res) {
        res.render('usuario/login', { layout: 'noMenu.handlebars' });
    },
    async getLogout(req, res) {
        //res.cookie("userData", req.cookies.userData, { maxAge: 0, httpOnly: true });
        req.session.destroy();
        res.redirect('/');
    },
    async postLogin(req, res) {
        var user = {
            nome: req.body.nome
        }
        db.Usuario.findAll({ where: { nome: req.body.nome, senha: req.body.senha } }
        ).then(usuarios => {
            if (usuarios.length > 0) {
                req.session.nome = req.body.nome;
                res.locals.nome = req.body.nome;
                if (usuarios[0].dataValues.tipo == 2) {
                    req.session.tipo = usuarios[0].dataValues.tipo;
                    res.locals.admin = true;
                }
                res.render('home');
            } else
                res.redirect('/');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getCreate(req, res) {
        res.render('usuario/usuarioCreate');
    },
    async postCreate(req, res) {
        db.Usuario.create(req.body).then(() => {
            res.redirect('/home');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getList(req, res) {
        try {
            const usuarios = await db.Usuario.findAll({
                limit: 10,                         // limita a 10 resultados
                offset: 0                          // começa do primeiro
            });

            res.render('usuario/usuarioList', {
                usuarios: usuarios.map(user => user.toJSON())
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar usuários');
        }
    },
    async getUpdate(req, res) {
        await db.Usuario.findByPk(req.params.id).then(
            usuario => res.render('usuario/usuarioUpdate', { usuario: usuario.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        await db.Usuario.update(req.body, { where: { id: req.body.id } }).then(
            res.render('home')
        ).catch(function (err) {
            console.log(err);
        });
    },
    async getDelete(req, res) {
        await db.Usuario.destroy({ where: { id: req.params.id } }).then(
            res.render('home')
        ).catch(err => {
            console.log(err);
        });
    }
}   