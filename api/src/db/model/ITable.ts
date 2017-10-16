import {IAttribute} from "./IAttribute";

/**
 * DynamoDB Table
 */
export interface ITable {
    name: string;
    columns: IAttribute[];
    hashKey: string;
    sortKeys: string[];
}
