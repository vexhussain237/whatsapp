const axios = require("axios");
const fs = require("fs");
const path = require("path");

const selectionData = {};

  module.exports = {
    config: {
      name: "spotify",
      aliases: ["sp"],
      permission: 0,
      prefix: true,
      description: "Search and download songs from Spotify.",
      usage: [
        `${global.config.PREFIX}spotify <song name> - Search for a song on Spotify.`,
        `${global.config.PREFIX}sp <song name> - Alias for the same functionality.`,
      ],
      categories: "Media",
      credit: "Developed by Mohammad Nayan",
    },

  event: async ({ event, api, body }) => {
    const { threadId, senderId, replyMessage } = event;

    if (!selectionData[threadId]) return;
    const { n, userId, results } = selectionData[threadId];

    if (userId !== senderId || !n) return;

    const quotedMessage =
      n.message?.extendedTextMessage?.text || null;


    if (!quotedMessage) return;
    if (replyMessage !== quotedMessage) return;
    if(!n?.key.fromMe) return;


    const selectedIndex = parseInt(body, 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= results.length) {
      await api.sendMessage(threadId, { text: "Invalid selection. Please reply with a number between 1 and 5." });
      return;
    }

    const songData = results[selectedIndex];
    delete selectionData[threadId];

    await api.sendMessage(threadId, { delete: n.key });

    const msg = await api.sendMessage(threadId, { text: `🎧 Downloading *${songData.name}* by *${songData.artists}*...` });

    try {
      const downloadResponse = await axios.get(
        `https://nayan-video-downloader.vercel.app/spotifyDl?url=${songData.link}`
      );

      const { download_url } = downloadResponse.data.data;
      const audioFileName = path.join(__dirname, `temp_audio_${Date.now()}.mp3`);

      const audioStream = await axios({
        url: download_url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(audioFileName);
      audioStream.data.pipe(writer);

      writer.on("finish", async () => {
        try {
          await api.sendMessage(threadId, { delete: msg.key });
          await api.sendMessage(threadId, {
            audio: { url: audioFileName },
            mimetype: "audio/mpeg",
          });

          fs.unlink(audioFileName, (err) => {
            if (err) console.error(`Failed to delete file ${audioFileName}:`, err);
          });
        } catch (sendError) {
          console.error("Error sending audio:", sendError);
          await api.sendMessage(threadId, { text: "Failed to send the song. Please try again." });
        }
      });

      writer.on("error", async (error) => {
        console.error("Error writing audio file:", error);
        await api.sendMessage(threadId, { text: "An error occurred while downloading the song. Please try again." });
      });
    } catch (error) {
      console.error("Error during song download:", error);
      await api.sendMessage(threadId, { text: "Failed to download the song. Please try again later." });
    }
  },

  start: async ({ api, event, args }) => {
    const { threadId, senderId } = event;

    if (!args.length) {
      await api.sendMessage(threadId, { text: "Please provide a song name to search. Example: `spotify <song name>`" });
      return;
    }

    const input = args.join(" ");
    try {
      const searchResponse = await axios.get(
        `https://nayan-video-downloader.vercel.app/spotify-search?name=${encodeURIComponent(input)}&limit=5`
      );

      const results = searchResponse.data.results;

      if (!results || results.length === 0) {
        await api.sendMessage(threadId, { text: "No songs found for the given name. Please try again." });
        return;
      }

      let message = "🎧 Search Results:\n\n";
      results.forEach((song, index) => {
        message += `${index + 1}. ${song.name} by ${song.artists}\n\n`;
      });

      message += "\nReply with a number (1-5) to select a song to download.";
      const n = await api.sendMessage(threadId, { text: message });

      selectionData[threadId] = {
        userId: senderId,
        n,
        results,
      };
    } catch (error) {
      console.error("Error during Spotify search:", error);
      await api.sendMessage(threadId, { text: "An error occurred while searching for songs. Please try again." });
    }
  },
};
