// plugins/insult.js

// The list of insults
const insults = [
  "You're like a cloud. When you disappear, it's a beautiful day!",
  "You bring everyone so much joy when you leave the room!",
  "I'd agree with you, but then we'd both be wrong.",
  "You're not stupid; you just have bad luck thinking.",
  "Your secrets are always safe with me. I never even listen to them.",
  "You're proof that even evolution takes a break sometimes.",
  "You have something on your chin... no, the third one down.",
  "You're like a software update. Whenever I see you, I think, 'Do I really need this right now?'",
  "You bring everyone happiness... you know, when you leave.",
  "You're like a penny—two-faced and not worth much.",
  "You have something on your mind... oh wait, never mind.",
  "You're the reason they put directions on shampoo bottles.",
  "You're like a cloud. Always floating around with no real purpose.",
  "Your jokes are like expired milk—sour and hard to digest.",
  "You're like a candle in the wind... useless when things get tough.",
  "You have something unique—your ability to annoy everyone equally.",
  "You're like a Wi-Fi signal—always weak when needed most.",
  "You're proof that not everyone needs a filter to be unappealing.",
  "Your energy is like a black hole—it just sucks the life out of the room.",
  "You have the perfect face for radio.",
  "You're like a traffic jam—nobody wants you, but here you are.",
  "You're like a broken pencil—pointless.",
  "Your ideas are so original, I'm sure I've heard them all before.",
  "You're living proof that even mistakes can be productive.",
  "You're not lazy; you're just highly motivated to do nothing.",
  "Your brain's running Windows 95—slow and outdated.",
  "You're like a speed bump—nobody likes you, but everyone has to deal with you.",
  "You're like a cloud of mosquitoes—just irritating.",
  "You bring people together... to talk about how annoying you are."
];

// prevent double-processing
const processed = new Set();

module.exports = {
  command: 'insult',
  alias: ['roast', 'diss'],
  description: 'Send a random insult to a mentioned user or replied message.',
  category: 'fun',

  /**
   * @param {import('@whiskeysockets/baileys').WASocket} sock
   * @param {object} m
   * @param {object} ctx
   */
  execute: async (sock, m, ctx) => {
    const { reply } = ctx;

    try {
      // de-dup logic
      const mid = m?.key?.id;
      if (mid) {
        if (processed.has(mid)) return;
        processed.add(mid);
        setTimeout(() => processed.delete(mid), 2000); // 2 sec cooldown
      }

      // 1) Determine the target
      // Priority: Mentioned User -> Quoted User -> Fail
      let targetJid = null;

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
      } else if (m.quoted) {
        targetJid = m.quoted.sender;
      }

      if (!targetJid) {
        return reply('📌 Please mention someone or reply to their message to insult them!');
      }

      // 2) Pick a random insult
      const randomInsult = insults[Math.floor(Math.random() * insults.length)];

      // 3) Send the message
      // We mention the user explicitly in the text and the mentions array
      const text = `Hey @${targetJid.split('@')[0]}, ${randomInsult}`;

      await sock.sendMessage(
        m.chat,
        {
          text: text,
          mentions: [targetJid]
        },
        { quoted: m }
      );

    } catch (err) {
      console.error('Insult command error:', err);
      reply('❌ An error occurred while roasting.');
    }
  }
};