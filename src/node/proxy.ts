import * as httpProxyModule from "http-proxy"
import { Socket } from "net"
import { ServerResponse } from "http"
import { HttpCode } from "../common/http"

// Create the proxy server instance
const httpProxy = httpProxyModule as any;
export const proxy = httpProxy.createProxyServer({})

// The error handler catches when the proxy fails to connect (for example when
// there is nothing running on the target port).
proxy.on("error", (error, _, res) => {
  // the types say, writeHead() will not exist on web socket requests (nor will
  // status() from Express).  But writing out the code manually does not work
  // for regular requests thus the branching behavior.
  if (res instanceof ServerResponse && typeof res.writeHead !== "undefined") {
    res.writeHead(HttpCode.ServerError)
    res.end(error.message)
  } else {
    // Fall back to raw socket write for WebSocket
    if (res instanceof Socket) {
      res.end(`HTTP/1.1 ${HttpCode.ServerError} ${error.message}\r\n\r\n`)
    } else {
      console.error("Unknown response type in proxy error handler:", res);
    }
  }
})

// Intercept the response to rewrite absolute redirects against the base path.
// Is disabled when the request has no base path which means /absproxy is in use.
proxy.on("proxyRes", (res, req) => {
  if (res.headers.location && res.headers.location.startsWith("/") && (req as any).base) {
    res.headers.location = (req as any).base + res.headers.location
  }
})
