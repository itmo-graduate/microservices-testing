const {exec} = require('child_process');
const Ajv = require('ajv');
const {serviceSchema} = require('./service-schema');

module.exports = {
    /**
     * Отправляет SSE сообщение клиенту.
     * @param {Object} response - Объект ответа Fastify.
     * @param {Object} data - Данные для отправки.
     * @param {string} [id] - Идентификатор сообщения.
     * @param {string} [event] - Тип события.
     */
    sendEvent: (response, data, id = null, event = null) => {
        if (event) {
            response.write(`event: ${event}\n`);
        }
        if (id) {
            response.write(`id: ${id}\n`);
        }
        // Конвертируем данные в строку JSON и добавляем к полю data
        response.write(`data: ${JSON.stringify(data)}\n\n`);
    },
    getLocalTime: () => {
        return new Date().toLocaleString('ru-RU', {timeZone: 'Europe/Moscow'}).toString();
    },
    runCommand: (command, callback) => {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(stderr);
                    return;
                }
                if (stderr) console.error(`stderr: ${stderr}`);
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });
    },
    checkService: (data) => {
        const ajv = new Ajv();
        const validate = ajv.compile(serviceSchema);
        return validate(data);
    },
    ARTILLERY_FOLDER: 'artillery-volume',
    REPORT_FOLDER: 'reports',
    CONFIG_FOLDER: 'configs',
    STDERR_FOLDER: 'stderrs',
    STDOUT_FOLDER: 'stdouts',
}