import {DynamoClient} from "../db/DynamoClient";
import {IComponent, IComponentKey} from "../models/Component";
import {DynamoRoute} from "./DynamoRoute";

/**
 * Route for component dynamo table
 */
export class ComponentRoute extends DynamoRoute<IComponent, IComponentKey> {

    /**
     * Default constructor
     * @param {DynamoClient} dynamoClient
     */
    constructor(dynamoClient: DynamoClient) {
        super("Component", dynamoClient);
    }
    /**
     * {@inheritDoc}
     */
    protected getKeySample(): IComponentKey {
        return {
            name: "",
        };
    }
}
