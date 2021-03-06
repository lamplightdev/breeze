const arc = require('@architect/functions');

const render = require('./ssr.js');

exports.handler = arc.http.async(async (req) => {
  return {
    session: {
      blah: Date.now(),
    },
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: await render(),
  };
});
