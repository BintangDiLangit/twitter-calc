# Deploy to Vercel - Complete Guide

## ✅ You're Ready!

Since you already have your database server, deploying to Vercel is straightforward.

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/calculation-tree.git
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** (free account)
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (for root dependencies)

6. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   DB_HOST=31.97.108.174
   DB_PORT=5432
   DB_NAME=calculation_tree
   DB_USER=postgres
   DB_PASSWORD=postgres
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-app-name.vercel.app
   ```
   
   ⚠️ **Important**: 
   - Generate a strong `JWT_SECRET` (at least 32 characters)
   - Set `CORS_ORIGIN` to your Vercel domain (you'll get this after first deploy)
   - You can update `CORS_ORIGIN` after the first deployment

7. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes first time)

### Option B: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # From project root
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add DB_HOST
   # Enter: 31.97.108.174
   
   vercel env add DB_PORT
   # Enter: 5432
   
   vercel env add DB_NAME
   # Enter: calculation_tree
   
   vercel env add DB_USER
   # Enter: postgres
   
   vercel env add DB_PASSWORD
   # Enter: postgres
   
   vercel env add JWT_SECRET
   # Enter: your-super-secret-jwt-key-min-32-characters-long
   
   vercel env add JWT_EXPIRES_IN
   # Enter: 7d
   
   vercel env add CORS_ORIGIN
   # Enter: https://your-app-name.vercel.app (update after first deploy)
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Initialize Database

After first deployment, you need to initialize the database tables:

### Option A: Use Vercel CLI

1. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

2. **Run initialization locally** (pointing to your production DB):
   ```bash
   cd backend
   npm install
   # Make sure .env.local has your DB credentials
   npm run migrate  # or create a simple init script
   ```

### Option B: Create Temporary Init Endpoint

1. **Add to `api/index.ts`** (temporarily):
   ```typescript
   app.get('/api/init', async (req, res) => {
     try {
       await initDatabase();
       res.json({ message: 'Database initialized successfully' });
     } catch (error) {
       res.status(500).json({ error: 'Initialization failed', details: error });
     }
   });
   ```

2. **Call it once**:
   ```
   https://your-app.vercel.app/api/init
   ```

3. **Remove the endpoint** after initialization

### Option C: Use Database Client

Connect to your database (31.97.108.174:5432) using pgAdmin, DBeaver, or psql and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES calculations(id) ON DELETE CASCADE,
  operation_type VARCHAR(20),
  operand DECIMAL(20, 10) NOT NULL,
  result DECIMAL(20, 10) NOT NULL,
  depth INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_operation_type CHECK (
    operation_type IS NULL OR 
    operation_type IN ('add', 'subtract', 'multiply', 'divide')
  ),
  CONSTRAINT check_root_node CHECK (
    (parent_id IS NULL AND operation_type IS NULL) OR
    (parent_id IS NOT NULL AND operation_type IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_calculations_parent_id ON calculations(parent_id);
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
```

## Step 4: Update CORS_ORIGIN

After deployment, you'll get a URL like: `https://calculation-tree.vercel.app`

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `CORS_ORIGIN` to your actual Vercel URL
3. Redeploy (or it will auto-redeploy on next push)

## Step 5: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Test registration**: Create an account
3. **Test login**: Login with your account
4. **Test calculations**: Create a starting number and add operations

## Project Structure for Vercel

```
your-repo/
├── api/
│   └── index.ts          # Serverless function (handles all /api/* routes)
├── backend/              # Backend code (used by api/index.ts)
├── frontend/             # Frontend code
│   ├── dist/            # Built files (deployed to Vercel)
│   └── ...
├── vercel.json           # Vercel configuration
└── package.json          # Root dependencies
```

## How It Works

1. **Frontend**: Built and served as static files from `frontend/dist`
2. **API Routes**: All `/api/*` requests go to `api/index.ts` (serverless function)
3. **Database**: Connects to your server at `31.97.108.174:5432`

## Important Notes

### Database Connection

- Make sure your database server (31.97.108.174) allows connections from Vercel's IPs
- Vercel uses dynamic IPs, so you may need to:
  - Allow all IPs (0.0.0.0/0) in your database firewall
  - Or use a VPN/proxy solution

### Security

- ✅ Never commit `.env` files
- ✅ Use strong `JWT_SECRET` (32+ characters)
- ✅ Consider using SSL for database connection (set `DB_SSL=true`)

### Performance

- First request after inactivity may be slow (cold start ~1-2s)
- Subsequent requests are fast
- Database connection pooling is optimized for serverless

## Troubleshooting

### Build Fails

- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify build commands are correct

### Database Connection Errors

- Check firewall allows Vercel IPs
- Verify database credentials
- Check database server is running
- Try setting `DB_SSL=true` if needed

### CORS Errors

- Update `CORS_ORIGIN` to your exact Vercel domain
- Include `https://` in the URL
- Redeploy after updating

### API Returns 404

- Check `vercel.json` routes configuration
- Verify `api/index.ts` exists
- Check Vercel function logs

## Automatic Deployments

Once connected to GitHub:
- ✅ Every push to `main` branch = automatic production deploy
- ✅ Pull requests = preview deployments
- ✅ Zero-downtime deployments
- ✅ Automatic SSL certificates

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Initialize database
3. ✅ Test the application
4. ✅ Share your URL!

Your app will be live at: `https://your-app-name.vercel.app`

🎉 **Congratulations! Your app is now deployed!**

