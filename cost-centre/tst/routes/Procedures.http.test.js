"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
require("mocha");
var App_1 = require("../../src/App");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var expect = chai.expect;
describe("test procedures routes", function () {
    var app = new App_1.App(3000).getExpressApplication();
    var testData = {
        name: "test",
        description: "description",
    };
    before("setup/test create", function () {
        // Create test element
        return chai.request(app).post("/procedures")
            .send(testData)
            .then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.be.true;
        });
    });
    it("/ scans all components", function () {
        return chai.request(app).get("/procedures")
            .then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal([testData]);
        });
    });
    it("/:name get component", function () {
        return chai.request(app).get("/procedures/" + testData.name)
            .then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal(testData);
        });
    });
    it("/:name update component", function () {
        return chai.request(app).put("/procedures/" + testData.name)
            .send({
            description: "new description",
        })
            .then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.not.deep.equal(testData);
            expect(response.body.name).to.equal(testData.name);
            expect(response.body.description).to.equal("new description");
        });
    });
    after("cleanup/test delete", function () {
        // Delete test data
        return chai.request(app).del("/procedures/" + testData.name)
            .then(function (response) {
            expect(response.status).to.equal(200);
            expect(response.body).to.be.true;
        });
    });
});
