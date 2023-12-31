module.exports = async function() {
    mongoose.connect(config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection.on('error', console.error.bind(console, 'connection mongodb error:'));
    mongoose.connection.once('open', function() {
        log("MongoDB Bağlantısı Başarılı", "green");
    });

    global.userModel = require("../models/user.js");
};