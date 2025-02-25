module.exports = {
  event: 'add',
  handle: async ({ api, event }) => {
    const newMembers = event.participants;
    for (const member of newMembers) {
      await api.sendMessage(event.id, {
        text: `Welcome @${member.split('@')[0]}!`,
        mentions: [member]
      });
    }
  }
};
