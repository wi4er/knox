const app = require('../index');
const request = require('supertest');
const fs = require("fs");
const Permission = require("../model/Permission");
const mongoose = require("mongoose");
const STORAGE = require("../../environment").STORAGE_PATH;
const jwt = require("jsonwebtoken");

afterEach(() => require("../model").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles(STORAGE));

beforeAll(() => require("../model").connect());
afterAll(() => require("../model").disconnect());

describe("Image entity", function () {
    describe("Getting images", () => {
        test("Should get an empty list", async () => {
            await request(app)
                .get("/image/")
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    expect(JSON.parse(res.text)).toEqual([]);
                });
        });

        test("Should get an image with id", async () => {
            const id = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "IMAGE")
                .attach("image", Buffer.from('some data'), "new_image.jpg")
                .expect(201)
                .then(res => res.body._id)

            await request(app)
                .get(`/image/${id}`)
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    expect(res.body.name).toBe('IMAGE');
                    expect(res.body.original).toBe('new_image.jpg');
                });
        });

        test("Should get an image with permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "IMAGE",
                method: "GET",
                group: 1
            }).save();

            await request(app)
                .get("/image/")
                .set(...user)
                .expect(200)
                .then(res => {
                    expect(JSON.parse(res.text)).toEqual([]);
                });
        });

        test("Shouldn't get an image with wrong permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "IMAGE",
                method: "GET",
                group: 2
            }).save();

            await request(app)
                .get("/image/")
                .set(...user)
                .expect(403);
        });

        test("Shouldn't get item with mongoose id", async () => {
            await request(app)
                .get(`/image/${mongoose.Types.ObjectId()}/`)
                .set(...require("./mock/auth"))
                .expect(404);
        });

        test("Should get CastError with wrong id", async () => {
            await request(app)
                .get(`/image/123/`)
                .set(...require("./mock/auth"))
                .expect(404);
        });

        test("Should forbid access without authorization", async () => {
            await request(app)
                .get("/image/")
                .expect(403);
        });
    });

    describe("Adding images", () => {
        test("Should post an image", async () => {
            const response = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('some data'), "image.jpg")

            expect(response.body.name).toBe('NEW IMAGE');
            expect(response.body.original).toBe("image.jpg");
            expect(response.body.filename).toContain("image.jpg");
            expect(response.body.size).toBe("9");
            expect(response.body.mimetype).toContain("image");
        });

        test("Shouldn't post NOT an image", async () => {
            await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "NOT AN IMAGE")
                .attach("image", Buffer.from('some data'), "file.pdf")
                .expect(415)
        })

        test("Should download image", async () => {
            const filename = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('some data'), "image.jpg")
                .then(res => res.body.filename);

            const file = await fs.promises.readFile(`${STORAGE}${filename}`, "utf8");

            expect(file).toBe('some data');
        });

        test("Should add the same image twice", async () => {
            await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "OLD IMAGE")
                .attach("image", Buffer.from('OLD DATA'), "data.jpg")
                .expect(201);

            await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('NEW NEW'), "data.jpg")
                .expect(201);
        });

        test("Shouldn't override the same images", async () => {
            const oldImage = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('OLD DATA'), "data.jpg")
                .then(res => res.body.filename)

            const newImage = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('NEW NEW'), "data.jpg")
                .then(res => res.body.filename)

            expect(oldImage).not.toBe(newImage)
        });

        test("Shouldn't add without attach image", async () => {
            await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "")
                .expect(400);
        });

        test("Should forbid uploading without authorization", async () => {
            await request(app)
                .post("/image/")
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
                entity: "IMAGE",
                method: "POST",
                group: 1
            }).save();

           await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "IMAGE")
                .attach("image", Buffer.from('some data'), "img.png")
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
                entity: "IMAGE",
                method: "POST",
                group: 2
            }).save();

            await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "Forbidden")
                .attach("file", Buffer.from('some data'), "try.png")
                .expect(403)
        });
    });

    describe("Updating images", () => {
        test("Should update an image", async () => {
            const posted = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Old photo")
                .attach("image", Buffer.from('some data'), "fun.png")

            const updated = await request(app)
                .put(`/image/${posted.body._id}/`)
                .set(...require("./mock/auth"))
                .field("name", "New photo")
                .attach("image", Buffer.from('some data'), "sad.jpg")
                .expect(200)

            expect(posted.body._id).toEqual(updated.body._id);

            expect(posted.body.name).toBe("Old photo");
            expect(updated.body.name).toBe("New photo");
        });

        test("Should replace images on disk", async () => {
            const oldImage = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Past")
                .attach("image", Buffer.from('some data'), "OLD.jpeg")

            await expect(fs.promises.readFile(`${STORAGE}${oldImage.body.filename}`, "utf8")).toBeDefined();

            const newImage = await request(app)
                .put(`/image/${oldImage.body._id}/`)
                .set(...require("./mock/auth"))
                .field("name", "Present")
                .attach("image", Buffer.from('some data'), "NEW.jpeg")

            await expect(fs.promises.readFile(`${STORAGE}${newImage.body.filename}`, "utf8")).toBeDefined();
            await expect(fs.promises.readFile(`${STORAGE}${oldImage.body.filename}`, "utf8")).rejects.toThrow();
        });

        test("Should not update without authorization", async () => {
            const id = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Oh, no no no")
                .attach("image", Buffer.from('some data'), "reject.png")
                .then(res => res.body._id)

            await request(app)
                .put(`/image/${id}`)
                .expect(403)
        });

        test("Should update posted image with permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "IMAGE",
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "Things good")
                .attach("image", Buffer.from('some data'), "img.jpg")
                .then(res => res.body._id)

            await new Permission({
                entity: "IMAGE",
                method: "PUT",
                group: 1
            }).save();

            await request(app)
                .put(`/image/${id}/`)
                .set(...user)
                .field("name", "New file")
                .attach("image", Buffer.from('some data'), "image.png")
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
                entity: "IMAGE",
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "hello.png")
                .then(res => res.body._id)

            await new Permission({
                entity: "IMAGE",
                method: "PUT",
                group: 2
            }).save();

            await request(app)
                .put(`/image/${id}/`)
                .set(...user)
                .field("name", "New file")
                .attach("image", Buffer.from('some data'), "newFile.png")
                .expect(403)
        });
    });

    describe("Deleting images", () => {
        test("Should delete image", async () => {
            const id = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "image.png")
                .expect(201)
                .then(res => res.body._id)

            await request(app)
                .delete(`/image/${id}/`)
                .set(...require("./mock/auth"))
                .expect(200)
                .then(res => {
                    expect(res.body).toBe(true);
                });
        });

        test("Should delete image from disk", async () => {
            const id = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "image.png")
                .then(res => res.body._id)

            const filename = await request(app)
                .get(`/image/${id}/`)
                .set(...require("./mock/auth"))
                .then(res => res.body.filename)

            await request(app)
                .delete(`/image/${id}/`)
                .set(...require("./mock/auth"))

            await expect(fs.promises.readFile(`${STORAGE}${filename}`, "utf8")).rejects.toThrow();
        });

        test("Should not delete without authorization", async () => {
            const id = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "image.jpg")
                .then(res => res.body._id)

            await request(app)
                .delete(`/image/${id}`)
                .expect(403)
        });

        test("Should delete posted image with permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "IMAGE",
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "image.png")
                .then(res => res.body._id)

            await new Permission({
                entity: "IMAGE",
                method: "DELETE",
                group: 1
            }).save();

            await request(app)
                .delete(`/image/${id}/`)
                .set(...user)
                .expect(200)
        });

        test("Shouldn't delete posted image with wrong permission", async () => {
            const user = [
                "authorization",
                `Bearer ${jwt.sign(
                    {id: "000122333444455555666666", group: 1},
                    "hello world !",
                    {algorithm: 'HS256'}
                )}`
            ];

            await new Permission({
                entity: "IMAGE",
                method: "POST",
                group: 1
            }).save();

            const id = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "Tomato")
                .attach("image", Buffer.from('some data'), "image.jpeg")
                .then(res => res.body._id)

            await new Permission({
                entity: "IMAGE",
                method: "DELETE",
                group: 2
            }).save();

            await request(app)
                .delete(`/image/${id}/`)
                .set(...user)
                .expect(403)
        });
    });
})