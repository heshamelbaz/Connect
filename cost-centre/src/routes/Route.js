"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var Route = /** @class */ (function () {
    /**
     * Default constructor
     */
    function Route() {
        this.router = express_1.Router();
        this.initializeRoutes();
    }
    /**
     * Get Express Router member used to intercept http calls
     * @returns {e.Router}
     */
    Route.prototype.getRouter = function () {
        return this.router;
    };
    /**
     * Attach routes to Express Router to expose API
     */
    Route.prototype.initializeRoutes = function () {
        var _this = this;
        var routes = this.bindRoutes();
        // Initialize get routes
        Object.keys(routes.get)
            .forEach(function (route) { return _this.router.get(route, routes.get[route]); });
        // Initialize post routes
        Object.keys(routes.post)
            .forEach(function (route) { return _this.router.post(route, routes.post[route]); });
        // Initialize update routes
        Object.keys(routes.put)
            .forEach(function (route) { return _this.router.put(route, routes.put[route]); });
        // Initialize delete routes
        Object.keys(routes.delete)
            .forEach(function (route) { return _this.router.delete(route, routes.delete[route]); });
    };
    return Route;
}());
exports.Route = Route;
