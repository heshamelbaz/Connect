import {ITable} from "../model/ITable";

/**
 * Workflow table definition
 * @type {ITable}
 */
export const Workflow: ITable = {
    name: "Workflow",
    columns: [
        { name: "name", type: "S" },
    ],
    hashKey: "name",
    sortKeys: [],
};
