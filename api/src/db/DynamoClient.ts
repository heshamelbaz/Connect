import * as AWS from "aws-sdk";
import {
    ClientConfiguration, CreateTableInput, DeleteTableInput, ExpressionAttributeNameMap,
    ExpressionAttributeValueMap,
} from "aws-sdk/clients/dynamodb";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import * as debug from "debug";
import AttributeMap = DocumentClient.AttributeMap;
import {ConfigurationOptions} from "aws-sdk/lib/config";
import {IGenericMap} from "../models/IGenericMap";
import {ReservedWords} from "./ReservedWords";

/**
 * DyanmoDB client used manipulate data and create tables
 */
export class DynamoClient {

    /**
     * Return attribute name with prefix # if it's a reserved word
     * @param {string} attribute
     * @returns {string}
     */
    public static getQualifiedAttributeName(attribute: string) {
        if (ReservedWords.indexOf(attribute.toUpperCase()) >= 0) {
            return "#" + attribute;
        } else {
            return attribute;
        }
    }

    private dynamoDB: AWS.DynamoDB;
    private documentClient: AWS.DynamoDB.DocumentClient;

    /**
     * Default constructor
     * @param {DynamoDB} dynamoDB - optional for testing
     * @param {DocumentClient} documentClient - optional for testing
     */
    constructor(dynamoDB?: AWS.DynamoDB, documentClient?: AWS.DynamoDB.DocumentClient) {
        // TODO: move endpoint and region to config

        // Update global AWS configuration
        const awsConfiguration: ConfigurationOptions = {
            region: "eu-central-1",
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
        AWS.config.update(awsConfiguration);

        // Initialize DynamoDB with database endpoint
        const dynamoClientConfiguration: ClientConfiguration = { endpoint: "http://192.168.98.100:3050" };
        this.dynamoDB = dynamoDB || new AWS.DynamoDB(dynamoClientConfiguration);
        this.documentClient = documentClient || new AWS.DynamoDB.DocumentClient(dynamoClientConfiguration);
    }

    /**
     * Create a new table
     * @param {DynamoDB.CreateTableInput} tableParams
     */
    public createTable(tableParams: CreateTableInput): void {
        this.dynamoDB.createTable(tableParams, (err, data) => {
            if (err) {
                debug("unable to create table table with err: " + JSON.stringify(err));
            } else {
                debug("table created with params: " + JSON.stringify(data));
            }
        });
    }

    /**
     * Delete a table
     * @param {DynamoDB.DeleteTableInput} tableParams
     */
    public deleteTable(tableParams: DeleteTableInput): void {
        this.dynamoDB.deleteTable(tableParams, (err, data) => {
            if (err) {
                debug("unable to delete table table with err: " + JSON.stringify(err));
            } else {
                debug("table deleted with params: " + JSON.stringify(data));
            }
        });
    }

    /**
     * Put item in a given table
     * @param {string} table
     * @param item
     * @returns {Promise<DocumentClient.AttributeMap>}
     */
    public put<T>(table: string, item: T): Promise<boolean> {
        return this.documentClient.put({
            TableName: table,
            Item: item,
        }).promise()
            .then((result) => true);
    }

    /**
     * List all items in a table
     * @param {string} table
     * @returns {Promise<DocumentClient.AttributeMap[]>}
     */
    public scan<T>(table: string): Promise<AttributeMap[]> {
        return this.documentClient.scan({
            TableName: table,
        }).promise()
            .then((result) => result.Items as T[]);
    }

    /**
     * Get item from table using a key
     * @param {string} table
     * @param {K} key
     * @returns {Promise<DocumentClient.AttributeMap>}
     */
    public get<T, K>(table: string, key: K): Promise<AttributeMap> {
        return this.documentClient.get({
            TableName: table,
            Key: key,
        }).promise()
            .then((result) => result.Item as T);
    }

    /**
     * Update item in table using a key
     * @param {string} table
     * @param {K} key
     * @param {Partial<T>} updatedAttributes
     * @returns {Promise<boolean>}
     */
    public update<T extends IGenericMap, K>(table: string,
                                            key: K,
                                            updatedAttributes: Partial<T>): Promise<AttributeMap> {
        // Build a map with all new expression values, :x :y
        const expressionValues: ExpressionAttributeValueMap = Object.keys(updatedAttributes)
            .reduce((map: ExpressionAttributeValueMap, k: string) => {
                map[":" + k] = updatedAttributes[k];
                return map;
            }, {} as ExpressionAttributeValueMap);

        // Build reserved words expression names
        const expressionNames: ExpressionAttributeNameMap = Object.keys(updatedAttributes)
            .map((attribute) => DynamoClient.getQualifiedAttributeName(attribute))
            .filter((attributeName) => attributeName.startsWith("#"))
            .reduce((map: ExpressionAttributeNameMap, k: string) => {
                map[k] = k.substring(1);
                return map;
            }, {} as ExpressionAttributeNameMap);

        // Build the expression as "SET x = :x, y = :y
        const expression: string = "SET " + Object.keys(updatedAttributes)
            .map((attribute) => DynamoClient.getQualifiedAttributeName(attribute) + "= :" + attribute)
            .join(",");

        return this.documentClient.update({
            TableName: table,
            Key: key,
            ReturnValues: "ALL_NEW",
            UpdateExpression: expression,
            ExpressionAttributeValues: expressionValues,
            ...(Object.keys(expressionNames).length === 0 ? {} : { ExpressionAttributeNames: expressionNames}),
        }).promise()
            .then((result) => result.Attributes as T);
    }

    /**
     * Delete item from table using a key
     * @param {string} table
     * @param {K} key
     * @returns {Promise<boolean>}
     */
    public delete<K>(table: string, key: K): Promise<boolean> {
        return this.documentClient.delete({
            TableName: table,
            Key: key,
        }).promise()
            .then((result) => true);
    }
}
