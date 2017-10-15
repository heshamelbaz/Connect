"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = require("aws-sdk");
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var chai = require("chai");
require("mocha");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var DynamoClient_1 = require("../../src/db/DynamoClient");
var ReservedWords_1 = require("../../src/db/ReservedWords");
chai.use(sinonChai);
var expect = chai.expect;
describe("test reserved words", function () {
    it("attribute name is a reserved word", function () {
        ReservedWords_1.ReservedWords.forEach(function (word) {
            var qualifiedWord = DynamoClient_1.DynamoClient.getQualifiedAttributeName(word.toLowerCase());
            expect(qualifiedWord.charAt(0)).to.equal("#");
            expect(qualifiedWord.substring(1)).to.equal(word.toLowerCase());
        });
        ReservedWords_1.ReservedWords.forEach(function (word) {
            var qualifiedWord = DynamoClient_1.DynamoClient.getQualifiedAttributeName(word);
            expect(qualifiedWord.charAt(0)).to.equal("#");
            expect(qualifiedWord.substring(1)).to.equal(word);
        });
    });
    it("attribute name is not a reserved word", function () {
        var word = "testName";
        var qualifiedWord = DynamoClient_1.DynamoClient.getQualifiedAttributeName(word);
        expect(qualifiedWord.charAt(0)).not.to.equal("#");
        expect(qualifiedWord).to.equal(word);
    });
});
describe("test dynamo client endpoints", function () {
    var mockDocumentClient = sinon.createStubInstance(dynamodb_1.DocumentClient);
    var tableName = "Test";
    var key = { test: "test" };
    var error = {
        code: "500",
        message: "error",
    };
    it("test put endpoint (success)", function () {
        var mockOutput = {
            Attributes: key,
        };
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(mockOutput));
        mockDocumentClient.put.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.put(tableName, key);
        expect(mockDocumentClient.put).to.have.been.calledWith({
            TableName: tableName,
            Item: key,
        });
        return result.then(function (attributeMap) {
            expect(attributeMap).to.equal(key);
        }, function () { return expect(true).to.be.false; });
    });
    it("test put endpoint (failure)", function () {
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.reject(error));
        mockDocumentClient.put.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.put(tableName, key);
        expect(mockDocumentClient.put).to.have.been.calledWith({
            TableName: tableName,
            Item: key,
        });
        return result.then(function () { return expect(true).to.be.false; }, function (err) { return expect(err).to.equal(error); });
    });
    it("test scan endpoint (success)", function () {
        var mockOutput = {
            Items: [
                key,
            ],
        };
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(mockOutput));
        mockDocumentClient.scan.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.scan(tableName);
        expect(mockDocumentClient.scan).to.have.been.calledWith({
            TableName: tableName,
        });
        return result.then(function (items) {
            expect(items).to.deep.equal([key]);
        }, function () { return expect(true).to.be.false; });
    });
    it("test scan endpoint (failure)", function () {
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(Promise.reject(error)));
        mockDocumentClient.scan.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.scan(tableName);
        expect(mockDocumentClient.scan).to.have.been.calledWith({
            TableName: tableName,
        });
        return result.then(function () { return expect(true).to.be.false; }, function (err) { return expect(err).to.equal(error); });
    });
    it("test get endpoint (success)", function () {
        var mockOutput = {
            Item: key,
        };
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(mockOutput));
        mockDocumentClient.get.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.get(tableName, key);
        expect(mockDocumentClient.get).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });
        return result.then(function (item) {
            expect(item).to.equal(key);
        }, function () { return expect(true).to.be.false; });
    });
    it("test get endpoint (failure)", function () {
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.reject(error));
        mockDocumentClient.get.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.get(tableName, key);
        expect(mockDocumentClient.get).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });
        return result.then(function () { return expect(true).to.be.false; }, function (err) { return expect(err).to.equal(error); });
    });
    it("test update endpoint (success)", function () {
        var updatedItem = {
            test: "updatedTest",
        };
        var mockOutput = {
            Attributes: key,
        };
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(mockOutput));
        mockDocumentClient.update.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.update(tableName, key, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
            UpdateExpression: "SET test= :test",
            ExpressionAttributeValues: {
                ":test": updatedItem.test,
            },
        });
        return result.then(function (item) {
            expect(item).to.equal(key);
        }, function () { return expect(true).to.be.false; });
    });
    it("test update endpoint (failure)", function () {
        var updatedItem = {
            test: "updatedTest",
        };
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.reject(error));
        mockDocumentClient.update.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.update(tableName, key, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
            UpdateExpression: "SET test= :test",
            ExpressionAttributeValues: {
                ":test": updatedItem.test,
            },
        });
        return result.then(function () { return expect(true).to.be.false; }, function (err) { return expect(err).to.equal(error); });
    });
    it("test update endpoint (reserved words)", function () {
        var testItem = {
            name: "name",
        };
        var updatedItem = {
            name: "updatedName",
        };
        var mockOutput = {
            Attributes: testItem,
        };
        mockDocumentClient.update.reset();
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve(mockOutput));
        mockDocumentClient.update.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.update(tableName, testItem, updatedItem);
        expect(mockDocumentClient.update).to.have.been.calledWith({
            TableName: tableName,
            Key: testItem,
            UpdateExpression: "SET #name= :name",
            ExpressionAttributeValues: {
                ":name": updatedItem.name,
            },
            ExpressionAttributeNames: {
                "#name": "name",
            },
        });
        return result.then(function (item) {
            expect(item).to.equal(testItem);
        }, function () { return expect(true).to.be.false; });
    });
    it("test delete endpoint (success)", function () {
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.resolve({}));
        mockDocumentClient.delete.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.delete(tableName, key);
        expect(mockDocumentClient.delete).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });
        return result.then(function (res) { return expect(res).to.be.true; }, function () { return expect(true).to.be.false; });
    });
    it("test delete endpoint (failure)", function () {
        var mockRequest = sinon.createStubInstance(aws_sdk_1.Request);
        mockRequest.promise.returns(Promise.reject(error));
        mockDocumentClient.delete.returns(mockRequest);
        var dynamoClient = new DynamoClient_1.DynamoClient(null, mockDocumentClient);
        var result = dynamoClient.delete(tableName, key);
        expect(mockDocumentClient.delete).to.have.been.calledWith({
            TableName: tableName,
            Key: key,
        });
        return result.then(function () { return expect(true).to.be.false; }, function (err) { return expect(err).to.equal(error); });
    });
});
