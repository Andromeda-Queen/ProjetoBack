const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getCreate(req, res) {
        var categorias = await db.Categoria.findAll()
        res.render('receita/receitaCreate', {
            categorias: categorias.map(categoria => categoria.toJSON())
        });
    },
    async postCreate(req, res) {
        const {nome, ingredientes, preparo, categoriaId} = req.body;
        const imagem = req.imageName;
        db.Receita.create({nome, ingredientes, preparo, categoriaId, imagem})
            .then(() => {
                res.redirect('/home')
            })
            .catch((err) => {
                console.log(err);
            });
    },
    async getList(req, res) {
        db.Receita.findAll().then(receitas => {
            res.render('receita/receitaList',
                { receitas: receitas.map(receita => receita.toJSON()) });
        }).catch((err) => {
            console.log(err);
        });
    },
    async getUpdate(req, res) {
        var categorias = await db.Categoria.findAll()
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