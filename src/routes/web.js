module.exports = (app) => {
    app.app.get("/login", (req, res) => {
        if(req.user) {
            res.redirect("/session");
        } else {
            res.render('pages/login', {
                title: "Login",
                idps: app.config.identity_providers
            });
        }
    });

    app.app.get("/session", (req, res) => {
        if(req.user) {
            res.render('pages/session', {
                title: "Current Session",
                session: req.session,
                user: req.user
            });
        } else {
            res.redirect("/login");
        }
    });

    app.app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/login');
    });
};

