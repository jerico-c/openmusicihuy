// src/exceptions/InvariantError.js
const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400); // Status code 400
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;