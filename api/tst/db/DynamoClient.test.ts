import {AWSError, Request} from "aws-sdk";
import {
    DeleteItemOutput, DocumentClient, GetItemOutput, PutItemOutput,
    ScanOutput, UpdateItemOutput,
} from "aws-sdk/clients/dynamodb";
import * as chai from "chai";
import "mocha";
import * as sinon from "sinon";
import {SinonStub} from "sinon";
import * as sinonChai from "sinon-chai";
import {DynamoClient} from "../../src/db/DynamoClient";
import {ReservedWords} from "../../src/db/ReservedWords";
import AttributeMap = DocumentClient.AttributeMap;

chai.use(sinonChai);

const expect = chai.expect;

describe("test reserved words", () => {
   it("attribute name is a reserved word", () => {
       ReservedWords.forEach((word) => {
           const qualifiedWord = DynamoClient.getQualifiedAttributeName(word.toLowerCase());
           expect(qualifiedWord.charAt(0)).to.equal("#");
           expect(qualifiedWord.substring(1)).to.equal(word.toLowerCase());
       });

       ReservedWords.forEach((word) => {
           const qualifiedWord = DynamoClient.getQualifiedAttributeName(word);
           expect(qualifiedWord.charAt(0)).to.equal("#");
           expect(qualifiedWord.substring(1)).to.equal(word);
       });
   });

   it("attribute name is not a reserved word", () => {
       const word = "testName";
       const qualifiedWord = DynamoClient.getQualifiedAttributeName(word);
       expect(qualifiedWord.charAt(0)).not.to.equal("#");
       expect(qualifiedWord).to.equal(word);
   });
});

describe("test dynamo client endpoints", () => {
    const mockDocumentClient: DocumentClient = sinon.createStubInstance(DocumentClient);

    const tableName: string = "Test";

    interface ITestType { test: string; }
    const key: ITestType = { test: "test" };

    const error: any = {
        code: "500",
        message: "error",
    } as AWSError;

    it("test put endpoint (success)", () => {
        const mockOutput: PutItemOutput = {
            Attributes: key as AttributeMap,
        };

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(mockOutput));

        (mockDocumentClient.put as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<boolean> = dynamoClient.put(tableName, key);
        expect(mockDocumentClient.put).to.have.been.calledWith({
            TableName: tableName,
            Item: key,
        });

        return result.then((result) => {
            expect(result).to.be.true;
        }, () => expect(true).to.be.false);
    });

    it("test put endpoint (failure)", () => {
        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.reject(error));

        (mockDocumentClient.put as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<boolean> = dynamoClient.put(tableName, key);
        expect(mockDocumentClient.put).to.have.been.calledWith({
            TableName: tableName,
            Item: key,
        });

        return result.then(() => expect(true).to.be.false,
            (err) => expect(err).to.equal(error));
    });

    it("test scan endpoint (success)", () => {
        const mockOutput: ScanOutput = {
            Items: [
               key as AttributeMap,
            ],
        };

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(mockOutput));

        (mockDocumentClient.scan as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap[]> = dynamoClient.scan<ITestType>(tableName);
        expect(mockDocumentClient.scan).to.have.been.calledWith({
            TableName: tableName,
        });

        return result.then((items) => {
            expect(items).to.deep.equal([key]);
        }, () => expect(true).to.be.false);
    });

    it("test scan endpoint (failure)", () => {
        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(Promise.reject(error)));

        (mockDocumentClient.scan as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap[]> = dynamoClient.scan<ITestType>(tableName);
        expect(mockDocumentClient.scan).to.have.been.calledWith({
            TableName: tableName,
        });

        return result.then(() => expect(true).to.be.false,
            (err) => expect(err).to.equal(error));
    });

    it("test get endpoint (success)", () => {
        const mockOutput: GetItemOutput = {
            Item: key as AttributeMap,
        };

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(mockOutput));

        (mockDocumentClient.get as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap> =
            dynamoClient.get<ITestType, ITestType>(tableName, key);
        expect(mockDocumentClient.get).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });

        return result.then((item) => {
            expect(item).to.equal(key);
        }, () => expect(true).to.be.false);
    });

    it("test get endpoint (failure)", () => {
        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.reject(error));

        (mockDocumentClient.get as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap> =
            dynamoClient.get<ITestType, ITestType>(tableName, key);
        expect(mockDocumentClient.get).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });

        return result.then(() => expect(true).to.be.false,
            (err) => expect(err).to.equal(error));
    });

    it("test update endpoint (success)", () => {
        const updatedItem: ITestType = {
            test: "updatedTest",
        };

        const mockOutput: UpdateItemOutput = {
            Attributes: key as AttributeMap,
        };

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(mockOutput));

        (mockDocumentClient.update as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap> =
            dynamoClient.update<ITestType, ITestType>(tableName, key, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
            ReturnValues: "ALL_NEW",
            UpdateExpression: "SET test= :test",
            ExpressionAttributeValues: {
                ":test": updatedItem.test,
            },
        });

        return result.then((item) => {
            expect(item).to.equal(key);
        }, () => expect(true).to.be.false);
    });

    it("test update endpoint (failure)", () => {
        const updatedItem: ITestType = {
            test: "updatedTest",
        };

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.reject(error));

        (mockDocumentClient.update as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap> =
            dynamoClient.update<ITestType, ITestType>(tableName, key, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
            ReturnValues: "ALL_NEW",
            UpdateExpression: "SET test= :test",
            ExpressionAttributeValues: {
                ":test": updatedItem.test,
            },
        });

        return result.then(() => expect(true).to.be.false,
            (err) => expect(err).to.equal(error));
    });

    it("test update endpoint (reserved words)", () => {
        interface IReservedType { name: string; }
        const testItem: IReservedType = {
            name: "name",
        };
        const updatedItem: IReservedType = {
            name: "updatedName",
        };

        const mockOutput: UpdateItemOutput = {
            Attributes: testItem as AttributeMap,
        };

        (mockDocumentClient.update as SinonStub).reset();

        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve(mockOutput));

        (mockDocumentClient.update as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<AttributeMap> =
            dynamoClient.update<IReservedType, IReservedType>(tableName, testItem, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: testItem,
            ReturnValues: "ALL_NEW",
            UpdateExpression: "SET #name= :name",
            ExpressionAttributeValues: {
                ":name": updatedItem.name,
            },
            ExpressionAttributeNames: {
                "#name": "name",
            },
        });

        return result.then((item) => {
            expect(item).to.equal(testItem);
        }, () => expect(true).to.be.false);
    });

    it("test delete endpoint (success)", () => {
        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.resolve({} as DeleteItemOutput));

        (mockDocumentClient.delete as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<boolean> =
            dynamoClient.delete<ITestType>(tableName, key);
        expect(mockDocumentClient.delete).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });

        return result.then((res) => expect(res).to.be.true,
            () => expect(true).to.be.false);
    });

    it("test delete endpoint (failure)", () => {
        const mockRequest = sinon.createStubInstance(Request);
        (mockRequest.promise as SinonStub).returns(Promise.reject(error));

        (mockDocumentClient.delete as SinonStub).returns(mockRequest);
        const dynamoClient: DynamoClient = new DynamoClient(null, mockDocumentClient);

        const result: Promise<boolean> =
            dynamoClient.delete<ITestType>(tableName, key);
        expect(mockDocumentClient.delete).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });

        return result.then(() => expect(true).to.be.false,
            (err) => expect(err).to.equal(error));
    });
});
