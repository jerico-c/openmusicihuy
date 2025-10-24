// src/server.js
require('dotenv').config(); // Paling atas!

const Hapi = require('@hapi/hapi');

// Exceptions (Kriteria 5)
const ClientError = require('./exceptions/ClientError');

// API Albums (Kriteria 2)
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// API Songs (Kriteria 3)
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  // Inisiasi service
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  const server = Hapi.server({
    // Kriteria 1: Environment Variable
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Kriteria Opsional 3: Penanganan Error Terpusat (onPreResponse)
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Cek apakah response adalah Error
    if (response instanceof Error) {
      // Penanganan ClientError (Kriteria 5: 4xx)
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Mempertahankan penanganan error bawaan Hapi (seperti 404 Not Found)
      if (!response.isServer) {
        return h.continue;
      }

      // Penanganan Server Error (Kriteria 5: 500)
      console.error(response); // Tampilkan log error di console
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    // Jika bukan error, lanjutkan response
    return h.continue;
  });

  // Registrasi Plugin
  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();