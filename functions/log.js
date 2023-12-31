module.exports = function(text, color) {
    if (config.log) {
        console.log(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] > ` + text[color] + " ".gray);
    }
}