module.exports = (file) => {
    return new Date().getTime() + '_' + file.split(' ').join('_');
}