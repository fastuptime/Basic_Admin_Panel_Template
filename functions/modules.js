module.exports = async function() {
    const { JsonDatabase } = require('wio.db');
    global.express = require('express');
    global.db = new JsonDatabase({ databasePath: './database.json' });
    global.md5 = require('md5');
    global.bodyParser = require('body-parser');
    global.ejs = require('ejs');
    global.config = require('../config.js');
    global.log = require('./log.js')
    global.app = express();
    global.dayjs = require('dayjs');
    global.mongoose = require("mongoose")
    global.Schema = mongoose.Schema;
    global.colors = require('colors');
    global.getLength = require('./mongoID.js');
    global.nodemailer = require("nodemailer");
    global.cookieParser = require('cookie-parser');
    const { glob } = require("glob");
    const { promisify } = require("util");
    global.globPromise = promisify(glob);
    
    (async () => {
        let loaded_plugins = [];
        const commandFiles = await globPromise(`${process.cwd()}/plugins/**/*.js`);
        commandFiles.map((value) => {
            const file = require(value);
            if (!file.name) return;
            if (loaded_plugins.includes(file.name)) return console.log(`[Plugin] ${file.name} isimli plugin zaten yuklu.`.red);
            log(`[Plugin] Yapımcı: ${file.author}, ${file.name}(${file.version}) yuklendi.`, "green");
            global[file.name] = file;
            loaded_plugins.push(file.name);
        });
        log(`[Plugin] Toplam ${loaded_plugins.length} adet plugin yuklendi.`,"green");
    })();

    require('../models/exports.js')(this);
};