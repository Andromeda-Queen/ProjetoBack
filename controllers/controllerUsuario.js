const db = require('../config/db_sequelize');
const path = require('path');

module.exports = {
    async getLogin(req, res) {
        res.render('usuario/login', { layout: 'noMenu.handlebars' });
    },
    async getLogout(req, res) {
        //res.cookie("userData", req.cookies.userData, { maxAge: 0, httpOnly: true });
        req.session.destroy();
        res.redirect('/');
    },
    async postLogin(req, res) {
        var user = {
            login: req.body.login
        }
        db.Usuario.findAll({ where: { login: req.body.login, senha: req.body.senha } }
        ).then(usuarios => {
            if (usuarios.length > 0) {
                req.session.userId = usuarios[0].dataValues.id; // recuperando id do usuário logado
                req.session.login = req.body.login;
                res.locals.login = req.body.login;
                if (usuarios[0].dataValues.tipo == 2) {
                    req.session.tipo = usuarios[0].dataValues.tipo;
                    res.locals.admin = true;
                }
                res.render('home',{
                    userId: req.session.userId,
                });
            } else
                res.redirect('/');
        }).catch((err) => {
            console.log(err);
        });
    },
    async getCreate(req, res) {
        const conhecimentos = await db.Conhecimento.findAll();
        res.render('usuario/usuarioCreate', {
            conhecimentos: conhecimentos.map(item => item.toJSON())
        });
        // res.render('usuario/usuarioCreate');
    },
    async postCreate(req, res) {
        try {
            const usuarioCriado = await db.Usuario.create(req.body);

            let conhecimentos = req.body.conhecimentos || [];
            let escalas = req.body.escala || {};

            // normaliza conhecimentos para array
            if (!Array.isArray(conhecimentos)) {
                conhecimentos = conhecimentos ? [conhecimentos] : [];
            }

            // cria todos os relacionamento garantindo correspondência entre conhecimento e escala
            const promises = conhecimentos.map((rawId, idx) => {
                const conhecimentoId = parseInt(rawId, 10);
                let escala = 0;
                if (escalas) {
                    if (Array.isArray(escalas)) {
                        escala = parseInt(escalas[idx] ?? 0, 10);
                    } else if (typeof escalas === 'object') {
                        escala = parseInt(escalas[conhecimentoId] ?? escalas[idx] ?? escalas[String(conhecimentoId)] ?? 0, 10);
                    } else {
                        escala = parseInt(escalas || 0, 10);
                    }
                }
                if (isNaN(escala)) escala = 0;

                return db.ConhecimentoUsuario.create({
                    usuarioId: usuarioCriado.id,
                    conhecimentoId: conhecimentoId,
                    escala: escala
                });
            });

            await Promise.all(promises);

            return res.redirect('/usuarioList');
        } catch (err) {
            console.log(err);
            return res.status(500).send('Erro ao criar usuário');
        }
    },
    async getList(req, res) {
        try {
            const usuarios = await db.Usuario.findAll({
                limit: 10,
                offset: 0
            });

            const conhecimentosUsuario = await db.ConhecimentoUsuario.findAll({
                include: [
                    { model: db.Conhecimento, as: 'conhecimento' },
                    { model: db.Usuario, as: 'usuario' }
                ]
            });

            const usuariosMap = new Map();
            usuarios.forEach(u => {
                usuariosMap.set(u.id, Object.assign(u.toJSON(), { conhecimentos: [] }));
            });

            conhecimentosUsuario.forEach(kv => {
                const ku = kv.toJSON();
                const uid = ku.usuarioId || (ku.usuario && ku.usuario.id);
                // determina nome do conhecimento (vindo do include ou de um campo direto)
                const nomeDoConhecimento = (ku.conhecimento && ku.conhecimento.conhecimento) || ku.nome || null;
                const conhecimentoObj = {
                    id: ku.conhecimentoId || (ku.conhecimento && ku.conhecimento.id) || null,
                    conhecimentoNome: nomeDoConhecimento,
                    escala: ku.escala || 0
                };

                if (usuariosMap.has(uid)) {
                    usuariosMap.get(uid).conhecimentos.push(conhecimentoObj);
                } else if (ku.usuario) {
                    const userObj = Object.assign(
                        (ku.usuario.toJSON ? ku.usuario.toJSON() : ku.usuario),
                        { conhecimentos: [conhecimentoObj] }
                    );
                    usuariosMap.set(userObj.id, userObj);
                }
            });

            const usuariosComConhecimentos = Array.from(usuariosMap.values());

            res.render('usuario/usuarioList', {
                usuarios: usuariosComConhecimentos
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar usuários');
        }
    },
    // carrega usuário para edição e marca conhecimentos selecionados com escala
    async getUpdate(req, res) {
        try {
            const usuario = await db.Usuario.findByPk(req.params.id);
            if (!usuario) return res.status(404).send('Usuário não encontrado');

            // busca todos os conhecimentos disponíveis
            const conhecimentos = await db.Conhecimento.findAll();

            // busca relacionamentos existentes para este usuário (com include do Conhecimento)
            const conhecimentosUsuario = await db.ConhecimentoUsuario.findAll({
                where: { usuarioId: usuario.id },
                include: [{ model: db.Conhecimento, as: 'conhecimento' }]
            });

            // cria mapa id -> escala para marcação
            const escalaMap = {};
            conhecimentosUsuario.forEach(kv => {
                const ku = kv.toJSON ? kv.toJSON() : kv;
                const cid = ku.conhecimentoId || (ku.conhecimento && ku.conhecimento.id);
                escalaMap[cid] = ku.escala ?? 0;
            });

            // monta lista de conhecimentos com selected e escala (para checkbox + input de escala no template)
            const conhecimentosComSelected = conhecimentos.map(c => {
                const obj = c.toJSON();
                obj.selected = Object.prototype.hasOwnProperty.call(escalaMap, obj.id);
                obj.escala = escalaMap[obj.id] ?? 0;
                return obj;
            });

            return res.render('usuario/usuarioUpdate', {
                usuario: usuario.toJSON(),
                conhecimentos: conhecimentosComSelected
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao carregar edição do usuário');
        }
    },

    // atualiza usuário e seus conhecimentos (escala)
    async postUpdate(req, res) {
        try {
            const { id, login, senha, tipo } = req.body;
            if (!id) return res.status(400).send('ID do usuário é obrigatório');

            // atualiza dados básicos do usuário
            await db.Usuario.update({ login, senha, tipo }, { where: { id } });
            const usuario = await db.Usuario.findByPk(id);
            if (!usuario) return res.status(404).send('Usuário não encontrado');

            // normaliza conhecimentos selecionados (name="conhecimentos[]")
            let conhecimentos = req.body.conhecimentos || [];
            if (!Array.isArray(conhecimentos)) {
                conhecimentos = conhecimentos ? [conhecimentos] : [];
            }
            // escalas podem chegar como objeto escala[<id>]=value ou como array escala[]
            const escalasRaw = req.body.escala || req.body.escalaValor || {};

            const normalizeEscala = (conhecimentoId, idx) => {
                if (Array.isArray(escalasRaw)) {
                    return parseInt(escalasRaw[idx] ?? 0, 10) || 0;
                }
                if (typeof escalasRaw === 'object') {
                    // procura por chave numérica ou string do id ou por índice
                    return parseInt(escalasRaw[conhecimentoId] ?? escalasRaw[String(conhecimentoId)] ?? escalasRaw[idx] ?? 0, 10) || 0;
                }
                return parseInt(escalasRaw || 0, 10) || 0;
            };

            // remove todas associações anteriores e recria conforme seleção
            if (db.ConhecimentoUsuario) {
                await db.ConhecimentoUsuario.destroy({ where: { usuarioId: usuario.id } });

                const toCreate = conhecimentos
                    .map((rawId, idx) => {
                        const cid = parseInt(rawId, 10);
                        if (isNaN(cid)) return null;
                        const escala = normalizeEscala(cid, idx);
                        return { usuarioId: usuario.id, conhecimentoId: cid, escala };
                    })
                    .filter(x => x !== null);

                if (toCreate.length) await db.ConhecimentoUsuario.bulkCreate(toCreate);
            } else if (typeof usuario.setConhecimentos === 'function') {
                // fallback: se usar belongsToMany sem model explícito não consegue armazenar escala no through
                const ids = conhecimentos.map(x => parseInt(x, 10)).filter(n => !isNaN(n));
                await usuario.setConhecimentos(ids);
            }

            return res.redirect(`/usuarioUpdate/${req.session.userId}`);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro ao atualizar usuário');
        }
    },
    async getDelete(req, res) {
        await db.Usuario.destroy({ where: { id: req.params.id } }).then(
            res.redirect('/usuarioList')
        ).catch(err => {
            console.log(err);
        });
    }
}