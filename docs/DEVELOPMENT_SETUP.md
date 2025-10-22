# 🛠️ DairyFlow Development Setup Guide

## 📋 Prerequisites

Before setting up the DairyFlow project, ensure you have the following installed:

- **Node.js 20+** - [Download from nodejs.org](https://nodejs.org/)
- **npm or pnpm** - Package manager
- **PostgreSQL 16+** - Database (or Supabase account)
- **Git** - Version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/TechEdusyAi/DairyFlow.git
cd DairyFlow

# Install all dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp tools/.env.example tools/.env

# Edit .env with your configuration (see Environment Variables section)
```

### 3. Database Setup

Choose one of the following database options:

#### Option A: Supabase (Recommended)
```bash
# 1. Create a Supabase project at https://supabase.com
# 2. Get your project URL and anon key
# 3. Update .env with Supabase credentials
# 4. Run schema migration
npm run db:push
```

#### Option B: Local PostgreSQL
```bash
# 1. Install PostgreSQL locally
# 2. Create a database named 'dairyflow'
# 3. Update DATABASE_URL in .env
# 4. Run schema migration
npm run db:push
```

### 4. Development Commands

```bash
# Start full development environment (web + api)
npm run dev

# Start only API server
npm run dev:api

# Start only web client
npm run dev:web

# Type checking
npm run check

# Build for production
npm run build
```

## 📁 Project Structure

```
DairyFlow/
├── apps/                    # Application packages
│   ├── web/                # React frontend
│   ├── api/                # Express backend
│   └── mobile/             # React Native apps
├── packages/               # Shared packages
│   └── types/              # TypeScript definitions
├── config/                 # Shared configuration
├── docs/                   # Documentation
├── tools/                  # Development tools
└── package.json           # Monorepo root
```

## 🔧 Environment Variables

### Root `.env` file:
```env
# Database (choose one)
DATABASE_URL=postgresql://user:password@localhost:5432/dairyflow
# OR for Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase (if using Supabase)
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]

# API Configuration
PORT=5000
NODE_ENV=development
```

### Tools `.env` file (optional):
```env
# For development tools and scripts
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=[your-service-key]
```

## 🧪 Testing the Setup

### 1. API Server Test
```bash
npm run dev:api
# Should start on http://localhost:5000
# Check API health: curl http://localhost:5000/api/products
```

### 2. Web Client Test
```bash
npm run dev:web
# Should start on http://localhost:5173
# Open browser and check if app loads
```

### 3. Full Stack Test
```bash
npm run dev
# Should start both API and web client
# API on http://localhost:5000
# Web on http://localhost:5173
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Cannot find module '@dairyflow/types'"
```bash
# Build the types package
cd packages/types && npm run build
```

#### 2. "DATABASE_URL must be set"
```bash
# Check your .env file
# Ensure DATABASE_URL is properly set
# For Supabase, use the connection string from project settings
```

#### 3. "Port already in use"
```bash
# Kill process using the port
npx kill-port 5000 5173
# Or change ports in .env
```

#### 4. "Vite config not found"
```bash
# Ensure config/vite.config.ts exists
# Check import paths in apps/api/src/vite.ts
```

#### 5. TypeScript errors
```bash
# Run type checking
npm run check

# Build types package
cd packages/types && npm run build
```

## 📱 Development Workflow

### Daily Development:
1. **Start development servers**: `npm run dev`
2. **Make changes** to code
3. **Check TypeScript**: `npm run check`
4. **Test functionality** in browser
5. **Commit changes** with descriptive messages

### Adding New Features:
1. **Plan the feature** in relevant documentation
2. **Update types** in `packages/types/index.ts`
3. **Implement API routes** in `apps/api/src/routes.ts`
4. **Add frontend components** in `apps/web/src/`
5. **Test thoroughly** before committing

## 🔄 Database Operations

### Schema Changes:
```bash
# Push schema changes to database
npm run db:push

# Generate migration files (if needed)
npm run db:generate
```

### Seeding Data:
```bash
# Run seed scripts (if available)
npm run db:seed
```

## 🚀 Production Deployment

### Build Process:
```bash
# Build all packages
npm run build

# Build specific packages
npm run build --workspace=@dairyflow/web
npm run build --workspace=@dairyflow/api
```

### Deployment Checklist:
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] SSL certificates (if needed)
- [ ] Domain configured
- [ ] Monitoring set up

## 📞 Support

### Getting Help:
1. **Check this documentation** first
2. **Review existing issues** on GitHub
3. **Create new issue** with detailed information
4. **Include error logs** and environment details

### Development Team:
- **Email**: dev@techedusy.com
- **GitHub Issues**: For bug reports and feature requests

---

**Last Updated:** January 2025
**Version:** 1.0.0