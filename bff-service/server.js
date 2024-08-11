import http from 'http';
import https from 'https';
import { URL } from 'url';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;

// Mapping from env vars
const serviceMap = {
    'product': process.env.PRODUCT_SERVICE_URL,
    'cart': process.env.CART_SERVICE_URL,
};

const agent = new https.Agent({
    keepAlive: true,
    rejectUnauthorized: false, // For development/testing only
    minVersion: 'TLSv1.2', // Ensure at least TLS 1.2
});

const requestHandler = async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const [, serviceName, ...rest] = parsedUrl.pathname.split('/');

    const recipientURL = serviceMap[serviceName];
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.setHeader('Connection', 'Keep-Alive');


    if (!recipientURL) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: "Cannot process request: Unknown service" }));
        return;
    }

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }


    const targetPath = rest.join('/');

    try {
        const method = req.method;
        const query = parsedUrl.searchParams;

        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', async () => {
            body = Buffer.concat(body).toString();

            try {
                const response = await fetch(`${recipientURL}/${targetPath}`, {
                    method: method,
                    //to avoid INVALID_ARG_ERROR when data is sent to service, we need to set connection header explicitely
                    headers: { ...req.headers, connection: 'keep-alive' },
                    body: body.length ? body : undefined,
                    agent: agent,
                });

                const data = await response.json();

                res.statusCode = response.status;
                res.end(JSON.stringify(data));
            } catch (error) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: `Cannot process request: ${JSON.stringify(error)} at ${recipientURL}/${targetPath}` }));
            }
        });
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `Server error: ${error.message}` }));
    }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`BFF Service running on http://localhost:${PORT}`);
});
