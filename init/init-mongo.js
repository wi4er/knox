let knox = db.getSiblingDB("knox")

knox.createUser(
    {
        user: "knox",
        pwd: "example",
        roles: [
            {
                role: "readWrite",
                db: "knox"
            }
        ]
    }
);

