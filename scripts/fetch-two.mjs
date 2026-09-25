async function info(title) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: '400',
    titles: title,
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': 'fc27-israel-dev/1.0' },
  });
  const data = await response.json();
  const page = Object.values(data.query.pages)[0];
  console.log(page.title, page.imageinfo?.[0]?.thumburl || page.imageinfo?.[0]?.url || 'NO');
}

async function search(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    list: 'search',
    srnamespace: '6',
    srlimit: '8',
    srsearch: query,
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
    headers: { 'User-Agent': 'fc27-israel-dev/1.0' },
  });
  const data = await response.json();
  console.log('---', query);
  for (const row of data.query.search) console.log(row.title);
}

await info('File:Luis Suárez 2018.jpg');
await search('Adam Montgomery football');
