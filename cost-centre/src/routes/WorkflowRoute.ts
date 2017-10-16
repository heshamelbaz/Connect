import {DynamoClient} from "../db/DynamoClient";
import {IWorkflow, IWorkflowKey} from "../models/Workflow";
import {DynamoRoute} from "./DynamoRoute";

/**
 * Route for procedure dynamo table
 */
export class WorkflowRoute extends DynamoRoute<IWorkflow, IWorkflowKey> {

    /**
     * Default constructor
     * @param {DynamoClient} dynamoClient
     */
    constructor(dynamoClient: DynamoClient) {
        super("Workflow", dynamoClient);
    }
    /**
     * {@inheritDoc}
     */
    protected getKeySample(): IWorkflowKey {
        return {
            name: "",
        };
    }
}
