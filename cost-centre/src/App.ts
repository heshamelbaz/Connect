import * as bodyParser from "body-parser";
import * as express from "express";
import {ErrorRequestHandler, Express, NextFunction, Request, Response} from "express";
import * as logger from "morgan";
import {DynamoClient} from "./db/DynamoClient";
import {ComponentRoute} from "./routes/ComponentRoute";
import {ProcedureRoute} from "./routes/ProcedureRoute";
import {WorkflowRoute} from "./routes/WorkflowRoute";

/**
 * Express application that handles API calls
 */
export class App {
    /**
     * A middleware that intercepts calls with errors and wraps them in 500's
     * @param err
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    private static handleError(err: any, req: Request, res: Response, next: NextFunction): void {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.send(err);
    }

    private express: Express;
    private dynamoClient: DynamoClient;

    /**
     * Constructor to initialize express application with port, middleware, routes and error handlers
     * @param {number} port
     */
    constructor(port: number) {
        this.express = express();
        this.express.set("port", port);
        this.dynamoClient = new DynamoClient();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandler();
    }

    /**
     * Get express application created
     * @returns {e.Express}
     */
    public getExpressApplication(): Express {
        return this.express;
    }

    /**
     * Initialize all middleware used to intercept API calls
     */
    private initializeMiddleware(): void {
        this.express.use(logger("dev"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    /**
     * Initialize all routes of the API
     */
    private initializeRoutes(): void {
        this.express.use("/components", new ComponentRoute(this.dynamoClient).getRouter());
        this.express.use("/procedures", new ProcedureRoute(this.dynamoClient).getRouter());
        this.express.use("/workflows", new WorkflowRoute(this.dynamoClient).getRouter());
    }

    /**
     * Initialize error handling function that handles erroneous requests
     */
    private initializeErrorHandler(): void {
        this.express.use(App.handleError as ErrorRequestHandler);
    }
}
