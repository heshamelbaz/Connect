import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {Component} from "./definitions/Component";
import {TableFactory} from "./TableFactory";
import CreateTableInput = DocumentClient.CreateTableInput;
import {DynamoClient} from "./DynamoClient";

/**
 * Script used to initialize DynamoDB database with documents schema
 */
export class DatabaseInitializer {

    /**
     * Initialize DynamoDB database
     */
    public static initialize() {
        DatabaseInitializer.initializeDatabase();
    }

    // Provisioned Read Capacity Units
    private static readonly RCU: number = 10;
    // Provisioned Write Capacity Units
    private static readonly WCU: number = 10;

    /**
     * Create all database tables
     */
    private static initializeDatabase(): void {
        const dynamoClient: DynamoClient = new DynamoClient();
        const tablesParams: CreateTableInput[] = DatabaseInitializer.initializeTables();

        tablesParams.forEach((tableParams) => dynamoClient.deleteTable({ TableName: tableParams.TableName }));
        tablesParams.forEach((tableParams) => dynamoClient.createTable(tableParams));
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

        return tables;
    }
}

// Script entry point
DatabaseInitializer.initialize();
