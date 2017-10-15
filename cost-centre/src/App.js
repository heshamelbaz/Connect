"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var logger = require("morgan");
var DynamoClient_1 = require("./db/DynamoClient");
var ComponentRoute_1 = require("./routes/ComponentRoute");
/**
 * Express application that handles API calls
 */
var App = /** @class */ (function () {
    /**
     * Constructor to initialize express application with port, middleware, routes and error handlers
     * @param {number} port
     */
    function App(port) {
        this.express = express();
        this.express.set("port", port);
        this.dynamoClient = new DynamoClient_1.DynamoClient();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandler();
    }
    /**
     * A middleware that intercepts calls with errors and wraps them in 500's
     * @param err
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    App.handleError = function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get("env") === "development" ? err : {};
        // render the error page
        res.status(err.status || 500);
        res.send(err);
    };
    /**
     * Get express application created
     * @returns {e.Express}
     */
    App.prototype.getExpressApplication = function () {
        return this.express;
    };
    /**
     * Initialize all middleware used to intercept API calls
     */
    App.prototype.initializeMiddleware = function () {
        this.express.use(logger("dev"));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    };
    /**
     * Initialize all routes of the API
     */
    App.prototype.initializeRoutes = function () {
        this.express.use("/components", new ComponentRoute_1.ComponentRoute(this.dynamoClient).getRouter());
    };
    /**
     * Initialize error handling function that handles erroneous requests
     */
    App.prototype.initializeErrorHandler = function () {
        this.express.use(App.handleError);
    };
    return App;
}());
exports.App = App;
