module.exports = {
    logRegister(req, res, next) {
        console.log(req.url + req.method + new Date())
        next();
    },
    sessionControl(req, res, next) {
        if (req.session && req.session.login != undefined) {
            res.locals.userId = req.session.userId;
            res.locals.login = req.session.login;
            if (req.session.tipo == 2) {
                res.locals.admin = true
            }
            return next();
        }

        // allow some public GET paths (use req.path so query string doesn't interfere)
        const publicGetPaths = ['/', '/home', '/projetoList', '/palavraChave', '/relatorio'];
        if (req.method === 'GET' && publicGetPaths.includes(req.path)) return next();

        // allow login POST
        if (req.path === '/login' && req.method === 'POST') return next();

        // otherwise require login
        return res.redirect('/');
    }
};