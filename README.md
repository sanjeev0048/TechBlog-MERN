# TechPulse — MERN Stack Engineering Blog & CMS

TechPulse is a full-stack corporate technology publication and editorial management system built using the MERN stack (MongoDB, Express.js, React, Node.js) styled with Tailwind CSS.

---

## 1. Project Architecture

The application is structured into two decoupled, modular subsystems:

- **Frontend (`/src`)**: Single-Page Application (SPA) built with React 18, React Router v6, Tailwind CSS, and Lucide React.
  - Communicates with the backend REST API via an abstracted API client (`src/services/api.js`).
  - Seamlessly handles authentication state (JWT), pagination, full-text client/server search, category taxonomies, and markdown parsing with an anchor-linked Table of Contents.
  - Implements local fallback caching so reviewers can test the application interface immediately even before setting up a database.

- **Backend (`/server`)**: Production REST API server built with Express.js and Mongoose.
  - Layered MVC architecture: `config/`, `models/`, `controllers/`, `routes/`, `middleware/`, and `services/`.
  - Security suite: Helmet HTTP headers, CORS whitelisting, Express Rate Limiting on authentication endpoints, and Input Validation with Express Validator.
  - Scheduled publication daemon running on `node-cron`.
  - File upload pipeline with Multer validating image MIME types and file extensions.

```
TechBlog-MERN/
├── src/
│   ├── components/
│   │   ├── blog/          # ArticleCard, TableOfContents, ShareButtons
│   │   ├── common/        # Badge, ConfirmationModal, Pagination
│   │   └── layout/        # Header, Footer, ProtectedRoute
│   ├── context/           # BlogContext (API synchronization, state & CRUD)
│   ├── data/              # Initial seed fallback data
│   ├── hooks/             # useBlog custom hook
│   ├── pages/
│   │   ├── admin/         # Dashboard, Articles list, Editor, Categories, Login
│   │   ├── Home.jsx       # Hero featured read + trending sidebar
│   │   ├── BlogListing.jsx# Multi-filter search, category pill bar, pagination
│   │   └── BlogDetail.jsx # Reader view with dynamic TOC & related reads
│   ├── services/          # API service client & storage helpers
│   ├── utils/             # Slugify, reading time calculator, heading parser
│   ├── App.jsx            # Router and application shell
│   └── main.jsx
├── server/
│   ├── config/            # MongoDB connection configuration (db.js)
│   ├── controllers/       # Auth, Blog, Category, Tag, Upload controllers
│   ├── middleware/        # JWT auth protection and global error handlers
│   ├── models/            # Mongoose schemas (User, Blog, Category, Tag)
│   ├── routes/            # Express routers with request validation
│   ├── scripts/           # Standalone seed scripts & API integration tests
│   ├── services/          # Scheduled publication cron engine
│   ├── utils/             # Server slug generator
│   ├── uploads/           # Uploaded article images directory
│   ├── .env.example
│   ├── server.js          # Express entrypoint
│   └── package.json
├── package.json
└── tailwind.config.js
```

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or MongoDB Atlas connection string
- **npm** or **yarn**

---

## 3. Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/techpulse_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000,http://localhost:5173
ADMIN_NAME=Admin Manager
ADMIN_EMAIL=admin@techpulse.com
ADMIN_PASSWORD=admin123
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Installation & Database Seeding

### Step 1: Install Dependencies
```bash
# 1. Install frontend dependencies (from root)
npm install

# 2. Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Seed the Database
The seed scripts are idempotent (safe to run repeatedly without creating duplicates).

```bash
cd server

# Seed initial admin user, 7 required categories, and sample technology articles:
npm run seed:all
```

This populates:
1. **Admin account:** `admin@techpulse.com` / `admin123`
2. **7 Required categories:**
   - Software Development
   - AI & ML
   - Web and Mobile App Development
   - Technology & Innovation
   - Cybersecurity
   - Cloud Computing
   - Industry Insights
3. **Curated sample articles** covering Microservices, LLM orchestration, React 19 concurrent patterns, Zero Trust security, FinOps, and WebAssembly.

---

## 5. Running the Application

### Option A: Run Using Batch Script (Windows)
Double-click:
- **`run.bat`** (at root) to launch the React frontend.
- **`server/run-server.bat`** to start the Express API backend.

### Option B: Run via Terminal

#### Terminal 1 — Backend:
```bash
cd server
npm run dev
```
Backend API will listen at: **`http://localhost:5000/api`**

#### Terminal 2 — Frontend:
```bash
npm run dev
```
Frontend will be live at: **`http://localhost:3000`**

---

## 6. Authentication Details

