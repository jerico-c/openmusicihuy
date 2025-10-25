// src/server.js
// Pindahkan require('dotenv').config() ke config.js saja
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert'); // <-- Import Inert
const path = require('path'); // <-- Import path

// Config
const config = require('./utils/config'); // <-- Import config terpusat

// Exceptions
const ClientError = require('./exceptions/ClientError');
// (AuthenticationError & AuthorizationError sudah ada)

// Token Manager
const TokenManager = require('./tokenize/TokenManager');

// API v1: Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumLikesService = require('./services/postgres/AlbumLikesService');
const AlbumsValidator = require('./validator/albums');
const UploadsValidator = require('./validator/uploads');

// API v1: Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// API v2: Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// API v2: Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications');

// API v2: Collaborations
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// API v2: Playlists
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');

// --- API v3: Service Baru ---
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const CacheService = require('./services/redis/CacheService'); // <-- Service Cache

// API v3: Exports
const exportsApi = require('./api/exports'); // <-- Ganti nama variabel
const ExportsValidator = require('./validator/exports');

const init = async () => {
  // --- Inisiasi Service v3 ---
  const cacheService = new CacheService(); // <-- Inisiasi CacheService
  const storageService = new StorageService(); // <-- Inisiasi StorageService

  // Inisiasi Service v1 & v2 (Beberapa perlu diinjeksi)
  const collaborationsService = new CollaborationsService();
  const songsService = new SongsService();
  const playlistsService = new PlaylistsService(collaborationsService, songsService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  // Injeksi storageService dan cacheService ke AlbumsService
  const albumsService = new AlbumsService(storageService, cacheService);
  const activitiesService = new PlaylistActivitiesService(); 

  const server = Hapi.server({
    port: config.app.port, // Gunakan config
    host: config.app.host, // Gunakan config
    routes: {
      cors: {
        origin: ['*'],
      },
      // Konfigurasi untuk static files (cover)
      files: {
        relativeTo: path.resolve(__dirname, '..'), // Root project
      }
    },
  });

  // Registrasi Plugin Eksternal (JWT & Inert)
  await server.register([
    { plugin: Jwt },
    { plugin: Inert }, // <-- Daftarkan Inert
  ]);

  // Definisi Strategi Autentikasi JWT
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey, // Gunakan config
    verify: { aud: false, iss: false, sub: false, maxAgeSec: 1800 },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { id: artifacts.decoded.payload.userId },
    }),
  });
  server.auth.default('openmusic_jwt');

  // Penanganan Error Terpusat
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  // Registrasi Plugin Internal
  await server.register([
    // v1
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: { service: songsService, validator: SongsValidator },
    },
    // v2
    {
      plugin: users,
      options: { service: usersService, validator: UsersValidator },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService, 
        activitiesService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService, 
        validator: CollaborationsValidator,
      },
    },
    // v3
    {
      plugin: exportsApi, // <-- Daftarkan plugin export
      options: {
        producerService: ProducerService, // <-- ProducerService is an object, not a class
        playlistsService, // Dibutuhkan untuk verifikasi owner
        validator: ExportsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
