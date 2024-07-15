require("dotenv").config();
const express = require("express");
const httpProxy = require("http-proxy");
const PORT = 8000;
const app = express();
const cors = require("cors");
app.use(cors());

const BASE = process.env.BASE_PATH;

const proxy = httpProxy.createProxyServer();
app.use((req, res) => {
  const hostname = req.hostname;
  const subDomain = hostname.split(".")[0];
  console.log(subDomain);
  const resolveTo = `${BASE}/${subDomain}`;

  console.log(`Proxying to: ${resolveTo}`); // Log the target URL

  return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
});


proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }
});

app.listen(PORT, () => {
  console.log(`Reverse Proxy running on port ${PORT}`);
});
