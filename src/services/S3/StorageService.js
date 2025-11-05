const fs = require('fs');
const path = require('path');

class StorageService {
    constructor() {
        this._folder = process.env.STORAGE_PATH || './uploads/images';

        // Create folder if it doesn't exist
        if (!fs.existsSync(this._folder)) {
            fs.mkdirSync(this._folder, { recursive: true });
        }
    }

    async writeFile(file, meta) {
        const { filename } = meta;
        const filePath = path.join(this._folder, filename);

        // Write file to local storage
        const fileStream = fs.createWriteStream(filePath);

        return new Promise((resolve, reject) => {
            fileStream.on('error', (error) => reject(error));
            file.pipe(fileStream);
            file.on('end', () => {
                // Return the URL path to the file
                const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;
                resolve(fileUrl);
            });
        });
    }
}

module.exports = StorageService;
