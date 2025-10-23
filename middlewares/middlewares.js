module.exports = {
    logRegister(req, res, next) {
        console.log(req.url + req.method + new Date())
        next();
    },
    sessionControl(req, res, next) {
        if (req.session.login != undefined) {
            res.locals.userId = req.session.userId;
            res.locals.login = req.session.login;
            if (req.session.tipo == 2) {
                res.locals.admin = true
            }
            next();
        }
        
        else if ((req.url == '/') && (req.method == 'GET')) next();
        else if ((req.url == '/login') && (req.method == 'POST')) next();
        // Usuário externo pode: visualizar projetos, filtrar por palavras chaves, e acessar relatório
        else if((req.url == '/projetos') && (req.method == 'GET')) next();
        else if((req.url == '/palavraChave') && (req.method == 'GET')) next();
        else if((req.url == '/relatorio') && (req.method == 'GET')) next();
        else res.redirect('/');
    }
};