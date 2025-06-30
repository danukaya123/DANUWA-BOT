const { cmd, commands } = require('../command')
const axios = require('axios');
const cheerio = require('cheerio');

const headers1 = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://google.com',
};


async function getMovieDetailsAndDownloadLinks(query) {
  try {
    const response = await axios.get(`https://cinesubz.lk/?s=${encodeURIComponent(query)}`, { headers1, maxRedirects: 5 });
    const html = response.data;
    const $ = cheerio.load(html);
    const films = [];
    $('article').each((i, element) => {
      const filmName = $(element).find('.details .title a').text().trim();
      const imageUrl = $(element).find('.image .thumbnail img').attr('src');
      const description = $(element).find('.details .contenido p').text().trim();
      const year = $(element).find('.details .meta .year').text().trim();
      const imdbText = $(element).find('.details .meta .rating:first').text().trim();
      const imdb = imdbText.replace('IMDb', '').trim();
      const movieLink = $(element).find('.image .thumbnail a').attr('href');
      films.push({ filmName, imageUrl, description, year, imdb, movieLink });
    });
    for (const film of films) {
      const moviePageResponse = await axios.get(film.movieLink, { headers1, maxRedirects: 5 });
      const moviePageHtml = moviePageResponse.data;
      const $$ = cheerio.load(moviePageHtml);
      const downloadLinks = [];

$$('tr.clidckable-rowdd').each((i, el) => {
  const link = $$(el).attr('data-href');
  const quality = $$(el).find('td').eq(0).text().trim();
  const size = $$(el).find('td').eq(1).text().trim();
  const lang = $$(el).find('td').eq(2).text().trim(); // optional

  if (link && quality && size) {
    downloadLinks.push({ link, quality, size, lang });
  }
});
      film.downloadLinks = downloadLinks;
    }
    return films;
  } catch (error) {
    console.error('❌ Error occurred:', error.message);
    return [];
  }
}


async function scrapeModifiedLink(url) {
  try {
    const response = await axios.get(url, { headers1, maxRedirects: 5 });
    const $ = cheerio.load(response.data);
    let modifiedLink = $('#link').attr('href');
    if (!modifiedLink) {
      console.log("⚠️ Modified link not found!");
      return url; 
    }
    const urlMappings = [
      { search: ["https://google.com/server11/1:/", "https://google.com/server12/1:/", "https://google.com/server13/1:/"], replace: "https://drive2.cscloud12.online/server1/" },
      { search: ["https://google.com/server21/1:/", "https://google.com/server22/1:/", "https://google.com/server23/1:/"], replace: "https://drive2.cscloud12.online/server2/" },
      { search: ["https://google.com/server3/1:/"], replace: "https://drive2.cscloud12.online/server3/" },
      { search: ["https://google.com/server4/1:/"], replace: "https://drive2.cscloud12.online/server4/" }
    ];
    urlMappings.forEach(mapping => {
      mapping.search.forEach(searchUrl => {
        if (modifiedLink.includes(searchUrl)) {
          modifiedLink = modifiedLink.replace(searchUrl, mapping.replace);
        }
      });
    });
        modifiedLink = modifiedLink.replace(".mp4?bot=cscloud2bot&code=", "?ext=mp4&bot=cscloud2bot&code=")
                               .replace(".mp4", "?ext=mp4")
                               .replace(".mkv?bot=cscloud2bot&code=", "?ext=mkv&bot=cscloud2bot&code=")
                               .replace(".mkv", "?ext=mkv")
                               .replace(".zip", "?ext=zip");
    return modifiedLink;
  } catch (error) {
    console.error("❌ Error fetching the page:", error.message);
    return url; 
  }
}

async function getTvSeriesSeasonsAndEpisodes(url) {
  try {
    const res = await axios.get(url, { headers: headers1 });
    const $ = cheerio.load(res.data);

    const seasons = [];

    $('#episodes .se-c').each((i, seasonElem) => {
      const seasonNumber = $(seasonElem).find('.se-q .se-t').text().trim() || `Season ${i+1}`;
      const episodes = [];

      $(seasonElem).find('ul.episodios li').each((j, epElem) => {
        const a = $(epElem).find('a.episode-link');
        const episodeUrl = a.attr('href');
        const episodeNumber = $(epElem).find('.numerando').text().trim();
        const episodeTitle = $(epElem).find('.episodiotitle').text().trim();
        const episodeImage = $(epElem).find('img').attr('src');

        episodes.push({
          episodeNumber,
          episodeTitle,
          episodeUrl,
          episodeImage
        });
      });

      seasons.push({
        seasonNumber,
        episodes
      });
    });
    return seasons;
  } catch (err) {
    console.error('Error fetching TV series seasons/episodes:', err.message);
    return [];
  }
}



