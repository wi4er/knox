module.exports = async function(next) {
    const Property = require("../model/Property");

    for (const key in this.property) {
        const res = await Property.findById(this.property[key].property);

        if (!res) {
            delete this.property[key];
        }
    }

    this.property = this.property.filter(item => item);

    next();
}
