module.exports = {
    config: {
        name: 'reply',
        version: '1.1',
        author: 'Hassan',
        shortDescription: {
            en: 'Replies to a specific message'
        },
        longDescription: {
            en: 'Bot replies to the message you replied to, quoting it like real chat apps.'
        },
        category: 'chat',
        guide: {
            en: 'Just reply to any message with: /reply [your reply]'
        }
    },

    onStart: async function ({ api, event, args }) {
        const replyText = args.join(' ');
        if (!replyText) {
            return api.sendMessage('Please provide a reply message.', event.threadID, event.messageID);
        }

        // Check if the command was sent as a reply to another message
        if (event.messageReply) {
            const originalMsg = event.messageReply.body || 'Unknown message';
            const response = `「${originalMsg}」\n↳ ${replyText}`;
            return api.sendMessage(response, event.threadID, event.messageID);
        } else {
            return api.sendMessage('Please reply to a message to use this command.', event.threadID, event.messageID);
        }
    }
};