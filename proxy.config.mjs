import * as fs from 'fs';

const targets = [
 'http://localhost:8008',     // 1
];

const PROXY_CONFIG = {
  '^/(version|configuration|onboarding)\\.json$': {
    bypass: (req, res, proxyOptions) => {
      let url;
      const reqUrl = req.url.split('?')[0]; // Remove query params

      if (reqUrl === '/version.json') {
        url = 'src/version.json';
      } else if (reqUrl === '/configuration.json') {
        url = 'src/configuration.json';
      } else if (reqUrl === '/onboarding.json') {
        url = 'src/onboarding.json';
      } else {
        // Return the request path to bypass proxy
        return req.url;
      }

      try {
        const content = fs.readFileSync(url);
        res.writeHead(200, {
          'Content-Length': content.length,
          'Content-Type': 'application/json'
        });
        res.end(content);
        return true;
      } catch (err) {
        console.error(`Error reading ${url}:`, err);
        // Send 404 response instead of returning null
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return true;
      }
    }
  }
};

targets.forEach((target, i) => {
  const path = `/service/${i + 1}/api`;
  PROXY_CONFIG[path] = {
    target: target,
    secure: true,
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    logLevel: 'debug',
    pathRewrite: {
      [`^${path}`]: ''
    }
  };
});

export default PROXY_CONFIG;
