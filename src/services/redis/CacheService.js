const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: config.redis.host,
            },
        });
        this._client.on('error', (error) => {
            console.error('Redis connection error:', error.message);
        });
        this._isConnected = false;
        this._client.connect()
            .then(() => {
                this._isConnected = true;
                console.log('Redis connected successfully');
            })
            .catch((error) => {
                console.error('Redis connection failed:', error.message);
                this._isConnected = false;
            });
    }

    async set(key, value, expirationInSecond = 1800) {
        if (!this._isConnected) {
            console.warn('Redis not connected, skipping cache set');
            return;
        }
        try {
            await this._client.set(key, value, {
                EX: expirationInSecond,
            });
        } catch (error) {
            console.error('Cache set error:', error.message);
        }
    }

    async get(key) {
        if (!this._isConnected) {
            throw new Error('Cache tidak ditemukan');
        }
        try {
            const result = await this._client.get(key);
            if (result === null) throw new Error('Cache tidak ditemukan');
            return result;
        } catch (error) {
            throw new Error('Cache tidak ditemukan');
        }
    }

    async delete(key) {
        if (!this._isConnected) {
            console.warn('Redis not connected, skipping cache delete');
            return;
        }
        try {
            return await this._client.del(key);
        } catch (error) {
            console.error('Cache delete error:', error.message);
        }
    }
}

module.exports = CacheService;
