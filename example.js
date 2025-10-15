import TelegramParser from 'telegram-parser';

/**
 * Usage examples for TelegramParser
 */
async function examples() {
  const parser = new TelegramParser();

  // Example 1: Parse channel
  console.log('=== Parsing channel ===');
  const channel = await parser.parse('lepragram');
  console.log(channel);
  /*
  Expected output:
  {
    type: 'channel',
    name: 'Лепра',
    avatar: 'https://cdn4.telesco.pe/file/...',
    subscribers: 363520,
    description: '...',
    isVerified: 0
  }
  */

  // Example 2: Parse bot
  console.log('\n=== Parsing bot ===');
  const bot = await parser.parse('roundifyrobot');
  console.log(bot);
  /*
  Expected output:
  {
    type: 'bot',
    name: 'Roundify - Видео в кружок',
    username: 'roundifyrobot',
    avatar: 'https://cdn4.telesco.pe/file/...',
    description: '...'
  }
  */

  // Example 3: Parse group
  console.log('\n=== Parsing public group ===');
  const group = await parser.parse('restorecord');
  console.log(group);
  /*
  Expected output:
  {
    type: 'group',
    name: 'RestoreCord',
    avatar: 'https://cdn4.telesco.pe/file/...',
    members: 1739,
    online: 41,
    description: '...',
    isVerified: 0
  }
  */

  // Example 4: Parse channel post
  console.log('\n=== Parsing channel post ===');
  const channelPost = await parser.parse('lepragram/33399');
  console.log(channelPost);
  /*
  Expected output:
  {
    type: 'channel_post',
    author: {
      name: 'Лепра',
      username: 'Lepragram'
    },
    text: 'Это её первый рабочий день, отнеситесь с пониманием 😀',
    media: [
      {
        type: 'video',
        url: 'https://cdn4.telesco.pe/file/...'
      }
    ],
    reactions: [
      { emoji: '🥰', count: 1470 },
      { emoji: '🤗', count: 237 },
      { emoji: '🤣', count: 152 },
      ...
    ],
    views: 150000,
    date: '2023-09-18T05:00:38+00:00',
    url: 'https://t.me/lepragram/33399'
  }
  */

  // Example 5: Parse group post
  console.log('\n=== Parsing group post ===');
  const groupPost = await parser.parse('restorecord/207242');
  console.log(groupPost);
  /*
  Expected output:
  {
    type: 'group_post',
    author: {
      name: 'Alex Glass',
      username: 'Glassweaver'
    },
    text: 'Hi! Supoort question:...',
    media: [],
    reactions: [],
    views: 0,
    date: '2025-10-15T15:29:03+00:00',
    url: 'https://t.me/restorecord/207242'
  }
  */
}

examples().catch(console.error);
