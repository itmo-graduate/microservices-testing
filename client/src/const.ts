const SERVER_PORT = 5000;

const protocol = window.location.protocol;
const hostname = window.location.hostname;
const urlWithoutPort = `${protocol}//${hostname}`;

export const SERVER_HOST = `${urlWithoutPort}:${SERVER_PORT}`;
