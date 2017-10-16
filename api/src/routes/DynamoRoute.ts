import {NextFunction, Request, Response} from "express";
import {DynamoClient} from "../db/DynamoClient";
import {IRoutes} from "./IRouteMap";
import {Route} from "./Route";

/**
 * Abstract class for Express routes that wraps DynamoDB CRUD endpoints
 */
export abstract class DynamoRoute<T, K> extends Route {
    private tableName: string;
    private dynamoClient: DynamoClient;

    /**
     * Default constructor
     * @param {string} tableName
     * @param {DynamoClient} dynamoClient
     */
    constructor(tableName: string, dynamoClient: DynamoClient) {
        super();

        this.tableName = tableName;
        this.dynamoClient = dynamoClient;
    }

    /**
     * Get key sample to build keyed routes
     * @returns {K}
     */
    protected abstract getKeySample(): K;

    /**
     * Initialize CRUD operations routes for DynamoDB
     * @returns {IRoutes}
     */
    protected bindRoutes(): IRoutes {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.get = this.get.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);

        const routes: IRoutes = {
            get: {
                "/": this.getAll,
            },
            post: {
                "/": this.create,
            },
            put: {},
            delete: {},
        };

        const params: string = Object.keys(this.getKeySample()).join(":");
        routes.get["/:" + params] = this.get;
        routes.put["/:" + params] = this.update;
        routes.delete["/:" + params] = this.delete;
        return routes;
    }

    /**
     * Add new item to a table (create)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private create(req: Request, res: Response, next: NextFunction): void {
        this.getDynamoResponse(this.dynamoClient.put(this.tableName, req.body as T), res);
    }

    /**
     * Get all items in a table (read)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private getAll(req: Request, res: Response, next: NextFunction): void {
        this.getDynamoResponse(this.dynamoClient.scan<T>(this.tableName), res);
    }

    /**
     * Get item using a key (read)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private get(req: Request, res: Response, next: NextFunction): void {
        this.getDynamoResponse(this.dynamoClient.get<T, K>(this.tableName, req.params as K), res);
    }

    /**
     * Update item using a key (update)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private update(req: Request, res: Response, next: NextFunction): void {
        this.getDynamoResponse(
            this.dynamoClient.update<T, K>(this.tableName, req.params as K, req.body as Partial<T>), res);
    }

    /**
     * Delete item using a key (delete)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private delete(req: Request, res: Response, next: NextFunction): void {
        this.getDynamoResponse(this.dynamoClient.delete<K>(this.tableName, req.params as K), res);
    }

    /**
     * Wrap DynamoDB response as JSON response
     * @param {Promise<any>} promise
     * @param {e.Response} res
     */
    private getDynamoResponse(promise: Promise<any>, res: Response): void {
        promise
            .then((result) => res.json(result))
            .catch((err) => { throw err; });
    }
}
