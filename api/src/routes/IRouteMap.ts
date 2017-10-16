import {RequestHandler} from "express";

export interface IRoutes {
    get: IRouteMap;
    post: IRouteMap;
    put: IRouteMap;
    delete: IRouteMap;
}

interface IRouteMap {
    [route: string]: RequestHandler;
}
