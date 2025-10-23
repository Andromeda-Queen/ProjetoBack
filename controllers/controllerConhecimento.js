const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getCreate(req, res) {
        res.render('conhecimento/ConhecimentoCreate');
    },
    async postCreate(req, res) {
        db.Conhecimento.create(req.body).then(() => {
            res.redirect('/conhecimentoList');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getList(req, res) {
        db.Conhecimento.findAll().then(conhecimento => {
            res.render('conhecimento/ConhecimentoList', { conhecimento: conhecimento.map(item => item.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        await db.Conhecimento.findByPk(req.params.id).then(
            conhecimento => res.render('conhecimento/ConhecimentoUpdate', {conhecimento: conhecimento.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        await db.Conhecimento.update(req.body, { where: { id: req.body.id } }).then(
            res.redirect('/conhecimentoList')
        ).catch(function (err) {
            console.log(err);
        });
    },
    async getDelete(req, res) {
        await db.Conhecimento.destroy({ where: { id: req.params.id } }).then(
            res.redirect('/conhecimentoList')
        ).catch(err => {
            console.log(err);
        });
    }
}   