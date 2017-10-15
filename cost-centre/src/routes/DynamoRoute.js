"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Route_1 = require("./Route");
/**
 * Abstract class for Express routes that wraps DynamoDB CRUD endpoints
 */
var DynamoRoute = /** @class */ (function (_super) {
    __extends(DynamoRoute, _super);
    /**
     * Default constructor
     * @param {string} tableName
     * @param {DynamoClient} dynamoClient
     */
    function DynamoRoute(tableName, dynamoClient) {
        var _this = _super.call(this) || this;
        _this.tableName = tableName;
        _this.dynamoClient = dynamoClient;
        return _this;
    }
    /**
     * Initialize CRUD operations routes for DynamoDB
     * @returns {IRoutes}
     */
    DynamoRoute.prototype.bindRoutes = function () {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.get = this.get.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        var routes = {
            get: {
                "/": this.getAll,
            },
            post: {
                "/": this.create,
            },
            put: {},
            delete: {},
        };
        var params = Object.keys(this.getKeySample()).join(":");
        routes.get["/:" + params] = this.get;
        routes.put["/:" + params] = this.update;
        routes.delete["/:" + params] = this.delete;
        return routes;
    };
    /**
     * Add new item to a table (create)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    DynamoRoute.prototype.create = function (req, res, next) {
        this.getDynamoResponse(this.dynamoClient.put(this.tableName, req.body), res);
    };
    /**
     * Get all items in a table (read)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    DynamoRoute.prototype.getAll = function (req, res, next) {
        this.getDynamoResponse(this.dynamoClient.scan(this.tableName), res);
    };
    /**
     * Get item using a key (read)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    DynamoRoute.prototype.get = function (req, res, next) {
        this.getDynamoResponse(this.dynamoClient.get(this.tableName, req.params), res);
    };
    /**
     * Update item using a key (update)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    DynamoRoute.prototype.update = function (req, res, next) {
        this.getDynamoResponse(this.dynamoClient.update(this.tableName, req.params, req.body), res);
    };
    /**
     * Delete item using a key (delete)
     * @param {e.Request} req
     * @param {e.Response} res
     * @param {e.NextFunction} next
     */
    DynamoRoute.prototype.delete = function (req, res, next) {
        this.getDynamoResponse(this.dynamoClient.delete(this.tableName, req.params), res);
    };
    /**
     * Wrap DynamoDB response as JSON response
     * @param {Promise<any>} promise
     * @param {e.Response} res
     */
    DynamoRoute.prototype.getDynamoResponse = function (promise, res) {
        promise
            .then(function (result) { return res.json(result); })
            .catch(function (err) { throw err; });
    };
    return DynamoRoute;
}(Route_1.Route));
exports.DynamoRoute = DynamoRoute;
