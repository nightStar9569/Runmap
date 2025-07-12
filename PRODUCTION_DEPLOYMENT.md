# Production Deployment Guide

This guide will help you deploy the Runmap application to production with the payment system.

## Prerequisites

- Production server (VPS, AWS, Heroku, etc.)
- Domain name with SSL certificate
- Production database (MySQL/PostgreSQL)
- Stripe live account

## Step 1: Production Environment Setup

### 1.1 Stripe Live Keys

1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API Keys**:
   - Secret Key: `sk_live_...`
   - Publishable Key: `pk_live_...`
3. **Set up Live Webhook**:
   - URL: `https://your-domain.com/payment/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 1.2 Environment Variables

**Backend (.env):**
```env
# Production Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_actual_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here

# Production JWT Configuration (use strong secrets)
ACCESS_TOKEN_SECRET=your_very_strong_production_jwt_secret_here
REFRESH_TOKEN_SECRET=your_very_strong_production_refresh_secret_here

# Production Database Configuration
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name

# Production Server Configuration
PORT=5000
NODE_ENV=production

# Production Email Configuration
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@domain.com
EMAIL_PASS=your_production_email_password
```

**Frontend (.env.production):**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_live_publishable_key_here
NEXT_PUBLIC_API_URL=https://your-domain.com
```

## Step 2: Database Setup

### 2.1 Production Database

```sql
-- Create production database
CREATE DATABASE runmap_production;

-- Create user with limited privileges
CREATE USER 'runmap_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON runmap_production.* TO 'runmap_user'@'%';
FLUSH PRIVILEGES;
```

### 2.2 Run Migrations

```bash
cd backend
NODE_ENV=production npx sequelize-cli db:migrate
```

## Step 3: Build the Application

### 3.1 Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 3.2 Build Frontend

```bash
# Build for production
npm run build:frontend
```

### 3.3 Build Backend

```bash
# Install production dependencies only
npm run build:backend
```

## Step 4: Deployment Options

### Option A: Traditional VPS Deployment

#### 4.1 Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MySQL
sudo apt install mysql-server -y
```

#### 4.2 Application Deployment

```bash
# Clone your repository
git clone https://github.com/your-username/runmap.git
cd runmap

# Install dependencies
npm run install:all

# Build application
npm run build

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

cp frontend/.env.local.example frontend/.env.production
# Edit frontend/.env.production with production values

# Start backend with PM2
cd backend
pm2 start app.js --name "runmap-backend"

# Start frontend with PM2
cd ../frontend
pm2 start npm --name "runmap-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4.3 Nginx Configuration

Create `/etc/nginx/sites-available/runmap`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Stripe Webhooks
    location /payment/webhook {
        proxy_pass http://localhost:5000/payment/webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/runmap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Docker Deployment

#### 4.1 Create Dockerfile for Backend

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]
```

#### 4.2 Create Dockerfile for Frontend

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 4.3 Create docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - DB_HOST=db
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=${DB_NAME}
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
    depends_on:
      - backend

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### 4.4 Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option C: Cloud Platform Deployment

#### Heroku Deployment

1. **Create Heroku app**:
```bash
heroku create your-runmap-app
```

2. **Set environment variables**:
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set NODE_ENV=production
```

3. **Deploy**:
```bash
git push heroku main
```

#### Vercel Deployment (Frontend)

1. **Connect to Vercel**:
```bash
npm i -g vercel
vercel
```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**:
```bash
vercel --prod
```

## Step 5: Security Configuration

### 5.1 SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 5.2 Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 5.3 Database Security

```bash
# Secure MySQL installation
sudo mysql_secure_installation
```

## Step 6: Monitoring and Maintenance

### 6.1 PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart services
pm2 restart all
```

### 6.2 Log Management

```bash
# Set up log rotation
sudo logrotate -f /etc/logrotate.conf
```

### 6.3 Backup Strategy

```bash
# Database backup script
#!/bin/bash
mysqldump -u runmap_user -p runmap_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Step 7: Testing Production

### 7.1 Test Payment Flow

1. **Use real card** (not test cards)
2. **Test small amount** first
3. **Verify webhook delivery**
4. **Check database updates**

### 7.2 Monitor Stripe Dashboard

1. **Check payments** in Stripe Dashboard
2. **Monitor webhook events**
3. **Review error logs**

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check webhook URL is accessible
   - Verify webhook secret
   - Check server logs

2. **Payment failures**:
   - Check Stripe logs
   - Verify API keys
   - Test with Stripe CLI

3. **Database connection issues**:
   - Check database credentials
   - Verify network connectivity
   - Check firewall settings

### Support

- **Stripe Support**: https://support.stripe.com
- **Server Logs**: Check PM2 and Nginx logs
- **Application Logs**: Check backend console output

## Performance Optimization

### 7.1 Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_events_date ON Events(date);
CREATE INDEX idx_favorites_user_event ON Favorites(userId, eventId);
```

### 7.2 Caching

```bash
# Install Redis for caching
sudo apt install redis-server -y
```

### 7.3 CDN Setup

- Use Cloudflare or similar CDN
- Configure caching rules
- Enable HTTPS

## Cost Optimization

### 7.1 Server Resources

- Start with minimal resources
- Scale based on usage
- Use auto-scaling if available

### 7.2 Database Optimization

- Use connection pooling
- Optimize queries
- Consider read replicas for high traffic

This deployment guide covers the essential steps for production deployment. Choose the option that best fits your infrastructure and requirements. 