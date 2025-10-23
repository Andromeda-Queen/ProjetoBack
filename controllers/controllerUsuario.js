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
                res.render('home');
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
    async getUpdate(req, res) {
        await db.Usuario.findByPk(req.params.id).then(
            usuario => res.render('usuario/usuarioUpdate', { usuario: usuario.dataValues })
        ).catch(function (err) {
            console.log(err);
        });
    },
    async postUpdate(req, res) {
        await db.Usuario.update(req.body, { where: { id: req.body.id } }).then(
            res.redirect('/usuarioList')
        ).catch(function (err) {
            console.log(err);
        });
    },
    async getDelete(req, res) {
        await db.Usuario.destroy({ where: { id: req.params.id } }).then(
            res.redirect('/usuarioList')
        ).catch(err => {
            console.log(err);
        });
    }
}