// src/utils/index.js

// Untuk GET /songs/{id}
const mapSongDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id, // dari DB
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id, // ke JS
});

module.exports = { mapSongDBToModel };