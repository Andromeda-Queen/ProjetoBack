const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async postCreate(req, res) {
        const {nome, linkExterno, resumo} = req.body;
        db.Projeto.create({nome, linkExterno, resumo})
            .then(() => {
                res.redirect('/home')
            })
            .catch((err) => {
                console.log(err);
            });
    },
    async getList(req, res) {
        db.Receita.findAll().then(projetos => {
            res.render('projetos/projetoList',
                { projetos: projetos.map(projeto => projeto.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        await db.Receita.findByPk(req.params.id).then(
            receita => res.render('receita/receitaUpdate',
                {
                    receita: receita.dataValues,
                    categorias: categorias.map(categoria => categoria.toJSON())
                })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        const {nome, ingredientes, preparo, categoriaId} = req.body;
        const imagem = req.imageName;
        try {
            await db.Receita.update({
                nome,
                ingredientes,
                preparo,
                categoriaId,
                imagem
            }, {
                where: { id: req.body.id }
            });
            res.redirect('/home');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno do servidor');
        }
    },
    async getDelete(req, res) {
        await db.Receita.destroy({ where: { id: req.params.id } }).then(
            res.render('home')
        ).catch(err => {
            console.log(err);
        });
    }
}