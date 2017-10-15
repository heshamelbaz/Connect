import {ITable} from "../model/ITable";

/**
 * Component table definition
 * @type {ITable}
 */
export const Component: ITable = {
    name: "Component",
    columns: [
        { name: "name", type: "S" },
    ],
    hashKey: "name",
    sortKeys: [],
};
