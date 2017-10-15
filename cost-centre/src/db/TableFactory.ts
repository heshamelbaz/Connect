import {AttributeDefinitions, CreateTableInput, KeySchema} from "aws-sdk/clients/dynamodb";
import {IAttribute} from "./model/IAttribute";
import {ITable} from "./model/ITable";

/**
 * Factory to build DynamoDB Tables from definitions
 */
export class TableFactory {

    /**
     * Build table definitions
     * @param {IAttribute[]} columns
     * @returns {DynamoDB.AttributeDefinitions}
     */
    private static buildTableDefinitions(columns: IAttribute[]): AttributeDefinitions {
        return columns.map((column: IAttribute) => {
            return {
                AttributeName: column.name,
                AttributeType: column.type,
            };
        });
    }

    /**
     * Build table keys
     * @param {string} hashKey
     * @param {string[]} sortKeys
     * @returns {DynamoDB.KeySchema}
     */
    private static buildTableKeys(hashKey: string, sortKeys: string[]): KeySchema {
        const keys: KeySchema = [];

        // Add hash key if available
        if (hashKey) {
            keys.push({
                AttributeName: hashKey,
                KeyType: "HASH",
            });
        }

        // Add sort keys
        keys.concat(sortKeys.map((key: string) => {
            return {
                AttributeName: key,
                KeyType: "RANGE",
            };
        }));

        return keys;
    }

    private rcu: number;
    private wcu: number;

    /**
     * Default constructor
     * @param {number} rcu - Provisioned Read Capacity Units
     * @param {number} wcu - Provisioned Write Capacity Units
     */
    constructor(rcu: number, wcu: number) {
        this.rcu = rcu;
        this.wcu = wcu;
    }

    /**
     * Build DynamoDB table from definition
     * @param {ITable} table
     * @returns {DynamoDB.CreateTableInput}
     */
    public buildTable(table: ITable): CreateTableInput {
        return {
            TableName: table.name,
            AttributeDefinitions: TableFactory.buildTableDefinitions(table.columns),
            KeySchema: TableFactory.buildTableKeys(table.hashKey, table.sortKeys),
            ProvisionedThroughput: {
                ReadCapacityUnits: this.rcu,
                WriteCapacityUnits: this.wcu,
            },
        };
    }
}