async function fetchJsonData(data, url) { try { const response = await axios.post(url, data, { headers: { "Content-Type": "application/json" }, maxRedirects: 5 });
const htmlResponse = await axios.get(url);
const $ = cheerio.load(htmlResponse.data);
const fileSize = $('p.file-info:contains("File Size") span').text().trim();
response.data.fileSize = fileSize || "Unknown";
return response.data;
} catch (error) { console.error("❌ Error fetching JSON data:", error.message); return { error: error.message }; } }


cmd({
  pattern: "film",
  alias: ["movie","cinesub"],
  use: ".film <query>",
  desc: "Search and download movies",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
  try {
    if (!q) return reply('🔎 Please provide a film name.');
    
    await m.react('🎬');

    
    const os = require('os');
    let hostname;
    const hostNameLength = os.hostname().length;
    
    if (hostNameLength === 12) {
      hostname = "𝚁𝙴𝙿𝙻𝙸𝚃";
    } else if (hostNameLength === 36) {
      hostname = "𝙷𝙴𝚁𝙾𝙺𝚄";
    } else if (hostNameLength === 8) {
      hostname = "𝙺𝙾𝚈𝙴𝙱";
    } else {
      hostname = "𝚅𝙿𝚂 || 𝚄𝙽𝙺𝙽𝙾𝚆𝙽";
    }


                
    const films = await getMovieDetailsAndDownloadLinks(q);
    
    if (films.length === 0) {
      return reply('❌ No movies found for your query.');
    }


let filmListMessage = `╔═━━━━━━━◥◣◆◢◤━━━━━━━━═╗  
║     🍁 ＤＡＮＵＷＡ－ 〽️Ｄ 🍁    ║          
╚═━━━━━━━◢◤◆◥◣━━━━━━━━═╝  
    📂 𝗠𝗢𝗩𝗜𝗘 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 📂  
┏━━━━━━━━━━━━━━━━━━━━━━┓  
┃ 🔰 𝗖𝗛𝗢𝗢𝗦𝗘 𝗬𝗢𝗨𝗥 MOVIE         
┃ *💬 REPLY TO NUMBER ❕*  
┗━━━━━━━━━━━━━━━━━━━━━━┛  
┃   ⚙️ M A D E  W I T H ❤️ B Y 
╰─🔥 𝘿𝘼𝙉𝙐𝙆𝘼 𝘿𝙄𝙎𝘼𝙉𝘼𝙔𝘼𝙆𝘼 🔥─╯
─────────────────────────

`;
const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

films.forEach((film, index) => {
  let adjustedIndex = index + 1; 
  let emojiIndex = adjustedIndex.toString().split("").map(num => numberEmojis[num]).join("");
  filmListMessage += `${emojiIndex} *${film.filmName}*
  
`;
});


    const sentMessage = await conn.sendMessage(from, { 
image:{url: "https://github.com/DANUWA-MD/DANUWA-BOT/blob/main/images/film.png?raw=true"},
    caption: `${filmListMessage}`,

        }, { quoted: mek });
    
await conn.sendMessage(from, { react: { text: "✅", key: sentMessage.key } });
            
        conn.ev.on('messages.upsert', async (msgUpdate) => {
      const msg = msgUpdate.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) return;

      const selectedOption = msg.message.extendedTextMessage.text.trim();

      if (msg.message.extendedTextMessage.contextInfo && msg.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        const selectedIndex = parseInt(selectedOption.trim()) - 1;

        if (selectedIndex >= 0 && selectedIndex < films.length) {

  await conn.sendMessage(from, { react: { text: "❤️", key: msg.key } });
          

                                                                      const film = films[selectedIndex];

if (!film.downloadLinks || film.downloadLinks.length === 0) {
   const seasons = await getTvSeriesSeasonsAndEpisodes(film.movieLink);

  if (seasons.length === 0) {
    return conn.sendMessage(from, { text: "❌ No episodes found for this TV series." }, { quoted: msg });
  }
let tvSeriesListMessage = `╔═━━━━━━━◥◣◆◢◤━━━━━━━━═╗  
║     🍁 ＤＡＮＵＷＡ－ 〽️Ｄ 🍁    ║          
╚═━━━━━━━◢◤◆◥◣━━━━━━━━═╝  
 🎞️ 𝗧𝗩 𝗦𝗘𝗥𝗜𝗘𝗦 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎞️  
┏━━━━━━━━━━━━━━━━━━━━━━┓  
┃ 🔰 𝗖𝗛𝗢𝗢𝗦𝗘 𝗬𝗢𝗨𝗥 𝗘𝗣𝗜𝗦𝗢𝗗𝗘         
┃ *💬 REPLY TO NUMBER ❕* 
┗━━━━━━━━━━━━━━━━━━━━━━┛  
┃   ⚙️ M A D E  W I T H ❤️ B Y 
╰─🔥 𝘿𝘼𝙉𝙐𝙆𝘼 𝘿𝙄𝙎𝘼𝙉𝘼𝙔𝘼𝙆𝘼 🔥─╯
─────────────────────────

`;

const numberEmojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

const episodeMap = [];
seasons.forEach((season, i) => {
  const rawSeason = season.seasonNumber?.trim() || '';
  let seasonNumText = /^\d+$/.test(rawSeason) ? `Season ${rawSeason}` : rawSeason || `Season ${i + 1}`;
  seasonNumText = seasonNumText.toUpperCase(); // 🔠 Capitalize it

  // Stylized banner
  tvSeriesListMessage += `\n━━━━━━ 📦 *${seasonNumText}* 📦 ━━━━━━\n`;

  season.episodes.forEach((ep, j) => {
    const emojiIndex = (episodeMap.length + 1).toString().split('').map(n => numberEmojis[n]).join('');
    tvSeriesListMessage += `${emojiIndex} *${ep.episodeTitle}* (${ep.episodeNumber})\n\n`;
    episodeMap.push(ep);
  });
});
// Send as image with caption
const sentEpMessage = await conn.sendMessage(from, {
  image: { url: 'https://github.com/DANUWA-MD/DANUWA-BOT/blob/main/images/film.png?raw=true' },
  caption: tvSeriesListMessage
}, { quoted: msg });

await conn.sendMessage(from, { react: { text: "✅", key: sentEpMessage.key } });

  conn.ev.on('messages.upsert', async (msgUpdate2) => {
    const msg2 = msgUpdate2.messages[0];
    if (!msg2.message || !msg2.message.extendedTextMessage) return;

    const selectedEp = parseInt(msg2.message.extendedTextMessage.text.trim());

    if (
      msg2.message.extendedTextMessage.contextInfo &&
      msg2.message.extendedTextMessage.contextInfo.stanzaId === sentEpMessage.key.id
    ) {
      const epData = episodeMap[selectedEp - 1];
      if (!epData) {
        return conn.sendMessage(from, { text: "❌ Invalid episode number." }, { quoted: msg2 });
      }
    await conn.sendMessage(from, { react: { text: "❤️", key: msg2.key } });

      // Now fetch download links from the episode page
      const epPage = await axios.get(epData.episodeUrl, { headers: headers1 });
      const $$ = cheerio.load(epPage.data);
      const epLinks = [];

      $$('tr.clidckable-rowdd').each((i, el) => {
        const link = $$(el).attr('data-href');
        const quality = $$(el).find('td').eq(0).text().trim();
        const size = $$(el).find('td').eq(1).text().trim();
        if (link && quality && size) {
          epLinks.push({ link, quality, size });
        }
      });

      if (epLinks.length === 0) {
        return conn.sendMessage(from, { text: "⚠️ No download links found for this episode." }, { quoted: msg2 });
      }
let linkMsg = `╔═══════════════════════╗
║     *📣 DOWNLOAD QUALITY 📣*     ║
╚═══════════════════════╝
🎬  *${epData.episodeTitle}*  (${epData.episodeNumber})
┏━━━━━━━━━━━━━━━━━━━━━━┓  
┃ ⚠️ *NOTE:*        
┃ *🔸 Please select a number* 
┃    *corresponding to the quality* 
┃ *🔸 Larger sizes may take longer to* 
┃    *download*
┗━━━━━━━━━━━━━━━━━━━━━━┛ 
*💡Tip: Use Wi-Fi for fast downloads!*
─────────────────────────
*📝CHOOSE EPISODE QUALITY❕👀*
─────────────────────────

`;
      const epJsonResponses = [];

      for (let i = 0; i < epLinks.length; i++) {
        const emoji = (i + 1).toString().split("").map(n => numberEmojis[n]).join("");
        const modified = await scrapeModifiedLink(epLinks[i].link);
        const jsonResp = await fetchJsonData({ direct: true }, modified);
        epJsonResponses.push(jsonResp);

        linkMsg += `${emoji} *${epLinks[i].quality} - ${jsonResp.fileSize}*\n`;
      }

      const sentQualMsg = await conn.sendMessage(from, {
        image: { url: epData.episodeImage },
        caption: linkMsg
      }, { quoted: msg2 });

    await conn.sendMessage(from, { react: { text: "✅", key: sentQualMsg.key } });

      conn.ev.on('messages.upsert', async (msgUpdate3) => {
        const msg3 = msgUpdate3.messages[0];
        if (!msg3.message || !msg3.message.extendedTextMessage) return;

        const choice = parseInt(msg3.message.extendedTextMessage.text.trim());
        if (
          msg3.message.extendedTextMessage.contextInfo &&
          msg3.message.extendedTextMessage.contextInfo.stanzaId === sentQualMsg.key.id
        ) {
          const chosenFile = epJsonResponses[choice - 1];
          if (!chosenFile?.url) return conn.sendMessage(from, { text: "❌ Invalid quality." }, { quoted: msg3 });
        await conn.sendMessage(from, {
          react: {
            text: "❤️",
            key: msg3.key
          }
        });
await conn.sendMessage(from, {
  text: `    ⌛ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🎬 *EPISODE:* ${epData.episodeTitle}
┃ 🎞️ *NUMBER:* ${epData.episodeNumber}
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ ❤️ Preparing your download...
┃ 🔃 This may take a few seconds.
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ *💡Tip: Use Wi-Fi for fast downloads!*
╰────────────────────────╯`
}, { quoted: msg3 });
const epCaption = `╭━[ *✅DOWNLOAD COMPLETE✅* ]━⬣
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🎬 *${film.filmName}*
┃ 🎞️ *${epData.episodeTitle}*
┃ 📅 *Season/Episode:* ${epData.episodeNumber}
┃ 💾 *Size:* ${chosenFile.fileSize}
┃━━━━━━━━━━━━━━━━━━━━━━━⬣ 
┃   ⚙️ M A D E  W I T H ❤️ B Y 
╰─🔥 𝘿𝘼𝙉𝙐𝙆𝘼 𝘿𝙄𝙎𝘼𝙉𝘼𝙔𝘼𝙆𝘼 🔥─╯`;

await conn.sendMessage(from, {
  document: { url: chosenFile.url },
  mimetype: "video/mp4",
  fileName: `${epData.episodeTitle}.mp4`,
  caption: epCaption,
}, { quoted: msg3 });

        await conn.sendMessage(from, { react: { text: "✅", key: msg3.key } });
        }
      });
    }
  });

  return; // prevent movie logic from running
}

let filmDetailsMessage = `─────────────────────────        
🎬  *${film.filmName}*  (${film.year})
─────────────────────────
⭐️  *IMDb Rating:* ${film.imdb}
📝  *Description:*
${film.description}

`;


const filteredDownloadLinks = film.downloadLinks.filter(dl => !dl.quality.includes("Telegram"));

let jsonResponses = []; 

if (filteredDownloadLinks.length > 0) {
    filmDetailsMessage += `─────────────────────────
📝CHOOSE MOVIE QUALITY❕👀
─────────────────────────
    
`;

    const numberEmojis1 = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];

    for (const [index, dl] of filteredDownloadLinks.entries()) {
        const emojiIndex1 = (index + 1).toString().split("").map(num => numberEmojis1[num]).join(""); 

        const modifiedLink = await scrapeModifiedLink(dl.link);
        const jsonResponse = await fetchJsonData({ direct: true }, modifiedLink);

jsonResponses.push(jsonResponse);

        if (!jsonResponse.url) continue; 
        let cleanedQuality = dl.quality.replace(/(SD|HD|BluRay|FHD|WEBRip|WEB-DL|WEBDL|Direct)/gi, "").trim(); 

filmDetailsMessage += `${emojiIndex1} *${cleanedQuality} - ${jsonResponse.fileSize}*
`;
      
     }
} 

const sentMessage1 = await conn.sendMessage(from, { 
image:{url: `${film.imageUrl}`},
    caption: `${filmDetailsMessage}`,

        }, { quoted: msg });

await conn.sendMessage(from, { react: { text: "✅", key: sentMessage1.key } });



conn.ev.on('messages.upsert', async (msgUpdate) => {
    const msg1 = msgUpdate.messages[0];
    if (!msg1.message || !msg1.message.extendedTextMessage) return;

    const selectedOption = msg1.message.extendedTextMessage.text.trim();

    if (msg1.message.extendedTextMessage.contextInfo && msg1.message.extendedTextMessage.contextInfo.stanzaId === sentMessage1.key.id) {
        const selectedIndex1 = parseInt(selectedOption) - 1;

        if (selectedIndex1 >= 0 && selectedIndex1 < jsonResponses.length) {

await conn.sendMessage(from, { react: { text: "⬇️", key: msg1.key } });

           
  if (!jsonResponses[selectedIndex1].url) {
    await conn.sendMessage(from, { react: { text: "❌", key: msg1.key } });
    await conn.sendMessage(from, { text: "❌ Invalid selection. Please select a valid number." }, { quoted: msg1 });
    return;
}          
             

if (["𝙷𝙴𝚁𝙾𝙺𝚄", "𝙺𝙾𝚈𝙴𝙱"].includes(hostname)) {
    await conn.sendMessage(from, { react: { text: "⭕", key: msg1.key } });
    await conn.sendMessage(from, { text: `⭕ *Cannot send large files on ${hostname}.*
    
    ⚠️ This platform has restrictions on sending large media files. Please use a VPS or a suitable server.` }, { quoted: msg1 });
    return;
}

        
await conn.sendMessage(from, {
  text: `    ⌛ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗪𝗔𝗜𝗧...
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🎬 *${film.filmName}*
┃ 📅 *Year:* ${film.year}
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ ❤️ Preparing your download...
┃ 🔃 This may take a few seconds.
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 💡 *Tip:* Use Wi-Fi for fast downloads!
╰────────────────────────╯`
}, { quoted: msg1 });

// 2. Send document with caption
await conn.sendMessage(from, {
  document: { url: `${jsonResponses[selectedIndex1].url}` },
  mimetype: "video/mp4",
  fileName: `${film.filmName}.mp4`,
  caption: `╭━[ *✅DOWNLOAD COMPLETE✅* ]━⬣
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ 🎬 *${film.filmName}*
┃ 📅 *Year:* ${film.year}
┃ ⭐ *IMDb:* ${film.imdb}
┃ 💾 *Size:* ${jsonResponses[selectedIndex1].fileSize}
┃━━━━━━━━━━━━━━━━━━━━━━━⬣
┃ ⚙️ M A D E  W I T H ❤️  B Y 
╰─🔥 𝘿𝘼𝙉𝙐𝙆𝘼 𝘿𝙄𝙎𝘼𝙉𝘼𝙔𝘼𝙆𝘼 🔥─╯`
}, { quoted: msg1 });


await conn.sendMessage(from, { react: { text: "✅", key: msg1.key } });

        } else {
            await conn.sendMessage(from, { react: { text: "❌", key: msg1.key } });
            await conn.sendMessage(from, { text: "❌ Invalid selection. Please select a valid number." }, { quoted: msg1 });
        }
    }
});                                                                                                                                   } else {
            await conn.sendMessage(from, { react: { text: "❌", key: msg.key } });
            await conn.sendMessage(from, { text: "❌ Invalid selection. Please select a valid number." }, { quoted: msg });
        }
      }
    });

  } catch (error) {
    console.error(error);
    reply('⚠️ An error occurred while searching for films.');
  }
});
