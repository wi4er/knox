const app = require('.');
const request = require('supertest');

afterEach(() => require("../connection").clearDatabase().catch(err => console.log(err)));
afterEach(() => require("../cleaner/fileCleaner").clearAllFiles("./images"));

beforeAll(() => require("../connection").connect());
afterAll(() => require("../connection").disconnect());

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