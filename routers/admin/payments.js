const router = require('express').Router();

router.get('/', checkAdmin, async (req, res) => {
    res.render('admin/pages/payments', {
    });
});

module.exports = router;