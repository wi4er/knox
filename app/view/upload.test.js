const app = require('../index.js');
const request = require('supertest');
const fs = require("fs");
const path = require("path");
const Permission = require("../model/Permission");
const STORAGE = require("../../environment").STORAGE_PATH;
const jwt = require("jsonwebtoken");
const resolutions = require('../handling/resolutions.js')

afterEach(() => require("../model").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles(STORAGE));

beforeAll(() => require("../model").connect());
afterAll(() => require("../model").disconnect());

describe("Upload files", function () {
    describe("Upload by name", () => {
        test("Should get an existing file", async () => {
            const image = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "Image name")
                .attach("image", Buffer.from('SOME IMAGE'), "some_image.jpg")
                .then(res => res.body.filename)

            const got = await request(app)
                .get(`/upload/${image}`)
                .set(...require("./mock/auth"))
                .expect(200)

            console.log(got.body)

            const file = await fs.promises.readFile(path.resolve(STORAGE, image), "utf8")
            expect(file).toBe('SOME IMAGE');
        });

        test("Should throw if file does not exist", async () => {
            const name = 'WRONG_PATH';

            await request(app)
                .get(`/upload/${name}`)
                .set(...require("./mock/auth"))
                .expect(404)
        });

        test("Shouldn't get file without authorization", async () => {
            const image = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('SOME IMAGE'), "some_image.jpg")
                .then(res => res.body.filename)

            await request(app)
                .get(`/upload/${image}`)
                .expect(403)
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
                method: "POST",
                group: 1
            }).save();

            const image = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('SOME IMAGE'), "some_image.jpg")
                .then(res => res.body.filename)

            await new Permission({
                entity: "IMAGE",
                method: "GET",
                group: 1
            }).save();

            await request(app)
                .get(`/upload/${image}`)
                .set(...user)
                .expect(200)
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
                method: "POST",
                group: 1
            }).save();

            const image = await request(app)
                .post("/image/")
                .set(...user)
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('SOME IMAGE'), "some_image.jpg")
                .then(res => res.body.filename)

            await new Permission({
                entity: "IMAGE",
                method: "GET",
                group: 2
            }).save();

            await request(app)
                .get(`/upload/${image}`)
                .set(...user)
                .expect(403)
        });
    });

    describe("Resizing uploads", () => {
        test("Should resize an image", async () => {
            const image = await request(app)
                .post("/image/")
                .set(...require("./mock/auth"))
                .field("name", "NEW IMAGE")
                .attach("image", Buffer.from('some data'), "image.jpg")
                .then(res => res.body.filename)

                // await request(app)
                //     .get(`/upload/nHD/${image}`)
                //     .set(...require("./mock/auth.js"))
                //     .then(res => res.statusCode)

        });

        test("Shouldn't resize NOT an image", async () => {

        });
    });
});