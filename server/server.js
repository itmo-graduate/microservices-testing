const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const fsPromises = require('fs').promises;

const { sendEvent, getLocalTime, checkService, runCommand, ARTILLERY_FOLDER, CONFIG_FOLDER, REPORT_FOLDER,
    STDOUT_FOLDER, STDERR_FOLDER
} = require('./utils');
const { writeArtilleryConfig } = require('./artillery-utils');
const path = require('path');
const {initFileManager} = require("./fileManager-utils");

fastify.addContentTypeParser(/^application\/.+\+json$/, { parseAs: 'string' }, fastify.getDefaultJsonParser('error', 'ignore'));

fastify.register(cors, {
    origin: '*'
});

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, ARTILLERY_FOLDER),
    prefix: '/public/',
});

const getJSONReportFilename = (serviceId, serviceName) => (
    `${serviceId}-${serviceName}-run-report.json`
);

const getDockerArtilleryRunCommand = (serviceId, serviceName) => (
    `docker run --rm -v $(pwd)/${ARTILLERY_FOLDER}:/tests artilleryio/artillery run --output /tests/${REPORT_FOLDER}/${getJSONReportFilename(serviceId, serviceName)} /tests/${CONFIG_FOLDER}/${serviceId}-${serviceName}.yml`
);

const getDockerArtilleryReportCommand = (serviceId, serviceName) => (
    `docker run --rm -v $(pwd)/${ARTILLERY_FOLDER}:/tests artilleryio/artillery report /tests/${REPORT_FOLDER}/${getJSONReportFilename(serviceId, serviceName)}`
);

const servicesDB = new Map();

initFileManager(fastify);

fastify.get('/run/microservice/:id', async (request, reply) => {
    const sendMessageToFrontend = (message) => {
        sendEvent(reply.raw, { time: getLocalTime(), message });
    };

    const closeConnection = () => {
        reply.raw.end();
    };

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    const serviceId = request.params.id;
    const { name: serviceName, ...service } = servicesDB.get(serviceId);

    if (!checkService(service)) {
        sendMessageToFrontend('Error. The Service has invalid structure');
        reply.raw.end();
        return;
    }

    sendMessageToFrontend('The Service has been initialized');
    sendMessageToFrontend('Creating YML config...');

    try {
        await writeArtilleryConfig(request.params.id, service, serviceName);
    }
    catch (error) {
        console.error(error)
        sendMessageToFrontend('Error with writing Artillery Config. Aborting');
        reply.raw.end();
        return;
    }
    sendMessageToFrontend('Done!');
    sendMessageToFrontend('Running Artillery docker image...');
    runCommand(getDockerArtilleryRunCommand(serviceId, serviceName))
        .then(async (stdout) => {
            const stdoutFilePath = path.join(__dirname, `${ARTILLERY_FOLDER}/${STDOUT_FOLDER}/${serviceId}-${serviceName}-stdout.txt`);
            await fsPromises.writeFile(stdoutFilePath, stdout);
            sendMessageToFrontend('Artillery has successfully finished your task. Stdout written to file ' + stdoutFilePath);
        })
        .catch(async (stderr) => {
            const stderrFilePath = path.join(__dirname, `${ARTILLERY_FOLDER}/${STDERR_FOLDER}/${serviceId}-${serviceName}-stderr.txt`);
            await fsPromises.writeFile(stderrFilePath, stderr);
            sendMessageToFrontend('An error occurred while performing Artillery tests. stderr written to file ' + stderrFilePath);
            return Promise.reject(stderr);
        })
        .then(async () => {
            sendMessageToFrontend('Converting result to HTML format...');
            try {
                const stdout = await runCommand(getDockerArtilleryReportCommand(serviceId, serviceName));
                const stdoutFilePath = path.join(__dirname, `${ARTILLERY_FOLDER}/${STDOUT_FOLDER}/${serviceId}-${serviceName}-convert-stdout.txt`);
                await fsPromises.writeFile(stdoutFilePath, stdout);
                const reportFn = `${REPORT_FOLDER}/${getJSONReportFilename(serviceId, serviceName)}.html`;
                const reportURL = `/public/${reportFn}`;``
                sendMessageToFrontend(`Converting successful. Generated file: ${reportFn}. Logs: ${stdoutFilePath}`);
                sendEvent(reply.raw, { reportURL });
                closeConnection();
            }
            catch (stderr) {
                const filePath = path.join(__dirname, `${ARTILLERY_FOLDER}/${STDERR_FOLDER}/${serviceId}-${serviceName}-convert-stderr.txt`);
                await fsPromises.writeFile(filePath, stderr);
                sendMessageToFrontend(`Converting failed. stderr written to file ${filePath}`);
                closeConnection();
            }
        })
        .catch((error) => {
            closeConnection();
        });

    request.raw.on('close', () => {
        reply.raw.end();
    });
});

fastify.post('/init/microservice/:id', async (request, reply) => {
    const service = request.body.service;
    servicesDB.set(request.params.id, service);

    return { success: true, message: 'ok', receivedData: service };
});

const PORT = process.env.PORT || 5000;

// Запускаем сервер
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
