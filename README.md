# Backend Resep App

Backend untuk aplikasi resep dengan authentication menggunakan Node.js, Express, dan PostgreSQL.

## Setup

### 1. Install PostgreSQL
- Download dari https://www.postgresql.org/download/
- Install dan set password untuk user `postgres`
- Pastikan PostgreSQL running

### 2. Buat Database
Buka PostgreSQL command line atau pgAdmin, lalu buat database:
```sql
CREATE DATABASE resep_app;
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Update file `.env`:
```
PORT=5010
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resep_app
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d
```

### 5. Run Server
```bash
# Development mode (dengan auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5010`

## API Endpoints

### Authentication

#### 1. Register
- **URL**: `POST /api/auth/register`
- **Body**:
```json
{
  "name": "username",
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "message": "Registrasi berhasil",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "username",
    "email": "user@example.com",
    "avatar": "avatar_url"
  }
}
```

#### 2. Login
- **URL**: `POST /api/auth/login`
- **Body**:
```json
{
  "name": "username",
  "password": "password123"
}
```
- **Response**: Same as register

#### 3. Get Current User (Protected)
- **URL**: `GET /api/auth/me`
- **Header**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "user": {
    "id": "user_id",
    "name": "username",
    "email": "user@example.com",
    "avatar": "avatar_url"
  }
}
```

#### 4. Logout (Protected)
- **URL**: `POST /api/auth/logout`
- **Header**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Logout berhasil"
}
```

### Recipes

#### 1. Get All Recipes
- **URL**: `GET /api/recipes`
- **Response**:
```json
{
  "message": "Berhasil mengambil semua resep",
  "recipes": [...]
}
```

#### 2. Get Recipe by ID
- **URL**: `GET /api/recipes/:id`
- **Response**: Single recipe object

#### 3. Get Recipes by Category
- **URL**: `GET /api/recipes/category/:category`
- **Response**: Array of recipes in that category

#### 4. Create Recipe (Protected)
- **URL**: `POST /api/recipes`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Nasi Goreng",
  "description": "Nasi goreng Indonesia klasik",
  "category": "Nasi",
  "ingredients": ["nasi", "telur", "bawang", "kecap manis"],
  "instructions": "1. Panaskan minyak... 2. Masukkan bawang...",
  "image": "https://...",
  "prepTime": 10,
  "cookTime": 15,
  "servings": 2,
  "difficulty": "Mudah"
}
```

#### 5. Update Recipe (Protected)
- **URL**: `PUT /api/recipes/:id`
- **Header**: `Authorization: Bearer <token>`
- **Body**: Same as create recipe

#### 6. Delete Recipe (Protected)
- **URL**: `DELETE /api/recipes/:id`
- **Header**: `Authorization: Bearer <token>`

#### 7. Get My Recipes (Protected)
- **URL**: `GET /api/recipes/user/my-recipes`
- **Header**: `Authorization: Bearer <token>`

### Favorites

#### 1. Get My Favorites (Protected)
- **URL**: `GET /api/favorites`
- **Header**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "message": "Berhasil mengambil favorit",
  "favorites": [...]
}
```

#### 2. Add to Favorites (Protected)
- **URL**: `POST /api/favorites`
- **Header**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "recipeId": "recipe_uuid"
}
```

#### 3. Remove from Favorites (Protected)
- **URL**: `DELETE /api/favorites/:recipeId`
- **Header**: `Authorization: Bearer <token>`

#### 4. Check if Favorite (Protected)
- **URL**: `GET /api/favorites/check/:recipeId`
- **Header**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "isFavorite": true/false
}
```

## Project Structure
```
backend/
├── models/           # Database models (Sequelize)
├── controllers/      # Logic bisnis
├── routes/          # API routes
├── middleware/      # Auth middleware
├── server.js        # Entry point
├── db.js           # Database connection
├── config.js       # Configuration
├── .env            # Environment variables
└── package.json
```

## Database
- **Type**: PostgreSQL
- **ORM**: Sequelize
- **Connection**: localhost:5432

## Error Handling
- 400: Bad request (validasi gagal)
- 401: Unauthorized (login gagal)
- 409: Conflict (user sudah ada)
- 500: Server error

## Next Steps
- Integrate dengan frontend
- Tambah recipe endpoints
- Tambah favorite/bookmark system
- Implementasi refresh token

