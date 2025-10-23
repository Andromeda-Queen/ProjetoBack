const db = require('../config/db_sequelize');
const path = require('path');
const { getCreate } = require('./controllerProjeto');

module.exports = {
    async getCreate(req, res) {
        var palavrasChaveIds = await db.PalavraChave.findAll()
        res.render('projeto/projetoCreate', {
            palavrasChaveIds: palavrasChaveIds.map(palavraChave => palavraChave.toJSON())
        });
    },
    async postCreate(req, res) {
        const {nome, linkExterno, resumo,} = req.body;
        db.Projeto.create({nome, linkExterno, resumo})
            .then(() => {
                res.redirect('projeto/projetoList')
            })
            .catch((err) => {
                console.log(err);
            });
    },
    async getList(req, res) {
        db.Projeto.findAll().then(projeto => {
            res.render('projeto/projetoList',
                { projeto: projeto.map(projeto => projeto.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        await db.Projeto.findByPk(req.params.id).then(
            projeto => res.render('projeto/projetoUpdate',
                {
                    projeto: projeto.dataValues,
                    palavraChave: palavraChave.map(palavraChave => palavraChave.toJSON())
                })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        const {nome, linkExterno, resumo, palavraChaveId} = req.body;
        try {
            await db.Receita.update({
                nome,
                linkExterno,
                resumo,
                palavraChaveId,
            }, {
                where: { id: req.body.id }
            });
            res.redirect('projeto/projetoList');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno do servidor');
        }
    },
    async getDelete(req, res) {
        await db.Projeto.destroy({ where: { id: req.params.id } }).then(
            res.render('home')
        ).catch(err => {
            console.log(err);
        });
    }
}