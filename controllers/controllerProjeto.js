const db = require('../config/db_sequelize');
const path = require('path');
const { getCreate } = require('./controllerProjeto');

module.exports = {
    async getCreate(req, res) {
        try {
            return res.render('projeto/projetoCreate');
        } catch (err) {
            console.error(err);
        }
    },
    async postCreate(req, res) {
        const {nome, linkExterno, resumo} = req.body;
        db.Projeto.create({nome, linkExterno, resumo})
            .then(() => {
                res.redirect('projetoList')
            })
            .catch((err) => {
                console.log(err);
            });
    },
    async getList(req, res) {
        try {
            const projeto = await db.Projeto.findAll({
                limit: 10,                         // limita a 10 resultados
                offset: 0                          // começa do primeiro
            });
            res.render('projeto/projetoList', {
                projetos: projeto.map(user => user.toJSON())
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar projetos');
        }
        // db.Projeto.findAll().then(projetos => {
        //     res.render('projeto/projetoList',
        //         { projetos: projeto.map(projeto => projeto.toJSON()) });
        // }).catch((err) => {
        //     console.log(err);
        // });
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
        await db.Projeto.destroy({ where: { id: req.params.id } })
        .then(
            res.redirect('/projetoList')
        ).catch(err => {
            console.log(err);
        });
    }
}