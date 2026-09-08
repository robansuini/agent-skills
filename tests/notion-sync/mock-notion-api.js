const { EventEmitter } = require('events');
const https = require('https');

https.request = (options, callback) => {
  const request = new EventEmitter();

  request.write = () => {};
  request.end = () => {
    process.nextTick(() => {
      const response = new EventEmitter();
      response.statusCode = 200;
      callback(response);

      const body = options.path.startsWith('/v1/pages/')
        ? { id: 'page-id', archived: true, url: 'https://www.notion.so/page-id' }
        : { id: 'db-id', object: 'database', properties: { Name: { type: 'title' } } };

      response.emit('data', JSON.stringify(body));
      response.emit('end');
    });
  };

  return request;
};
