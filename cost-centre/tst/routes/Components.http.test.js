"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
require("mocha");
var App_1 = require("../../src/App");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);
var expect = chai.expect;
describe("test components routes", function () {
    var app = new App_1.App(3000).getExpressApplication();
    it("/ scans all components", function () {
        return chai.request(app).get("/components/")
            .then(function (result) {
            expect(result.status).to.equal(200);
        });
    });
});
