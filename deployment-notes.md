# Z.M.G Education Solution - Deployment Notes

## Build and Start with PM2
1. Install dependencies: `npm install`
2. Build the Next.js app: `npm run build`
3. Start the application with PM2: `pm2 start ecosystem.config.js`
4. Save the PM2 list to start automatically on reboot: `pm2 save` && `pm2 startup`

## Environment Variables
Ensure all the environment variables from your `.env` are present on the production server.

## Nginx Reverse Proxy Configuration
To run the Next.js app on port 80/443 (HTTP/HTTPS) and link it to your domain (e.g. portal.zmgeducation.com), configure Nginx:

```nginx
server {
    listen 80;
    server_name portal.zmgeducation.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

*Don't forget to run `certbot --nginx` to setup SSL certificates after configuring the Nginx block.*
