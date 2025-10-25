// src/exceptions/NotFoundError.js
const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404); // Status code 404
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;