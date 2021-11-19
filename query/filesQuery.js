const filterList = {
    "field_id": (result, list) => {
        result["_id"] = list;
    },
    "status": (result, list) => {
        result["status"] = list
    },
}

module.exports = {
    parseFilter(filter) {
        const result = {};

        if (filter) {
            if (typeof filter === "string") {
                filter = [filter];
            }

            for (const filterItem of filter) {
                const item = filterItem.split("-in-");
                const list = item[1].split(";");

                filterList[item[0]]?.(result, list);
            }
        }

        return result;
    }
};
