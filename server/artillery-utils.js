const yaml = require('js-yaml');
const path = require('path');
const fsPromises = require('fs').promises;
const {ARTILLERY_FOLDER} = require('./utils');

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
    writeArtilleryConfig: async (id, service, serviceName) => {
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
        const filePath = path.join(__dirname, `${ARTILLERY_FOLDER}/configs/${id}-${serviceName}.yml`);
        return fsPromises.writeFile(filePath, yamlStr);
    }
}