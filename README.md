# OpenMusic API V3

API untuk mengelola koleksi musik, playlist, dan kolaborasi dengan fitur autentikasi, caching, dan export playlist melalui RabbitMQ.

## Features

### ✅ Mandatory Features
- **Albums Management**: CRUD operations untuk album
- **Songs Management**: CRUD operations untuk lagu
- **Users Management**: Registrasi dan autentikasi user
- **Playlists Management**: CRUD operations untuk playlist pribadi
- **Collaborations**: Kolaborasi playlist antar user
- **Playlist Activities**: Track aktivitas playlist
- **Album Covers**: Upload cover album ke local storage
- **Album Likes**: Like/unlike album dengan caching menggunakan Redis
- **Playlist Export**: Export playlist ke email menggunakan RabbitMQ dan consumer

### 🚀 Additional Features
- Server-side caching dengan Redis untuk album likes
- ESLint 8.57.1 dengan Airbnb style guide
- Local storage untuk album covers
- Authentication dengan JWT
- Input validation dengan Joi

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Hapi.js v21
- **Database**: PostgreSQL
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (@hapi/jwt)
- **Validation**: Joi
- **Linting**: ESLint 8.57.1 + Airbnb Base

## Prerequisites

- Node.js v18 atau lebih tinggi
- PostgreSQL
- Redis server
- RabbitMQ server

## Installation

1. Clone repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

4. Jalankan database migrations:
```bash
npm run migrate up
```

5. Pastikan Redis dan RabbitMQ sudah running

## Usage

Production mode:
```bash
npm start
```

Or with NODE_ENV:
```bash
npm run start-prod
```

Development mode (with nodemon):
```bash
npm run start-dev
```

## Linting

Check code style:
```bash
npm run lint
```

## API Endpoints

### Albums
- `POST /albums` - Create album
- `GET /albums/{id}` - Get album by ID
- `PUT /albums/{id}` - Update album
- `DELETE /albums/{id}` - Delete album
- `POST /albums/{id}/covers` - Upload album cover
- `GET /albums/{id}/likes` - Get album likes count
- `POST /albums/{id}/likes` - Like album (requires auth)
- `DELETE /albums/{id}/likes` - Unlike album (requires auth)

### Songs
- `POST /songs` - Create song
- `GET /songs` - Get all songs (with optional query params)
- `GET /songs/{id}` - Get song by ID
- `PUT /songs/{id}` - Update song
- `DELETE /songs/{id}` - Delete song

### Users
- `POST /users` - Register new user

### Authentications
- `POST /authentications` - Login
- `PUT /authentications` - Refresh token
- `DELETE /authentications` - Logout

### Playlists
- `POST /playlists` - Create playlist (requires auth)
- `GET /playlists` - Get user's playlists (requires auth)
- `GET /playlists/{id}` - Get playlist by ID (requires auth)
- `PUT /playlists/{id}` - Update playlist (requires auth)
- `DELETE /playlists/{id}` - Delete playlist (requires auth)
- `POST /playlists/{id}/songs` - Add song to playlist (requires auth)
- `DELETE /playlists/{id}/songs` - Remove song from playlist (requires auth)
- `GET /playlists/{id}/activities` - Get playlist activities (requires auth)

### Collaborations
- `POST /collaborations` - Add collaborator (requires auth)
- `DELETE /collaborations` - Remove collaborator (requires auth)

### Exports
- `POST /exports/playlists/{playlistId}` - Export playlist to email (requires auth)

## Project Structure

```
├── src/
│   ├── api/           # Route handlers & plugins
│   ├── services/      # Business logic
│   │   ├── postgres/  # Database services
│   │   ├── rabbitmq/  # RabbitMQ producer
│   │   ├── redis/     # Redis caching
│   │   └── S3/        # File storage
│   ├── validator/     # Input validation schemas
│   ├── exceptions/    # Custom error classes
│   ├── tokenize/      # JWT token manager
│   ├── utils/         # Helper functions
│   └── server.js      # Main application entry
├── migrations/        # Database migrations
├── uploads/          # Uploaded files storage
├── consumer/         # RabbitMQ consumer (separate project)
└── .env              # Environment variables
```

## Environment Variables

See `.env.example` for required environment variables.

## Consumer Application

Consumer app terpisah untuk memproses export playlist. Lihat `consumer/README.md` untuk detail.

## License

ISC
