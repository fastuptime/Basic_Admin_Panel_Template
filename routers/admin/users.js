const router = require('express').Router();

router.get('/', checkAdmin, async (req, res) => {
    res.render('admin/pages/users', {
        users: await userModel.find()
    });
});

router.get('/logs', checkAdmin, async (req, res) => {
    user = req.query.user;
    if (!user) {
        return res.redirect('/admin/users');
    }
    if (!await userModel.exists({ id: user })) {
        return res.redirect('/admin/users');
    }
    res.json(await userModel.findOne({ id: user }).then(user => user.logs));
});

router.get('/detailed_information', checkAdmin, async (req, res) => {
    user = req.query.user;
    if (!user) {
        return res.redirect('/admin/users');
    }
    if (!await userModel.exists({ id: user })) {
        return res.redirect('/admin/users');
    }
    res.json(await userModel.findOne({ id: user }));
});


module.exports = router;