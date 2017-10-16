import * as chai from "chai";
import "mocha";
import {App} from "../../src/App";
import chaiHttp = require("chai-http");
import {IProcedure} from "../../src/models/Procedure";

chai.use(chaiHttp);
const expect = chai.expect;

describe("test procedures routes", () => {
    const app = new App(3000).getExpressApplication();
    const baseUrl: string = "/procedures";

    const testData: IProcedure = {
        name: "test",
        description: "description",
    };

    before("setup/test create", () => {
        // Create test element
        return chai.request(app).post(baseUrl)
            .send(testData)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.true;
            });
    });

    it("/ scans all components", () => {
        return chai.request(app).get(baseUrl)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal([testData]);
            });
    });

    it("/:name get component", () => {
        return chai.request(app).get(baseUrl + "/" + testData.name)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.deep.equal(testData);
            });
    });

    it("/:name update component", () => {
        return chai.request(app).put(baseUrl + "/" + testData.name)
            .send({
                description: "new description",
            })
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.not.deep.equal(testData);
                expect(response.body.name).to.equal(testData.name);
                expect(response.body.description).to.equal("new description");
            });
    });

    after("cleanup/test delete", () => {
        // Delete test data
        return chai.request(app).del(baseUrl + "/" + testData.name)
            .then((response) => {
                expect(response.status).to.equal(200);
                expect(response.body).to.be.true;
            });
    });
});
