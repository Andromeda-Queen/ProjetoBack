const { get } = require('mongoose');
const db = require('../config/db_sequelize');

module.exports = {
    async getCreate(req, res) {
        res.render('conhecimento/ConhecimentoCreate');
    },

    async postCreate(req, res) {
        db.ConhecimentoUsuario.create({
            usuarioId: res.locals.userId,              // vem da sessão (usuário logado)
            conhecimentoId: req.body.conhecimentoId,   // vem do formulário
            escala: req.body.escala                    // vem do formulário
        }
        ).then(() => {
            res.redirect('/conhecimentoList');
        }).catch((err) => {
            console.log(err);
        });
    },

    async getList(req, res) {
        db.ConhecimentoUsuario.findAll().then(conhecimentoUsuario => {
            res.render('conhecimentoUsuario/ConhecimentoUsuarioList', { conhecimentoUsuario: conhecimentoUsuario.map(item => item.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },

    async getUpdate(req, res) {
        // Implementar se necessário
        await db.ConhecimentoUsuario.findByPk(req.params.id).then(
            conhecimentoUsuario => res.render('conhecimentoUsuario/ConhecimentoUsuarioUsuario', {conhecimentoUsuario: conhecimentoUsuario.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },

    async postUpdate(req, res) {
        await db.ConhecimentoUsuario.update(req.body, { where: { id: req.body.id } }).then(
            res.redirect('/conhecimentoUsuarioList')
        ).catch(function (err) {
            console.log(err);
        });
    },

    async getDelete(req, res) {
        await db.ConhecimentoUsuario.destroy({ where: {
            id: req.params.id,
            usuarioId: req.session.userId} }).then(
            res.redirect('/conhecimentoUsuarioList')
        ).catch(err => {
            console.log(err);
        });
    }
}