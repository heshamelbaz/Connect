import {ITable} from "../model/ITable";

/**
 * Procedure table definition
 * @type {ITable}
 */
export const Procedure: ITable = {
    name: "Procedure",
    columns: [
        { name: "name", type: "S" },
    ],
    hashKey: "name",
    sortKeys: [],
};
