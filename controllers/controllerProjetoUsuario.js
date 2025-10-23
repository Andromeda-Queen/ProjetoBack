const { get } = require('mongoose');
const db = require('../config/db_sequelize');
const { getDelete } = require('./controllerConhecimentoUsuario');
module.exports = {
    async getCreate(req, res) {
        try {
            const projetoId = parseInt(req.params.id);
            const usuarios = await db.Usuario.findAll();
            const usuariosMembrosDesteProjeto = await db.ProjetoUsuario.findAll({
                where: { projetoId }
            });

            // array de ids (números) para facilitar includes no template
            const membrosIds = usuariosMembrosDesteProjeto.map(u => u.usuarioId);

            return res.render('projeto/projetoUsuarioCreate', {
                usuarios: usuarios.map(u => u.toJSON()),
                membrosIds,
                projetoId
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao carregar página de adicionar membros');
        }
    },


    async postCreate(req, res) {
        db.ProjetoUsuario.create({
            usuarioId: req.body.usuarioId,              // vem da sessão (usuário logado)
            projetoId: req.body.projetoId,   // vem do formulário
        }
        ).then(() => {
            res.redirect(`/projetoUsuarioCreate/${req.body.projetoId}`);
        }).catch((err) => {
            console.log(err);
        });
    },

    async postDelete(req, res) {
        await db.ProjetoUsuario.destroy({
            where: {
                usuarioId: req.body.usuarioId,
                projetoId: req.body.projetoId
            }
        }).then(() => {
            res.redirect(`/projetoUsuarioCreate/${req.body.projetoId}`);
        }).catch((err) => {
            console.log(err);
        });
    }
}