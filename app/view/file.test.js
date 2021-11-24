const app = require('./index');
const request = require('supertest');
const fs = require("fs");
const mongoose = require("mongoose");
const Permission = require("../model/Permission");
const jwt = require("jsonwebtoken");

afterEach(() => require("../model").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles(process.env.STORAGE_PATH || "app/storage/files"));

/**
 * @TODO rewrite to endpoint
 */
beforeAll(() => require("../model").connect());
afterAll(() => require("../model").disconnect());

describe("File entity", function () {
    describe("Getting items", () => {
        test("Should get an empty list", async () => {
            await request(app)
                .get("/file/")
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    expect(JSON.parse(res.text)).toEqual([]);
                });
        });

        test("Should get an item with id", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .expect(201)
                .then(res => res.body._id)

            await request(app)
                .get(`/file/${id}`)
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    console.log(res.text)
                    expect(res.body.name).toBe('Tomato');
                    expect(res.body.original).toBe('image.text');
                });
        });

        test("Should get with permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "FILE",
                method: "GET",
                group: 1
            }).save();

            await request(app)
                .get("/file/")
                .set(...user)
                .expect(200)
                .then(res => {
                    expect(JSON.parse(res.text)).toEqual([]);
                });
        });

        test("Shouldn't get with wrong permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "FILE",
                method: "GET",
                group: 2
            }).save();

            await request(app)
                .get("/file/")
                .set(...user)
                .expect(403);
        });

        test("Shouldn't get item with mongoose id", async () => {
            await request(app)
                .get(`/file/${mongoose.Types.ObjectId()}/`)
                .set(...require("./mock/auth"))
                .expect(404);
        });

        test("Should get CastError with random id. ", async () => {
            await request(app)
                .get(`/file/123/`)
                .set(...require("./mock/auth"))
                .expect(404);
        });

        test("Should forbid access without authorization", async () => {
            await request(app)
                .get("/file/")
                .expect(403);
        });
    });

    describe("Adding items", () => {
        test("Should add item to mongo", async () => {
            const buffer = Buffer.from('some data');

            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .expect(201)
                .then(res => {
                    expect(res.body.name).toBe('Tomato');
                });
        });

        test("Should save file", async () => {
            const buffer = Buffer.from('some data');

            const path = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .then(res => res.body.path)

            const file = await fs.promises.readFile(`./${path}`, "utf8")

            expect(file).toBe('some data');
        });

        test("Should add the same item twice", async () => {
            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('OLD DATA'), "data.text")
                .expect(201);

            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('NEW NEW'), "data.text")
                .expect(201);
        });

        test("Shouldn't override the same files", async () => {
            const oldFile = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('OLD DATA'), "data.text")
                .then(res => res.body.path)

            const newFile = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('NEW NEW'), "data.text")
                .then(res => res.body.path)

            expect(oldFile).not.toBe(newFile)
        });

        test("Shouldn't add without attach item", async () => {
            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "")
                .expect(400);
        });

        test("Should forbid uploading without authorization", async () => {
            await request(app)
                .post("/file/")
                .expect(403)
        });
    });

    describe("Updating items", () => {
        test("Should update item by id", async () => {
            const buffer = Buffer.from('some data');
            let id;

            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .expect(201)
                .then(res => {
                    id = res.body._id;

                    expect(res.body._id).toEqual(id);
                    expect(res.body.name).toBe('Tomato')
                })

            await request(app)
                .put(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .field("name", "Tomato juice")
                .attach("file", buffer, "tomato.text")
                .expect(200)
                .then(res => {
                    expect(res.body._id).toEqual(id);
                    expect(res.body.name).toBe('Tomato juice')
                })
        });

        test("Should remove updated file from disk", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .then(res => res.body._id)

            const path = await request(app)
                .get(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .then(res => res.body.path)

            await request(app)
                .put(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .field("name", "New file")
                .attach("file", buffer, "newFile.text")

            await expect(fs.promises.readFile(`app/${path}`, "utf8")).rejects.toThrow();

        });

        test("Should forbid updating without authorization", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .then(res => res.body._id)

            await request(app)
                .put(`/file/${id}`)
                .expect(403)
        });
    });

    describe("Deleting items", () => {
        test("Should delete item", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .expect(201)
                .then(res => res.body._id)

            await request(app)
                .delete(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    expect(res.body).toBe(true);
                });
        });

        test("Should delete file from disk", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .then(res => res.body._id)

            const path = await request(app)
                .get(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .then(res => res.body.path)

            await request(app)
                .delete(`/file/${id}/`)
                .set(...require("./mock/auth"))

            await expect(fs.promises.readFile(`./${path}`, "utf8")).rejects.toThrow();
        });

        test("Should forbid deleting without authorization", async () => {
            const buffer = Buffer.from('some data');

            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", buffer, "image.text")
                .then(res => res.body._id)

            await request(app)
                .delete(`/file/${id}`)
                .expect(403)
        });
    });
});
