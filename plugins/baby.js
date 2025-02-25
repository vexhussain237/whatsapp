const axios = require('axios');

module.exports.config = {
    name: "baby",
    version: "1.0",
    credits: "Dipto",
    role: 0,
    prefix: false,
    description: "Talk to baby bot",
    commandCategory: "fun",
    guide: "baby [message]",
    coolDowns: 5,
    premium: false
};

module.exports.onStart = async ({ event, message, args }) =>{

    const userMessage = args.join(' ');
    if(!userMessage){
        return message.reply("bolo baby" )
    }
    try {
        const apiUrl = `${global.functions.config.api}/baby?text=${encodeURIComponent(userMessage)}&senderID=11`;
      const response = await axios.get(apiUrl);
        const data = response.data.reply;

      const info = await message.reply(data)
    
    const infoID = info.key.id; 
    const author = event.key.participant;
     
    global.functions.reply.set(infoID, {
      commandName: this.config.name,
       type: "reply",
       messageID: infoID,
        author
    });
           
    } catch (error) {
        console.error('Error:', error);
        message.reply('Sorry, something went wrong!');
    }
};

module.exports.reply = async function ({ event, message ,args, Reply }) {
     const { data } = Reply;
    try {
        const userMessage = args?.join(' ')
        const apiUrl = `${global.functions.config.api}/baby?text=${encodeURIComponent(userMessage)}&senderID=11`;
        const response = await axios.get(apiUrl);
        const reply = response.data.reply;
     const info = await message.reply(reply)
        
        const infoID = info.key.id; 
        const author = event.participant;

    global.functions.reply.set(infoID, {
      commandName: this.config.name,
       type: "reply",
       messageID: infoID,
        author
    });

    } catch (error) {
        console.error('Error:', error);
        message.reply("error 🦆")
    }
};
