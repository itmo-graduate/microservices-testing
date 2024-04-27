const {ARTILLERY_FOLDER} = require('./utils');
const fs = require('fs').promises;
const path = require('path');

// Рекурсивное получение всех файлов и папок
async function listFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map(async (dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      return listFiles(res); // Рекурсивно обходим папки
    } else {
      return {
        path: res,
        isDirectory: false
      };
    }
  }));
  return Array.prototype.concat(...files);
}

module.exports = {
  initFileManager: (fastify) => {
    // Отображение списка файлов
    fastify.get('/files', async (request, reply) => {
      const directoryPath = path.join(__dirname, ARTILLERY_FOLDER);
      try {
        const items = await listFiles(directoryPath);
        const files = items.map(item => ({
          name: path.basename(item.path),
          path: item.path.replace(__dirname, ''),
          isDirectory: item.isDirectory
        }));
        reply.send(files);
      } catch (err) {
        reply.send(err);
      }
    });

    // Скачивание файла
    fastify.get('/download/*', async (request, reply) => {
      const fullPath = request.params['*'];
      const filePath = fullPath.replace(ARTILLERY_FOLDER, '')
      return reply.sendFile(filePath);
    });

    // Удаление файла
    fastify.delete('/delete/*', async (request, reply) => {
      const fullPath = request.params['*'];
      // For security needs
      const croppedPath = fullPath.replace(ARTILLERY_FOLDER, '')
      const filePath = path.join(__dirname, ARTILLERY_FOLDER, croppedPath);
      try {
        await fs.unlink(filePath);
        reply.send({ message: 'File deleted successfully' });
      } catch (err) {
        reply.send(err);
      }
    });

  }
}