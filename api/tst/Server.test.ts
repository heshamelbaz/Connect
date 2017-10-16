import * as chai from "chai";
import "mocha";
import {Server} from "../src/Server";

const expect = chai.expect;

describe("initialize server", () => {
    it("should initialize port properly if string is provided", () => {
        const server = new Server("5000");
        expect(server.getPort()).to.equal(5000);
    });

    it("should initialize port with default value if nothing is provided", () => {
        const server = new Server(null);
        expect(server.getPort()).to.equal(3000);
    });

    it("should initialize port with default value if negative value is provided", () => {
        const server = new Server("-5000");
        expect(server.getPort()).to.equal(3000);
    });
});