- **Strategy:** Stateless JSON Web Tokens (JWT) passed in the HTTP `Authorization: Bearer <token>` header.
- **Password Security:** Salted hashes generated via `bcryptjs` (cost factor 10).
- **Password Privacy:** The `User` model automatically strips `passwordHash` in `toJSON` transforms.
- **Rate Limiting:** Login endpoint is protected with `express-rate-limit` (maximum 10 attempts per 15 minutes per IP).
- **Default Credentials:**
  - **Email:** `admin@techpulse.com`
  - **Password:** `admin123`

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, returns JWT token & user object |
| `GET` | `/api/auth/me` | Protected | Returns authenticated user profile |
| `POST` | `/api/auth/logout` | Public | Invalidates client session |

### Articles & Blogs (`/api/blogs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/blogs` | Public | Paginated list of published articles. Supports `?page=`, `?limit=`, `?search=`, `?category=`, `?tag=`, `?sort=` |
| `GET` | `/api/blogs/featured` | Public | Returns published articles pinned as featured |
| `GET` | `/api/blogs/:slug` | Public | Returns single article by slug, populates author & category, increments views |
| `GET` | `/api/blogs/:slug/related`| Public | Returns up to 3 related articles matching category or tags |
| `GET` | `/api/blogs/admin/all` | Admin | Returns all articles across all statuses (Published, Draft, Scheduled) |
| `GET` | `/api/blogs/admin/:id` | Admin | Fetches single article by ID for editing |
| `POST` | `/api/blogs` | Admin | Creates a new article (handles slug uniqueness & single-featured logic) |
| `PATCH`| `/api/blogs/:id` | Admin | Updates article fields (prevents mass assignment) |
| `DELETE`| `/api/blogs/:id` | Admin | Permanently deletes an article |
| `PATCH`| `/api/blogs/:id/status` | Admin | Updates status (`draft`, `published`, `scheduled`) |
| `PATCH`| `/api/blogs/:id/feature` | Admin | Sets or unsets featured status |
| `POST` | `/api/blogs/admin/process-scheduled` | Admin | Manually triggers scheduled article publishing |

### Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Returns all categories with live article counts |
| `GET` | `/api/categories/:id` | Public | Returns single category |
| `POST` | `/api/categories` | Admin | Creates a category (validates duplicate name and slug) |
| `PATCH`| `/api/categories/:id` | Admin | Updates category name, slug, or description |
| `DELETE`| `/api/categories/:id` | Admin | Deletes category (blocks deletion if articles reference it) |

### Tags (`/api/tags`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tags` | Public | Returns all tags |
| `POST` | `/api/tags` | Admin | Creates new tag |
| `DELETE`| `/api/tags/:id` | Admin | Deletes tag and removes references from articles |

### Image Uploads (`/api/uploads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/uploads` | Admin | Accepts `multipart/form-data` with field `image`. Validates image MIME types (JPEG, PNG, WebP, GIF), limits to 5MB, returns `/uploads/filename.ext` |

---

## 8. Scheduled Publications

- **How it works:** Articles with `status: 'scheduled'` and a future `scheduledAt` date/time are hidden from public queries.
- **Background Cron Daemon:** A background scheduler initialized via `node-cron` in `server.js` checks every minute for scheduled posts whose target time has arrived and flips their status to `published` with an atomic `updateMany` query.
- **Production Running:** Runs automatically as part of the Node.js server lifecycle. In clustered or serverless deployments, the idempotent function `checkScheduledPublications()` can also be invoked via an external CloudWatch/cron ping to `POST /api/blogs/admin/process-scheduled`.

---

## 9. Testing & Verification

An automated integration test script is included in `server/scripts/testApi.js`.

To run the automated test suite:
```bash
# Ensure server is running in terminal 1, then in terminal 2:
cd server
npm run test:api
```

This verifies:
1. Health check returns 200 OK.
2. Bad login credentials return 401 Unauthorized.
3. Correct admin credentials return a valid JWT token.
4. Protected routes reject unauthenticated requests.
5. `/api/categories` returns the 7 required categories.
6. Public `/api/blogs` returns paginated published records and suppresses drafts.
7. Admin `/api/blogs/admin/all` returns draft and scheduled posts.
8. Article creation, reading by slug, patching, and deletion work end-to-end.
9. Scheduled publication processing executes cleanly.

---

## 10. Known Limitations & Tradeoffs

- **Image Storage:** Uploaded images are stored on the local filesystem under `server/uploads`. In a large multi-instance containerized cloud deployment (e.g. AWS ECS / Kubernetes), this should be pointed to an S3 bucket or Cloudinary CDN.
- **Search Engine:** Text queries currently use MongoDB case-insensitive regex matching with text indexes. For multi-million article datasets, an external inverted index (Elasticsearch / Algolia) is recommended.
"# TechBlog-MERN" 
"# TechBlog-MERN" 
