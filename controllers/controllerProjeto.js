const db = require('../config/db_sequelize');
const path = require('path');

function normalizeIds(input) {
    if (!input && input !== 0) return [];
    if (Array.isArray(input)) return input.map(x => parseInt(x, 10)).filter(n => !isNaN(n));
    return [parseInt(input, 10)].filter(n => !isNaN(n));
}

function findAssociation(model, target) {
    if (!model || !model.associations) return null;
    return Object.values(model.associations).find(a => a.target === target) || null;
}

module.exports = {
    // mostra o formulário com as palavras-chave disponíveis
    async getCreate(req, res) {
        try {
            const usuarios = await db.Usuario.findAll();
            const palavrasChave = await db.PalavraChave.findAll();
            return res.render('projeto/projetoCreate', {
                // nome enviado ajustado para o que o Handlebars usa
                usuarios: usuarios.map(u => u.toJSON()),
                palavraChave: palavrasChave.map(pc => pc.toJSON())
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao carregar formulário de criação de projeto');
        }
    },

    // cria projeto e associa palavras-chave (se houver associação)
    async postCreate(req, res) {
        const { nome, linkExterno, resumo } = req.body;
        try {
            const projeto = await db.Projeto.create({ nome, linkExterno, resumo });

            // checkboxes do template usam name="palavrasChave[]", assim req.body.palavrasChave será array ou string
            const raw = req.body.palavrasChave || req.body['palavrasChave[]'] || req.body.palavrasChaveId;
            const ids = Array.isArray(raw) ? raw.map(x => parseInt(x, 10)).filter(n => !isNaN(n)) : (raw ? [parseInt(raw, 10)].filter(n => !isNaN(n)) : []);

            if (ids.length > 0) {
                // tenta os métodos gerados dinamicamente (vários nomes para segurança)
                if (typeof projeto.setPalavrasChaves === 'function') await projeto.setPalavrasChaves(ids);
                else if (typeof projeto.setPalavraChaves === 'function') await projeto.setPalavraChaves(ids);
                else if (typeof projeto.setPalavrasChave === 'function') await projeto.setPalavrasChave(ids);
                else if (db.ProjetoPalavraChave) {
                    // fallback para tabela de junção manual
                    const joins = ids.map(pid => ({ projetoId: projeto.id, palavraChaveId: pid }));
                    await db.ProjetoPalavraChave.bulkCreate(joins);
                }
            }

            return res.redirect('/projetoList');
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao criar projeto');
        }
    },

    // lista projetos e inclui as palavras-chave associadas (se associação existir)
    async getList(req, res) {
        try {
            // busca projetos e membros
            const projetos = await db.Projeto.findAll({
                limit: 50,
                offset: 0,
                include: [{ model: db.PalavraChave, as: 'palavrasChave' }]
            });

            const membros = await db.ProjetoUsuario.findAll();

            // transformar membros em array de objetos plain
            const membrosPlain = membros.map(m => m.toJSON());

            // para cada projeto, anexa a lista de membros (apenas os usuarioId,
            // ou o objeto inteiro se precisar)
            const projetosComMembros = projetos.map(p => {
                const pj = p.toJSON();
                pj.membros = membrosPlain
                    .filter(m => m.projetoId === pj.id)   // pega só membros do projeto
                    .map(m => m.usuarioId);               // mapeia para usuárioId (ou m se quiser objeto)
                return pj;
            });

            return res.render('projeto/projetoList', {
                projetos: projetosComMembros,
                membros: membrosPlain // opcional, se ainda quiser
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao listar projetos');
        }
    },
    
    // carrega projeto para edição e marca palavras-chave selecionadas
    async getUpdate(req, res) {
        try {
            const projeto = await db.Projeto.findByPk(req.params.id);
            if (!projeto) return res.status(404).send('Projeto não encontrado');

            const palavrasChave = await db.PalavraChave.findAll();

            // obtém ids associados (tenta pelo método do sequelize ou pela tabela de junção)
            let selectedIds = [];
            if (typeof projeto.getPalavrasChaves === 'function') {
                const associados = await projeto.getPalavrasChaves();
                selectedIds = associados.map(a => (a.toJSON ? a.toJSON().id : a.id));
            } else if (db.ProjetoPalavraChave) {
                const joins = await db.ProjetoPalavraChave.findAll({ where: { projetoId: projeto.id } });
                selectedIds = joins.map(j => j.palavraChaveId);
            }

            // marca cada palavraChave com selected: true/false
            const palavrasComSelected = palavrasChave.map(pc => {
                const obj = pc.toJSON();
                obj.selected = selectedIds.includes(obj.id);
                return obj;
            });

            return res.render('projeto/projetoCreate', {
                projeto: projeto.toJSON(),
                palavraChave: palavrasComSelected,
                selectedPalavras: selectedIds
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao carregar edição do projeto');
        }
    },

    // atualiza projeto e associa/desassocia palavras-chave
    async postUpdate(req, res) {
        try {
            const { id, nome, linkExterno, resumo } = req.body;
            if (!id) return res.status(400).send('ID do projeto é obrigatório');

            // atualiza campos do projeto
            await db.Projeto.update(
                { nome, linkExterno, resumo },
                { where: { id } }
            );

            const projeto = await db.Projeto.findByPk(id);
            if (!projeto) return res.status(404).send('Projeto não encontrado');

            // normaliza ids vindos do form (checkboxes name="palavrasChave[]")
            const raw = req.body.palavrasChave || req.body['palavrasChave[]'] || req.body.palavrasChaveId;
            const ids = Array.isArray(raw) ? raw.map(x => parseInt(x, 10)).filter(n => !isNaN(n)) : (raw ? [parseInt(raw, 10)].filter(n => !isNaN(n)) : []);

            // associa/desassocia usando métodos do Sequelize, ou fallback para tabela de junção
            if (typeof projeto.setPalavrasChaves === 'function') {
                await projeto.setPalavrasChaves(ids);
            } else if (typeof projeto.setPalavraChaves === 'function') {
                await projeto.setPalavraChaves(ids);
            } else if (typeof projeto.setPalavrasChave === 'function') {
                await projeto.setPalavrasChave(ids);
            } else if (db.ProjetoPalavraChave) {
                await db.ProjetoPalavraChave.destroy({ where: { projetoId: projeto.id } });
                if (ids.length) {
                    const joins = ids.map(pid => ({ projetoId: projeto.id, palavraChaveId: pid }));
                    await db.ProjetoPalavraChave.bulkCreate(joins);
                }
            }

            return res.redirect('/projetoList');
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao atualizar projeto');
        }
    },

    async getDelete(req, res) {
        try {
            await db.Projeto.destroy({ where: { id: req.params.id } });
            return res.redirect('/projetoList');
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao deletar projeto');
        }
    }
};