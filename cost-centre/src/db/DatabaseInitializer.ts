import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {Component} from "./definitions/Component";
import {TableFactory} from "./TableFactory";
import CreateTableInput = DocumentClient.CreateTableInput;
import {Procedure} from "./definitions/Procedure";
import {DynamoClient} from "./DynamoClient";

/**
 * Script used to initialize DynamoDB database with documents schema
 */
export class DatabaseInitializer {

    /**
     * Initialize DynamoDB database
     */
    public static initialize(type: string) {
        DatabaseInitializer.initializeDatabase(type);
    }

    // Provisioned Read Capacity Units
    private static readonly RCU: number = 10;
    // Provisioned Write Capacity Units
    private static readonly WCU: number = 10;

    /**
     * Create all database tables
     */
    private static initializeDatabase(type: string): void {
        const dynamoClient: DynamoClient = new DynamoClient();
        const tablesParams: CreateTableInput[] = DatabaseInitializer.initializeTables();

        switch (type) {
            case "d": case "delete":
                tablesParams.forEach((tableParams) => dynamoClient.deleteTable({ TableName: tableParams.TableName }));
                break;
            case "c": case "create": default:
                tablesParams.forEach((tableParams) => dynamoClient.createTable(tableParams));
                break;
        }
    }

    /**
     * Create tables from table definitions
     * @returns {DocumentClient.CreateTableInput[]}
     */
    private static initializeTables(): CreateTableInput[] {
        const tableFactory: TableFactory = new TableFactory(DatabaseInitializer.RCU, DatabaseInitializer.WCU);
        const tables: CreateTableInput[] = [];

        // Add all table definitions
        tables.push(tableFactory.buildTable(Component));
        tables.push(tableFactory.buildTable(Procedure));

        return tables;
    }
}

// Script entry point
DatabaseInitializer.initialize(process.argv[0]);
