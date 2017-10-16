import {Router} from "express";
import {IRoutes} from "./IRouteMap";

export abstract class Route {
    private router: Router;

    /**
     * Default constructor
     */
    constructor() {
        this.router = Router();

        this.initializeRoutes();
    }

    /**
     * Get Express Router member used to intercept http calls
     * @returns {e.Router}
     */
    public getRouter(): Router {
        return this.router;
    }

    /**
     * Abstract method used by children to bind and create routes map
     * @returns {IRoutes}
     */
    protected abstract bindRoutes(): IRoutes;

    /**
     * Attach routes to Express Router to expose API
     */
    private initializeRoutes(): void {
        const routes: IRoutes = this.bindRoutes();

        // Initialize get routes
        Object.keys(routes.get)
            .forEach((route) => this.router.get(route, routes.get[route]));

        // Initialize post routes
        Object.keys(routes.post)
            .forEach((route) => this.router.post(route, routes.post[route]));

        // Initialize update routes
        Object.keys(routes.put)
            .forEach((route) => this.router.put(route, routes.put[route]));

        // Initialize delete routes
        Object.keys(routes.delete)
            .forEach((route) => this.router.delete(route, routes.delete[route]));
    }
}
