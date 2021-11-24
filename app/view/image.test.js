const app = require('./index');
const request = require('supertest');

afterEach(() => require("../model").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles(process.env.STORAGE_PATH || "app/storage/images"));

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
    })
})