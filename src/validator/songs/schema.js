// src/validator/songs/schema.js
const Joi = require('@hapi/joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer(), // Opsional
  albumId: Joi.string(), // Opsional
});

module.exports = { SongPayloadSchema };