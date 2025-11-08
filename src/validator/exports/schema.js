const Joi = require('joi');

const ExportPlaylistPayloadSchema = Joi.object({
    // Use Joi v17+ email options shape to avoid deprecation/runtime issues
    targetEmail: Joi.string()
        .email({ tlds: { allow: true } })
        .required(),
});

module.exports = ExportPlaylistPayloadSchema;
