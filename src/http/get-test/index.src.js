import arc from 'https://raw.githubusercontent.com/architect/functions-deno/main/src/index.js';

export const handler = arc.http.async((req) => {
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf8',
      'cache-control':
        'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
    },
    body: `<h1>Hi (${req.session.blah})</h1>`,
  };
});
