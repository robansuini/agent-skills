global.fetch = async (url) => {
  const pathname = new URL(url).pathname;
  const body = pathname.startsWith('/v1/pages/')
    ? { id: 'page-id', archived: true, url: 'https://www.notion.so/page-id' }
    : { id: 'db-id', object: 'database', properties: { Name: { type: 'title' } } };

  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  };
};
