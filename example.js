import TelegramParser from 'telegram-parser';

/**
 * Usage examples for TelegramParser
 */
async function examples() {
  const parser = new TelegramParser();

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

  console.log('\n=== Parsing group ===');
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

  console.log('\n=== Getting last 5 posts from channel ===');
  const lastPosts = await parser.getLastPosts('lepragram', 5);
  console.log(lastPosts);
  /*
  Expected output:
  {
    type: 'channel_posts',
    posts: [
      {
        id: '33399',
        url: 'https://t.me/lepragram/33399',
        author: {
          name: 'Лепра',
          username: 'lepragram'
        },
        text: 'Это её первый рабочий день...',
        date: '2023-09-18T05:00:38+00:00',
        views: 150000,
        media: [
          {
            type: 'photo',
            url: 'https://cdn4.telesco.pe/file/...'
          }
        ],
        forwarded: false
      },
      {
        id: '33398',
        url: 'https://t.me/lepragram/33398',
        author: {
          name: 'Лепра',
          username: 'lepragram'
        },
        text: 'Следующий пост...',
        date: '2023-09-17T10:15:22+00:00',
        views: 95000,
        media: [],
        forwarded: true
      },
      ...
    ],
    url: 'https://t.me/s/lepragram'
  }
  */
}

examples().catch(console.error);
