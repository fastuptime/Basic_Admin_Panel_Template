module.exports = function(model) {
    check = db.get(model + ".length") || 0;
    check = check + 1;
    db.set(model + ".length", check);
    return check;
};