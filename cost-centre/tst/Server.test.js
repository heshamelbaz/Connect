"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
require("mocha");
var Server_1 = require("../src/Server");
var expect = chai.expect;
describe("initialize server", function () {
    it("should initialize port properly if string is provided", function () {
        var server = new Server_1.Server("5000");
        expect(server.getPort()).to.equal(5000);
    });
    it("should initialize port with default value if nothing is provided", function () {
        var server = new Server_1.Server(null);
        expect(server.getPort()).to.equal(3000);
    });
    it("should initialize port with default value if negative value is provided", function () {
        var server = new Server_1.Server("-5000");
        expect(server.getPort()).to.equal(3000);
    });
});
