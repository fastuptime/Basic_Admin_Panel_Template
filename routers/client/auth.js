const router = require('express').Router();

router.get('/terms', async(req, res) => {
    res.send(db.get('terms') || `<center><h1>Kullanım Şartları Bulunamadı.</h1></center>`);
});

router.get('/privacy', async(req, res) => {
    res.send(db.get('privacy') || `<center><h1>Gizlilik Politikası Bulunamadı.</h1></center>`);
});

router.get('/login', async(req, res) => {
    if(req.cookies.ID) return res.redirect('/?status=error&message=Zaten giriş yapmışsınız.');
    res.render('auth/login');   
});

router.post('/login', async(req, res) => {
    let { username, password } = req.body;
    if(!username || !password) return res.redirect(`/auth/login?status=error&message=Boş alan bırakmayınız.`);

    ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    user = await userModel.login({ username, password, ip });
    if(!user.status) return res.redirect(`/auth/login?status=error&message=${user.message}`);
    res.locals.user = user;
    res.cookie('ID', user.data.id, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    res.cookie('PASS', user.data.password, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    res.redirect(`/?status=success&message=Hoşgeldin ${user.data.username}`);
});

router.get('/register', async(req, res) => {
    if(req.cookies.ID) return res.redirect('/?status=error&message=Zaten giriş yapmışsınız.');
    res.render('auth/register');   
});

router.post('/register', async(req, res) => {
    let { username, password, mail } = req.body;
    if(!username || !password || !mail) return res.redirect(`/auth/register?status=error&message=Boş alan bırakmayınız.`);
    user = await userModel.register({ username, password, mail });
    if(!user.status) return res.redirect(`/auth/register?status=error&message=${user.message}`);
    res.locals.user = user;
    res.cookie('ID', user.data.id, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    res.cookie('PASS', user.data.password, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    res.redirect(`/?status=success&message=Hoşgeldin ${user.data.username}`);
});

router.get('/verify', async(req, res) => {
    code = req.query.code;
    if(!code) return res.redirect('/?status=error&message=Boş alan bırakmayınız.');
    user = await userModel.verifyMail({ id: req.cookies.ID, code });
    if(!user.status) return res.redirect(`/?status=error&message=${user.message}`);
    res.redirect(`/?status=success&message=Mail adresiniz başarıyla onaylandı.`);
});

router.get('/logout', async(req, res) => {
    res.clearCookie('ID');
    res.clearCookie('PASS');
    res.redirect('/auth/login?status=success&message=Çıkış yaptınız.');
});

module.exports = router;