const router = require('express').Router();

router.get('/', (req, res) => {
    res.send(`<center><h1>Merhaba Admin Panel Template'in Anasayfası Bu Şekilde<br><a href="/auth/login">Giriş Yap</a> | <a href="/auth/register">Kayıt Ol</a> | <a href="/admin">Panel</a></h1></center>`);
});

router.use('/auth', require('./auth'));

module.exports = router;