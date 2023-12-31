module.exports = async function() {
    require("../functions/middleware.js")(this);

    app.use("/admin", require("./admin/index.js"));
    app.use("/", require("./client/index.js"));
};