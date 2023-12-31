const router = require('express').Router();

router.get('/', checkAdmin, async (req, res) => {
    res.render('admin/pages/index');
});

router.use('/users', require('./users'));
router.use('/payments', require('./payments'));

module.exports = router;