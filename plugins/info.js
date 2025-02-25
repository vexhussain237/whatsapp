const moment = require('moment-timezone');

module.exports = {
    config: {
        name: "info",
        version: "1.0",
        countDown: 20,
        role: 0,
        author: "dipto",
        description: "Owner information",
        category: "owner",
        guide: "{p}"
    },
  onStart: async ({ api, message ,event }) => {
        try {
            const botName = "HUSSAIN X PROJECT🔰❔";
            const botPrefix = ".";
            const authorName = "亗ㅤ𝗠𝗥_𝗛𝗨𝗦𝗦𝗔𝗜𝗡ㅤ亗";
            const ownAge = "16";
            const teamName = "Noobs team";
      const authorFB = "https://www.facebook.com/profile.php?id=61569824475831";
          const authorInsta = " None public";
  const link = "https://i.imgur.com/84j7ykh.jpeg";
        const now = moment().tz('Asia/Dhaka');
      const date = now.format('MMMM Do YYYY');
          const time = now.format('h:mm:ss A');
            const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
const minutes = Math.floor((uptime / 60) % 60);
const hours = Math.floor((uptime / (60 * 60)) % 24);
const days = Math.floor(uptime / (60 * 60 * 24));
const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
            const caption = `
• Bot & Owner Info
╰‣ Bot Name: ${botName}
╰‣ Bot Prefix: ${botPrefix}
╰‣ Owner: ${authorName}
╰‣ Age: ${ownAge}
╰‣ Facebook: ${authorFB}
╰‣ Instagram: ${authorInsta}
╰‣ Date: ${date}
╰‣ Time: ${time}
╰‣ Team: ${teamName}
╰‣ Uptime: ${uptimeString}`;

            const hh = await message.stream(link, caption,"photo")
           // setTimeout(() => {
           //  message.unsend(hh.key);
           // }, 40000);
        } catch (error) {
            console.error("Error reading config file:", error);
        }
    },
onChat: async function ({ body, message }) {
        if (body?.toLowerCase() === "info" || body?.toLowerCase() === "owner") {
            this.onStart({ message });
        }
    }
};
