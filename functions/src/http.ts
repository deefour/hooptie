import ky from "ky";

const requestToConsole = (request: Request) =>
  console.log(`${request.method}: ${request.url}`);

export default ky.extend({
  hooks: {
    beforeRequest: [requestToConsole]
  }
});
