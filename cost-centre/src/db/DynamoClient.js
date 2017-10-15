"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
var debug = require("debug");
var ReservedWords_1 = require("./ReservedWords");
/**
 * DyanmoDB client used manipulate data and create tables
 */
var DynamoClient = /** @class */ (function () {
    /**
     * Default constructor
     * @param {DynamoDB} dynamoDB - optional for testing
     * @param {DocumentClient} documentClient - optional for testing
     */
    function DynamoClient(dynamoDB, documentClient) {
        // TODO: move endpoint and region to config
        // Update global AWS configuration
        var awsConfiguration = {
            region: "eu-central-1",
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
        AWS.config.update(awsConfiguration);
        // Initialize DynamoDB with database endpoint
        var dynamoClientConfiguration = { endpoint: "http://192.168.98.100:3050" };
        this.dynamoDB = dynamoDB || new AWS.DynamoDB(dynamoClientConfiguration);
        this.documentClient = documentClient || new AWS.DynamoDB.DocumentClient(dynamoClientConfiguration);
    }
    /**
     * Return attribute name with prefix # if it's a reserved word
     * @param {string} attribute
     * @returns {string}
     */
    DynamoClient.getQualifiedAttributeName = function (attribute) {
        if (ReservedWords_1.ReservedWords.indexOf(attribute.toUpperCase()) >= 0) {
            return "#" + attribute;
        }
        else {
            return attribute;
        }
    };
    /**
     * Create a new table
     * @param {DynamoDB.CreateTableInput} tableParams
     */
    DynamoClient.prototype.createTable = function (tableParams) {
        this.dynamoDB.createTable(tableParams, function (err, data) {
            if (err) {
                debug("unable to create table table with err: " + JSON.stringify(err));
            }
            else {
                debug("table created with params: " + JSON.stringify(data));
            }
        });
    };
    /**
     * Delete a table
     * @param {DynamoDB.DeleteTableInput} tableParams
     */
    DynamoClient.prototype.deleteTable = function (tableParams) {
        this.dynamoDB.deleteTable(tableParams, function (err, data) {
            if (err) {
                debug("unable to delete table table with err: " + JSON.stringify(err));
            }
            else {
                debug("table deleted with params: " + JSON.stringify(data));
            }
        });
    };
    /**
     * Put item in a given table
     * @param {string} table
     * @param item
     * @returns {Promise<DocumentClient.AttributeMap>}
     */
    DynamoClient.prototype.put = function (table, item) {
        return this.documentClient.put({
            TableName: table,
            Item: item,
        }).promise()
            .then(function (result) { return result.Attributes; });
    };
    /**
     * List all items in a table
     * @param {string} table
     * @returns {Promise<DocumentClient.AttributeMap[]>}
     */
    DynamoClient.prototype.scan = function (table) {
        return this.documentClient.scan({
            TableName: table,
        }).promise()
            .then(function (result) { return result.Items; });
    };
    /**
     * Get item from table using a key
     * @param {string} table
     * @param {K} key
     * @returns {Promise<DocumentClient.AttributeMap>}
     */
    DynamoClient.prototype.get = function (table, key) {
        return this.documentClient.get({
            TableName: table,
            Key: key,
        }).promise()
            .then(function (result) { return result.Item; });
    };
    /**
     * Update item in table using a key
     * @param {string} table
     * @param {K} key
     * @param {Partial<T>} updatedAttributes
     * @returns {Promise<boolean>}
     */
    DynamoClient.prototype.update = function (table, key, updatedAttributes) {
        // Build a map with all new expression values, :x :y
        var expressionValues = Object.keys(updatedAttributes)
            .reduce(function (map, k) {
            map[":" + k] = updatedAttributes[k];
            return map;
        }, {});
        // Build reserved words expression names
        var expressionNames = Object.keys(updatedAttributes)
            .map(function (attribute) { return DynamoClient.getQualifiedAttributeName(attribute); })
            .filter(function (attributeName) { return attributeName.startsWith("#"); })
            .reduce(function (map, k) {
            map[k] = k.substring(1);
            return map;
        }, {});
        // Build the expression as "SET x = :x, y = :y
        var expression = "SET " + Object.keys(updatedAttributes)
            .map(function (attribute) { return DynamoClient.getQualifiedAttributeName(attribute) + "= :" + attribute; })
            .join(",");
        return this.documentClient.update(__assign({ TableName: table, Key: key, UpdateExpression: expression, ExpressionAttributeValues: expressionValues }, (Object.keys(expressionNames).length === 0 ? {} : { ExpressionAttributeNames: expressionNames }))).promise()
            .then(function (result) { return result.Attributes; });
    };
    /**
     * Delete item from table using a key
     * @param {string} table
     * @param {K} key
     * @returns {Promise<boolean>}
     */
    DynamoClient.prototype.delete = function (table, key) {
        return this.documentClient.delete({
            TableName: table,
            Key: key,
        }).promise()
            .then(function (result) { return true; });
    };
    return DynamoClient;
}());
exports.DynamoClient = DynamoClient;
