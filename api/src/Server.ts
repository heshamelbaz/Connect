import * as debug from "debug";
import * as http from "http";
import {App} from "./App";

/**
 * Http server listening for requests
 */
export class Server {
    private static readonly DEFAULT_PORT: number = 3000;

    /**
     * Convert port string to a number, return default port otherwise
     * @param {string} portString
     * @returns {number}
     */
    private static normalizePort(portString: string): number {
        const port: number = parseInt(portString, 10);

        if (port >= 0) {
            return port;
        }

        return Server.DEFAULT_PORT;
    }

    private server: http.Server;
    private port: number;

    /**
     * Constructor to initialize server with port to listen to
     * @param {string} portString - port to listen to
     */
    constructor(portString: string) {
        this.port = Server.normalizePort(portString);
        this.server = http.createServer(new App(this.port).getExpressApplication());

        this.onError = this.onError.bind(this);
        this.onListening = this.onListening.bind(this);
    }

    /**
     * Start listening on the port
     */
    public listen(): void {
        this.server.listen(this.port);
        this.server.on("error", this.onError);
        this.server.on("listening", this.onListening);
    }

    /**
     * Get the port used in the server
     * @returns {number}
     */
    public getPort(): number {
        return this.port;
    }

    /**
     * Method called when server encounters an error
     * @param error - error object
     */
    private onError(error: any) {
        if (error.syscall !== "listen") {
            throw error;
        }

        const bind = "Port " + this.port;

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
    }

    /**
     * Method called when server starts listening
     */
    private onListening(): void {
        const address = this.server.address();
        const bind = typeof address === "string"
            ? "pipe " + address
            : "port " + address.port;
        debug("Listening on " + bind);
    }
}
