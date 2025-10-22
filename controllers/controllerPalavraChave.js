const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getCreate(req, res) {
        res.render('palavraChave/PalavraChaveCreate');
    },
    async postCreate(req, res) {
        db.PalavraChave.create(req.body).then(() => {
            res.redirect('/palavraChaveList');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getList(req, res) {
        db.PalavraChave.findAll().then(palavraChave => {
            res.render('palavraChave/PalavraChaveList', { palavraChave: palavraChave.map(palavra => palavra.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        await db.PalavraChave.findByPk(req.params.id).then(
            palavraChave => res.render('palavraChave/PalavraChaveUpdate', {palavraChave: palavraChave.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        await db.PalavraChave.update(req.body, { where: { id: req.body.id } }).then(
            res.redirect('/palavraChaveList')
        ).catch(function (err) {
            console.log(err);
        });
    },
    async getDelete(req, res) {
        await db.PalavraChave.destroy({ where: { id: req.params.id } }).then(
            res.redirect('/palavraChaveList')
        ).catch(err => {
            console.log(err);
        });
    }
}   