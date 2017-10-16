#!/usr/bin/env node

import {Server} from "../Server";

// Run server
const server = new Server(process.env.PORT || "3000");
server.listen();
