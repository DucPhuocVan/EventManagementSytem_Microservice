const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Định tuyến yêu cầu đến '/user' đến users services
app.use('/event', createProxyMiddleware({ target: 'http://localhost:8000', changeOrigin: true }));
app.use('/booking', createProxyMiddleware({ target: 'http://localhost:8001', changeOrigin: true }));


PORT = 8002
// Start Express server
app.listen(PORT, () => {
 console.log(`Gateway is running on port ${PORT}`);
});