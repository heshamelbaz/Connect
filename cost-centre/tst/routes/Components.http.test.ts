import * as chai from "chai";
import "mocha";
import {App} from "../../src/App";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);
const expect = chai.expect;

describe("test components routes", () => {
    const app = new App(3000).getExpressApplication();

    it("/ scans all components", () => {
        return chai.request(app).get("/components/")
            .then((result) => {
                expect(result.status).to.equal(200);
            });
    });
});
