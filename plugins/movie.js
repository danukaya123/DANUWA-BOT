const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://cinesubz.lk/movies/vidaamuyarchi-2025-sinhala-subtitles/'; // replace with actual movie URL
  const res = await axios.get(url);
  const $$ = cheerio.load(res.data);

  const downloadLinks = [];
  $$('tr.clidckable-rowdd').each((i, el) => {
    const link = $$(el).attr('data-href');
    const quality = $$(el).find('td').eq(0).text().trim();
    const size = $$(el).find('td').eq(1).text().trim();
    const lang = $$(el).find('td').eq(2).text().trim();
    if (link && quality && size) downloadLinks.push({ link, quality, size, lang });
  });

  console.log(downloadLinks);
}

testScrape();
