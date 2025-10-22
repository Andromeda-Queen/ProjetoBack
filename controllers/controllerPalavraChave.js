const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getCreate(req, res) {
        res.render('categoria/PalavraChaveCreate');
    },
    async postCreate(req, res) {
        db.PalavraChave.create(req.body).then(() => {
            res.redirect('/home');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getList(req, res) {
        db.PalavraChave.findAll().then(palavrasChave => {
            res.render('categoria/PalavraChaveList', { palavrasChave: palavrasChave.map(palavra => palavra.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        await db.PalavraChave.findByPk(req.params.id).then(
            palavraChave => res.render('categoria/PalavraChaveUpdate', {palavraChave: palavraChave.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        await db.PalavraChave.update(req.body, { where: { id: req.body.id } }).then(
            res.render('home')
        ).catch(function (err) {
            console.log(err);
        });
    },
    async getDelete(req, res) {
        await db.PalavraChave.destroy({ where: { id: req.params.id } }).then(
            res.render('home')
        ).catch(err => {
            console.log(err);
        });
    }
}   