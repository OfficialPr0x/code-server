"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = void 0;
const httpProxyModule = __importStar(require("http-proxy"));
const net_1 = require("net");
const http_1 = require("http");
const http_2 = require("../common/http");
// Create the proxy server instance
const httpProxy = httpProxyModule;
exports.proxy = httpProxy.createProxyServer({});
// The error handler catches when the proxy fails to connect (for example when
// there is nothing running on the target port).
exports.proxy.on("error", (error, _, res) => {
    // the types say, writeHead() will not exist on web socket requests (nor will
    // status() from Express).  But writing out the code manually does not work
    // for regular requests thus the branching behavior.
    if (res instanceof http_1.ServerResponse && typeof res.writeHead !== "undefined") {
        res.writeHead(http_2.HttpCode.ServerError);
        res.end(error.message);
    }
    else {
        // Fall back to raw socket write for WebSocket
        if (res instanceof net_1.Socket) {
            res.end(`HTTP/1.1 ${http_2.HttpCode.ServerError} ${error.message}\r\n\r\n`);
        }
        else {
            console.error("Unknown response type in proxy error handler:", res);
        }
    }
});
// Intercept the response to rewrite absolute redirects against the base path.
// Is disabled when the request has no base path which means /absproxy is in use.
exports.proxy.on("proxyRes", (res, req) => {
    if (res.headers.location && res.headers.location.startsWith("/") && req.base) {
        res.headers.location = req.base + res.headers.location;
    }
});
