"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug");
var http = require("http");
var App_1 = require("./App");
/**
 * Http server listening for requests
 */
var Server = /** @class */ (function () {
    /**
     * Constructor to initialize server with port to listen to
     * @param {string} portString - port to listen to
     */
    function Server(portString) {
        this.port = Server.normalizePort(portString);
        this.server = http.createServer(new App_1.App(this.port).getExpressApplication());
        this.onError = this.onError.bind(this);
        this.onListening = this.onListening.bind(this);
    }
    /**
     * Convert port string to a number, return default port otherwise
     * @param {string} portString
     * @returns {number}
     */
    Server.normalizePort = function (portString) {
        var port = parseInt(portString, 10);
        if (port >= 0) {
            return port;
        }
        return Server.DEFAULT_PORT;
    };
    /**
     * Start listening on the port
     */
    Server.prototype.listen = function () {
        this.server.listen(this.port);
        this.server.on("error", this.onError);
        this.server.on("listening", this.onListening);
    };
    /**
     * Get the port used in the server
     * @returns {number}
     */
    Server.prototype.getPort = function () {
        return this.port;
    };
    /**
     * Method called when server encounters an error
     * @param error - error object
     */
    Server.prototype.onError = function (error) {
        if (error.syscall !== "listen") {
            throw error;
        }
        var bind = "Port " + this.port;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
    /**
     * Method called when server starts listening
     */
    Server.prototype.onListening = function () {
        var address = this.server.address();
        var bind = typeof address === "string"
            ? "pipe " + address
            : "port " + address.port;
        debug("Listening on " + bind);
    };
    Server.DEFAULT_PORT = 3000;
    return Server;
}());
exports.Server = Server;
