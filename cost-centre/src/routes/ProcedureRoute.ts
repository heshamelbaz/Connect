import {DynamoClient} from "../db/DynamoClient";
import {IProcedure, IProcedureKey} from "../models/Procedure";
import {DynamoRoute} from "./DynamoRoute";

/**
 * Route for procedure dynamo table
 */
export class ProcedureRoute extends DynamoRoute<IProcedure, IProcedureKey> {

    /**
     * Default constructor
     * @param {DynamoClient} dynamoClient
     */
    constructor(dynamoClient: DynamoClient) {
        super("Procedure", dynamoClient);
    }
    /**
     * {@inheritDoc}
     */
    protected getKeySample(): IProcedureKey {
        return {
            name: "",
        };
    }
}
