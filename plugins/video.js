const fs = require('fs');
const axios = require('axios');
const path = require('path');
const nayan = require('nayan-videos-downloader');
const Youtube = require('youtube-search-api');

const selectionData = {};

async function downloadMusicFromYoutube(link, filePath) {
  if (!link) throw new Error('Link Not Found');
  const timestart = Date.now();

  try {
    const data = await nayan.ytdown(link);

    const audioUrl = data.data.video;

    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: audioUrl,
        responseType: 'stream',
      })
        .then((response) => {
          const writer = fs.createWriteStream(filePath);
          response.data
            .pipe(writer)
            .on('finish', () => {
              resolve({
                title: data.data.title,
                timestart,
              });
            })
            .on('error', reject);
        })
        .catch(reject);
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  config: {
    name: 'video',
    aliases: ['v'],
    permission: 0,
    prefix: true,
    description: 'Search and download video from YouTube.',
    usage: ['video <keyword> - Search and download videos from YouTube.'],
    categories: 'Media',
    credit: 'Developed by Mohammad Nayan',
  },

  event: async ({ event, api, body }) => {
    const { threadId, senderId } = event;

    if (!selectionData[threadId]) return;

    const { userId, message, links } = selectionData[threadId];


    if (userId !== senderId || !message) return;
    if(!message?.key.fromMe) return;


    const selectedIndex = parseInt(body, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= links.length) {
      await api.sendMessage(threadId, { text: 'Invalid selection. Reply with a number between 1 and 6.' });
      return;
    }

    delete selectionData[threadId];
    await api.sendMessage(threadId, { delete: message.key });



    const selectedLink = `https://www.youtube.com/watch?v=${links[selectedIndex]}`;
    const filePath = path.join(__dirname, `cache/song_${Date.now()}.mp4`);
    const downloadMsg = await api.sendMessage(threadId, { text: '🎧 Downloading your video...' });

    try {
      const result = await downloadMusicFromYoutube(selectedLink, filePath);

      await api.sendMessage(threadId, { delete: downloadMsg.key });
      
      await api.sendMessage(threadId, {
        video: { url: filePath },
        caption: `🎵 Title: ${result.title}\n⏱️ Processing Time: ${Math.floor((Date.now() - result.timestart) / 1000)} seconds.`,
      });

      fs.unlink(filePath, (err) => {
        if (err) console.error(`Failed to delete file: ${filePath}`);
      });
    } catch (error) {
      console.error('Error during video download:', error);
      await api.sendMessage(threadId, { text: '❌ Failed to download the video. Please try again later.' });
    }
  },

  start: async ({ event, api, args }) => {
    const { threadId, senderId } = event;

    if (!args[0]) {
      await api.sendMessage(threadId, { text: '» উফফ আবাল কি ভিডিও দেখতে চাস তার ২/১ লাইন তো লেখবি নাকি 🥵\nExample: video <keyword>' });
      return;
    }

    const keyword = args.join(' ');

    try {
      const results = await Youtube.GetListByKeyword(keyword, false, 6);
      const links = results.items.map((item) => item.id);
      const titles = results.items.map((item, index) => `${index + 1}. ${item.title} (${item.length.simpleText})`);

      const message = `🔎 Found ${links.length} results for "${keyword}":\n\n${titles.join('\n')}\n\nReply with a number (1-${links.length}) to download.`;
      const msg = await api.sendMessage(threadId, { text: message });

      selectionData[threadId] = {
        userId: senderId,
        message: msg,
        links,
      };
    } catch (error) {
      console.error('Error searching YouTube:', error);
      await api.sendMessage(threadId, { text: '❌ An error occurred while searching for video. Please try again.' });
    }
  },
};
