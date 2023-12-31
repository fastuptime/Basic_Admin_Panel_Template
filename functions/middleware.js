module.exports = function() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());

    app.set('view engine', 'ejs');
    app.set('views', 'www');
    app.use('/client_assets', express.static('www/client/assets'));
    app.use('/admin_assets', express.static('www/admin/assets'));

    app.use(async function(req, res, next) {
        res.locals.site = {
            title: "Admin Panel Template",
            description: "Admin Panel Template",
            keywords: "Admin Panel Template",
        };
        if (req.cookies.ID && req.cookies.PASS) {
            user = await userModel.findOne({ id: req.cookies.ID, password: req.cookies.PASS });
            if (user) {
                res.locals.user = user;
            } else {
                res.clearCookie('ID');
                res.clearCookie('PASS');
                res.redirect(`/?status=error&message=Oturum Sonlandırıldı`);
            }

        }
        next();
    });

    global.checkAdmin = function(req, res, next) {
        if (res.locals.user) {
            if(res.locals.user.role == "admin") {
                next();
            } else {
                res.redirect(`/?status=error&message=Yetkisiz Giriş`);
            }
        } else {
            res.redirect(`/auth/login?status=error&message=Oturum Açın`);
        }
    };
};