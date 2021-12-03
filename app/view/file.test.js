const app = require('../index.js');
const request = require('supertest');
const fs = require("fs");
const mongoose = require("mongoose");
const Permission = require("../model/Permission");
const jwt = require("jsonwebtoken");
const path = require("path");
const STORAGE = require("../../environment").STORAGE_PATH;

afterEach(() => require("../model").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles(STORAGE));
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
            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .expect(201)
                .then(res => res.body._id)

            await request(app)
                .get(`/file/${id}`)
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
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

        test("Should get CastError with random id", async () => {
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
            await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .expect(201)
                .then(res => {
                    expect(res.body.name).toBe('Tomato');
                    expect(res.body.original).toBe("image.text");
                    expect(res.body.filename).toContain(`${res.body.original}`);
                    expect(res.body.size).toBe('9');
                    expect(res.body.mimetype).toBe('text/plain');
                });
        });

        test("Should save file", async () => {
            const filename = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body.filename)

            const file = await fs.promises.readFile(path.resolve(`${STORAGE}${filename}`), "utf8")

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
                .then(res => res.body.filename)

            const newFile = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('NEW NEW'), "data.text")
                .then(res => res.body.filename)

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

        test("Should post with permission", async () => {
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
                method: "POST",
                group: 1
            }).save();

            await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .expect(201)
        });

        test("Shouldn't post with wrong permission", async () => {
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
                method: "POST",
                group: 2
            }).save();

            await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .expect(403)
        });
    });

    describe("Updating items", () => {
        test("Should update item by id", async () => {
            const posted = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")

            const updated = await request(app)
                .put(`/file/${posted.body._id}/`)
                .set(...require("./mock/auth"))
                .field("name", "Tomato juice")
                .attach("file", Buffer.from('some data'), "tomato.text")
                .expect(200)

            expect(posted.body.name).toBe("Tomato");
            expect(updated.body.name).toBe("Tomato juice");
            expect(posted.body._id).toEqual(updated.body._id);
        });

        test("Should replace files on disk", async () => {
            const oldFile = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")

            await expect(fs.promises.readFile(`${STORAGE}${oldFile.body.filename}`, "utf8")).toBeDefined();

            const newFile = await request(app)
                .put(`/file/${oldFile.body._id}/`)
                .set(...require("./mock/auth"))
                .field("name", "New file")
                .attach("file", Buffer.from('some data'), "newFile.text")

            await expect(fs.promises.readFile(`${STORAGE}${newFile.body.filename}`, "utf8")).toBeDefined();
            await expect(fs.promises.readFile(`${STORAGE}${oldFile.body.filename}`, "utf8")).rejects.toThrow();
        });

        test("Should forbid updating without authorization", async () => {
            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await request(app)
                .put(`/file/${id}`)
                .expect(403)
        });

        test("Should update posted file with permission", async () => {
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
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await new Permission({
                entity: "FILE",
                method: "PUT",
                group: 1
            }).save();

            await request(app)
                .put(`/file/${id}/`)
                .set(...user)
                .field("name", "New file")
                .attach("file", Buffer.from('some data'), "newFile.text")
                .expect(200)
        });

        test("Shouldn't update with wrong permission", async () => {
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
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await new Permission({
                entity: "FILE",
                method: "PUT",
                group: 2
            }).save();

            await request(app)
                .put(`/file/${id}/`)
                .set(...user)
                .field("name", "New file")
                .attach("file", Buffer.from('some data'), "newFile.text")
                .expect(403)
        });
    });

    describe("Deleting items", () => {
        test("Should delete item", async () => {
            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
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
            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            const filename = await request(app)
                .get(`/file/${id}/`)
                .set(...require("./mock/auth"))
                .then(res => res.body.filename)

            await request(app)
                .delete(`/file/${id}/`)
                .set(...require("./mock/auth"))

            await expect(fs.promises.readFile(`${STORAGE}${filename}`, "utf8")).rejects.toThrow();
        });

        test("Should forbid deleting without authorization", async () => {
            const id = await request(app)
                .post("/file/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await request(app)
                .delete(`/file/${id}`)
                .expect(403)
        });

        test("Should delete posted file with permission", async () => {
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
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await new Permission({
                entity: "FILE",
                method: "DELETE",
                group: 1
            }).save();

            await request(app)
                .delete(`/file/${id}/`)
                .set(...user)
                .expect(200)
        });

        test("Shouldn't delete posted file with wrong permission", async () => {
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
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/file/")
                .set(...user)
                .field("name", "Tomato")
                .attach("file", Buffer.from('some data'), "image.text")
                .then(res => res.body._id)

            await new Permission({
                entity: "FILE",
                method: "DELETE",
                group: 2
            }).save();

            await request(app)
                .delete(`/file/${id}/`)
                .set(...user)
                .expect(403)
        });
    });
});
