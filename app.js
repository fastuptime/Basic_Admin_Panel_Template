require('./functions/modules.js')(this);
require('./routers/routes.js')(this);

app.listen(config.port, () => {
    log(`Site ${config.port} portunda başlatıldı.`, 'green');
});