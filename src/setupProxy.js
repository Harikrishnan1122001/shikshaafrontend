const { createProxyMiddleware } = require("http-proxy-middleware");

// This file is picked up automatically by react-scripts (CRA) when it
// starts the dev server — no manual wiring needed. It forwards any
// request to /api/* from http://localhost:3000 to the real backend,
// server-side. Because the browser only ever talks to localhost:3000,
// there is no cross-origin request and therefore no CORS check.
//
// This replaces the "proxy" string field in package.json, which can
// silently fail to apply on some react-scripts/webpack-dev-server
// versions. This explicit setup is the officially recommended CRA
// approach for anything beyond the simplest case.
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://shikshaabackend.vercel.app",
      changeOrigin: true,
      logLevel: "debug", // prints every proxied request to the terminal running `npm start`
      onProxyReq: (proxyReq, req) => {
        console.log(`[proxy] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
      },
      onError: (err, req, res) => {
        console.error("[proxy] error:", err.message);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Proxy error", error: err.message }));
      },
    })
  );
};
