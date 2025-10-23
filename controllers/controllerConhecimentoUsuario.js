const { get } = require('mongoose');
const db = require('../config/db_sequelize');

module.exports = {
    async getCreate(req, res) {
        res.render('conhecimento/ConhecimentoCreate');
    },

    async postCreate(req, res) {
        db.ConhecimentoUsuario.create({
            usuarioId: req.body.usuarioId,              // vem da sessão (usuário logado)
            conhecimentoId: req.body.conhecimentoId,   // vem do formulário
            escala: req.body.escala                    // vem do formulário
        }
        ).then(() => {
            res.redirect('/conhecimentoList');
        }).catch((err) => {
            console.log(err);
        });
    },

    async getRelatorio(req, res) {
        try {
            // Buscar todos os conhecimentos
            const conhecimentos = await db.Conhecimento.findAll();
            
            // Para cada conhecimento, calcular a proporção de alunos que o dominam
            const relatorio = await Promise.all(conhecimentos.map(async (conhecimento) => {
                // Contar total de usuários que têm alguma relação com este conhecimento
                const totalUsuarios = await db.ConhecimentoUsuario.count({
                    where: {
                        conhecimentoId: conhecimento.id
                    }
                });

                // Contar usuários que dominam o conhecimento (escala > 0)
                const usuariosDominando = await db.ConhecimentoUsuario.count({
                    where: {
                        conhecimentoId: conhecimento.id,
                        escala: {
                            [db.Sequelize.Op.gt]: 0
                        }
                    }
                });

                // Calcular a proporção
                const proporcao = totalUsuarios > 0 ? (usuariosDominando / totalUsuarios) * 100 : 0;

                return {
                    conhecimento: conhecimento.conhecimento,
                    totalUsuarios: totalUsuarios,
                    usuariosDominando: usuariosDominando,
                    proporcao: proporcao.toFixed(2)
                };
            }));

            // Renderizar a view com os dados do relatório
            res.render('conhecimento/relatorio', { relatorio });
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro ao gerar relatório');
        }
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
            conhecimentoUsuario => res.render('conhecimentoUsuario/ConhecimentoUsuarioUsuario', { conhecimentoUsuario: conhecimentoUsuario.dataValues })
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
        await db.ConhecimentoUsuario.destroy({
            where: {
                id: req.params.id,
                usuarioId: req.session.userId
            }
        }).then(
            res.redirect('/conhecimentoUsuarioList')
        ).catch(err => {
            console.log(err);
        });
    }
}