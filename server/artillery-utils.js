const yaml = require('js-yaml');
const path = require('path');
const fsPromises = require('fs').promises;
const {ARTILLERY_FOLDER, REPORT_FOLDER, CONFIG_FOLDER} = require('./utils');
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });


const volumeName = 'microservices-testing_tests';
const mountPath = '/tests';


const runDockerArtillery = async (REPORT_FILENAME, CONFIG_FILENAME) => {
    return new Promise(async (res, rej) => {
        try {

            const container = await docker.createContainer({
                Image: 'artilleryio/artillery:2.0.10',
                Cmd: ['run', '--output' , `${mountPath}/${REPORT_FOLDER}/${REPORT_FILENAME}`, `${mountPath}/${CONFIG_FOLDER}/${CONFIG_FILENAME}`],
                HostConfig: {
                    Binds: [
                        `${volumeName}:${mountPath}`
                    ],
                    AutoRemove: false
                }
            });

            await container.start();

            const stream = await container.logs({
                follow: true,
                stdout: true,
                stderr: true
            });

            const logs = [];

            stream.on('data', data => logs.push(data.toString()));
            stream.on('end', () => res('Artillery test completed!' + '\n' + logs.join('\n')));

        } catch (error) {
            console.error('Error running artillery:', error);
            rej('Error while Artillery testing');
        }
    });
};

async function reportDockerArtillery(REPORT_FILENAME) {
    return new Promise(async (res, rej) => {
        try {
            const container = await docker.createContainer({
                Image: 'artilleryio/artillery:2.0.10',
                Cmd: ['report', `${mountPath}/${REPORT_FOLDER}/${REPORT_FILENAME}`],
                HostConfig: {
                    Binds: [
                        `${volumeName}:${mountPath}`
                    ],
                    AutoRemove: false
                }
            });

            await container.start();

            const stream = await container.logs({
                follow: true,
                stdout: true,
                stderr: true
            });

            const logs = [];

            stream.on('data', data => logs.push(data.toString()));
            stream.on('end', () => res('Converting successful!' + '\n' + logs.join('\n')));

        } catch (error) {
            console.error('Error with converting report:', error);
            rej('Error with converting report');
        }
    });
}



const transformRouteBodyFields = (bodyFields) => {
    if (typeof bodyFields === 'string' && bodyFields.includes(',')) {
        return bodyFields.split(',').reduce((acc, field) => {
            field = field.trim();
            return { ...acc, [field]: '{{ $randomString() }}' };
        }, {});
    } else if (typeof bodyFields === 'string') {
        return { [bodyFields]: '{{ $randomString() }}' };
    } else {
        return {};
    }
};

const getRouteValue = (route) => {
    const { path, bodyFields } = route;

    return bodyFields ? {
        url: path,
        json: transformRouteBodyFields(bodyFields),
    } : {
        url: route.path,
    }
};

module.exports = {
    runDockerArtillery,
    reportDockerArtillery,
    writeArtilleryConfig: async (service, CONFIG_FILENAME) => {
        const { host, routes, usersStart, usersEnd, duration } = service;

        const artilleryConfig = {
            config: {
                target: host,
                phases: [
                    {
                        duration: duration,
                        arrivalRate: usersStart,
                        rampTo: usersEnd,
                        name: 'Generated load test'
                    }
                ],
                plugins: {
                    apdex: {},
                    'metrics-by-endpoint': {}
                },
                apdex: {
                    threshold: 100
                }
            },
            scenarios: [
                {
                    flow: [
                        {
                            loop: routes.map(route => ({
                                [route.method.toLowerCase()]: getRouteValue(route)
                            })),
                            count: 100
                        }
                    ]
                }
            ]
        };

        const yamlStr = yaml.dump(artilleryConfig);
        const filePath = path.join(__dirname, `${ARTILLERY_FOLDER}/${CONFIG_FOLDER}/${CONFIG_FILENAME}`);
        return fsPromises.writeFile(filePath, yamlStr);
    }
}