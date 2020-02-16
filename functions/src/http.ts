// eslint-disable-next-line @typescript-eslint/no-var-requires
const ky = require("ky-universal");

const requestToConsole = (request: Request): void =>
  console.log(`${request.method}: ${request.url.substr(0, 50)}...`);

export default ky.extend({
  hooks: {
    beforeRequest: [requestToConsole]
  }
});
