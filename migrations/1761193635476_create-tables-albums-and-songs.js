// migrations/xxxxx_create-tables-albums-and-songs.js
exports.up = (pgm) => {
  // Membuat tabel 'albums'
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });

  // Membuat tabel 'songs'
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      notNull: false, // Boleh null
    },
    album_id: { // Kita gunakan snake_case di DB
      type: 'VARCHAR(50)',
      notNull: false, // Boleh null
      references: 'albums(id)', // Foreign key ke tabel albums
      onDelete: 'SET NULL', // Jika album dihapus, album_id di lagu jadi NULL
    },
  });
};

exports.down = (pgm) => {
  // Hapus 'songs' dulu karena ada foreign key
  pgm.dropTable('songs');
  pgm.dropTable('albums');
};