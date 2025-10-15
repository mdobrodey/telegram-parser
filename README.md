[![npm version](https://img.shields.io/npm/v/telegram-parser.svg)](https://www.npmjs.com/package/telegram-parser)

# Telegram Parser

Simple library for parsing Telegram resources: channels, bots, public groups, and posts.

## Installation

```bash
npm install telegram-parser
```

## Features

- Parse **channels**: name, avatar, subscribers count, description
- Parse **bots**: name, username, avatar, description
- Parse **groups**: name, avatar, members count, online count, description
- Parse **channel posts**: author, text, media, reactions, views, date
- Parse **group posts**: author username, text, media, date
- Automatically detects resource type

## Usage

### Parse Channel

```javascript
import TelegramParser from './TelegramParser.js';
const parser = new TelegramParser();

const channel = await parser.parse('lepragram');
console.log(channel);
// {
//   type: 'channel',
//   name: 'Лепра',
//   avatar: 'https://...',
//   subscribers: 363520,
//   description: '...'
// }
```

### Parse Bot

```javascript
const bot = await parser.parse('roundifyrobot');
console.log(bot);
// {
//   type: 'bot',
//   name: 'Roundify - Видео в кружок',
//   username: 'roundifyrobot',
//   avatar: 'https://...',
//   description: '...'
// }
```

### Parse Group

```javascript
const group = await parser.parse('restorecord');
console.log(group);
// {
//   type: 'group',
//   name: 'RestoreCord',
//   avatar: 'https://...',
//   members: 1739,
//   online: 41,
//   description: '...'
// }
```

### Parse Channel Post

```javascript
const post = await parser.parse('lepragram/33399');
console.log(post);
// {
//   type: 'channel_post',
//   author: {
//     name: 'Лепра',
//     username: 'Lepragram'
//   },
//   text: 'Это её первый рабочий день...',
//   media: [
//     {
//       type: 'video',
//       url: 'https://cdn4.telesco.pe/file/...'
//     }
//   ],
//   reactions: [
//     { emoji: '🥰', count: 1470 },
//     { emoji: '🤗', count: 237 }
//   ],
//   views: 150000,
//   date: '2023-09-18T05:00:38+00:00',
//   url: 'https://t.me/lepragram/33399'
// }
```

### Parse Group Post

```javascript
const groupPost = await parser.parse('restorecord/207242');
console.log(groupPost);
// {
//   type: 'group_post',
//   author: {
//     name: 'Alex Glass',
//     username: 'Glassweaver'
//   },
//   text: 'Hi! Supoort question:...',
//   media: [],
//   reactions: [],
//   views: 0,
//   date: '2025-10-15T15:29:03+00:00',
//   url: 'https://t.me/restorecord/207242'
// }
```

## API

### `parse(input)`

Parse Telegram resource by username or post path.

**Parameters:**

- `input` (string) - Username (e.g., 'lepragram') or post path (e.g., 'lepragram/33399')

**Returns:**

- Promise<Object> - Parsed data object

## Response Types

### Channel

```javascript
{
  type: 'channel',
  name: string,
  avatar: string | null,
  subscribers: number,
  description: string
}
```

### Bot

```javascript
{
  type: 'bot',
  name: string,
  username: string,
  avatar: string | null,
  description: string
}
```

### Group

```javascript
{
  type: 'group',
  name: string,
  avatar: string | null,
  members: number,
  online: number,
  description: string
}
```

### Channel Post

```javascript
{
  type: 'channel_post',
  author: {
    name: string,
    username: string
  },
  text: string,
  media: Array<{
    type: 'video' | 'photo' | 'video_thumbnail',
    url: string
  }>,
  reactions: Array<{
    emoji: string,
    count: number
  }>,
  views: number,
  date: string,
  url: string
}
```

### Group Post

```javascript
{
  type: 'group_post',
  author: {
    name: string,
    username: string
  },
  text: string,
  media: Array<{
    type: 'video' | 'photo' | 'video_thumbnail',
    url: string
  }>,
  reactions: Array<{
    emoji: string,
    count: number
  }>,
  views: number,
  date: string,
  url: string
}
```
