const express = require("express");
const httpProxy = require("http-proxy");
const PORT = 8000;
const app = express();

const BASE_PATH = `https://psidh-deployment-pipeline.s3.ap-south-1.amazonaws.com/__outputs`;

const proxy = httpProxy.createProxyServer();
app.use((req, res) => {
  const hostname = req.hostname;
  const subDomain = hostname.split(".")[0];
  const resolveTo = `${BASE_PATH}/${subDomain}`;

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
