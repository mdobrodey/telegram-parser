import * as cheerio from 'cheerio';

/**
 * Main parser for Telegram resources (channels, bots, groups, posts)
 */
class TelegramParser {
  constructor() {
    this.baseUrl = 'https://t.me';
    this.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Parse Telegram resource by username or post URL
   * @param {string} input - Username or post URL (e.g., 'lepragram' or 'lepragram/33399')
   * @returns {Promise<Object>} Parsed data
   */
  async parse(input) {
    const cleanInput = this._cleanUsername(input);

    if (cleanInput.startsWith('+')) {
      return {
        error: 'Private group parsing is not possible',
        type: 'private_group',
      };
    }

    // Check if input is a post (contains /)
    if (cleanInput.includes('/')) {
      return this.parsePost(cleanInput);
    }

    const url = `${this.baseUrl}/${cleanInput}`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const type = this._detectType($);

      if (type === 'channel') {
        return this._parseChannel($);
      } else if (type === 'bot') {
        return this._parseBot($);
      } else if (type === 'group') {
        return this._parseGroup($);
      }

      return { error: 'Unknown resource type' };
    } catch (error) {
      return {
        error: error.message,
        type: 'error',
      };
    }
  }

  /**
   * Parse Telegram post (channel or group message)
   * @param {string} postPath - Post path (e.g., 'lepragram/33399')
   * @returns {Promise<Object>} Parsed post data
   */
  async parsePost(postPath) {
    const url = `${this.baseUrl}/${postPath}?embed=1&mode=tme`;

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': this.userAgent },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const message = $('.tgme_widget_message');

      if (message.length === 0) {
        return { error: 'Post not found' };
      }

      const authorInGroup = $('.tgme_widget_message_author_name').length > 0;

      return {
        type: authorInGroup ? 'group_post' : 'channel_post',
        author: this._parseAuthor($, authorInGroup),
        text: this._parseText($),
        media: this._parseMedia($),
        reactions: this._parseReactions($),
        views: this._parseViews($),
        date: this._parseDate($),
        url: `${this.baseUrl}/${postPath}`,
      };
    } catch (error) {
      return {
        error: error.message,
        type: 'error',
      };
    }
  }

  /**
   * Parse post author information
   * @param {Object} $ - Cheerio instance
   * @param {boolean} isGroup - Whether post is from a group
   * @returns {Object} Author data
   */
  _parseAuthor($, isGroup) {
    if (isGroup) {
      const authorName = $('.tgme_widget_message_author_name span')
        .text()
        .trim();
      const authorLink =
        $('.tgme_widget_message_author_name').attr('href') || '';
      const username = authorLink.split('/').pop() || '';

      return {
        name: authorName,
        username: username,
      };
    }

    const ownerName = $('.tgme_widget_message_owner_name span').text().trim();
    const ownerLink = $('.tgme_widget_message_owner_name').attr('href') || '';
    const username = ownerLink.split('/').pop() || '';

    return {
      name: ownerName,
      username: username,
    };
  }

  /**
   * Parse post text content
   * @param {Object} $ - Cheerio instance
   * @returns {string} Text content
   */
  _parseText($) {
    return $('.tgme_widget_message_text').text().trim();
  }

  /**
   * Parse post media (photos, videos)
   * @param {Object} $ - Cheerio instance
   * @returns {Array} Media URLs
   */
  _parseMedia($) {
    const media = [];

    // Parse videos
    $('video').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        media.push({
          type: 'video',
          url: src,
        });
      }
    });

    // Parse photos
    $('.tgme_widget_message_photo_wrap').each((i, elem) => {
      const style = $(elem).attr('style') || '';
      const urlMatch = style.match(/url\('([^']+)'\)/);
      if (urlMatch && urlMatch[1]) {
        media.push({
          type: 'photo',
          url: urlMatch[1],
        });
      }
    });

    // Parse video thumbnails if no video src found
    if (media.filter((m) => m.type === 'video').length === 0) {
      $('.tgme_widget_message_video_thumb').each((i, elem) => {
        const style = $(elem).attr('style') || '';
        const urlMatch = style.match(/url\('([^']+)'\)/);
        if (urlMatch && urlMatch[1]) {
          media.push({
            type: 'video_thumbnail',
            url: urlMatch[1],
          });
        }
      });
    }

    return media;
  }

  /**
   * Parse post reactions
   * @param {Object} $ - Cheerio instance
   * @returns {Array} Reactions with emoji and count
   */
  _parseReactions($) {
    const reactions = [];

    $('.tgme_widget_message_reactions .tgme_reaction').each((i, elem) => {
      const emoji = $(elem).find('.emoji b').text().trim();
      const countText = $(elem).text().replace(emoji, '').trim();
      const count = this._parseNumberWithSuffix(countText);

      if (emoji && count > 0) {
        reactions.push({
          emoji: emoji,
          count: count,
        });
      }
    });

    return reactions;
  }

  /**
   * Parse post views count
   * @param {Object} $ - Cheerio instance
   * @returns {number} Views count
   */
  _parseViews($) {
    const viewsText = $('.tgme_widget_message_views').text().trim();
    return this._parseNumberWithSuffix(viewsText);
  }

  /**
   * Parse post date
   * @param {Object} $ - Cheerio instance
   * @returns {string} ISO date string
   */
  _parseDate($) {
    const datetime = $('.tgme_widget_message_date time').attr('datetime');
    return datetime || '';
  }

  /**
   * Parse channel data
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Channel data
   */
  _parseChannel($) {
    const avatar = $('.tgme_page_photo_image').attr('src') || null;
    const name = $('.tgme_page_title span').text().trim();
    const subscribersText = $('.tgme_page_extra').text().trim();
    const subscribers = this._parseNumber(subscribersText);
    const description = $('.tgme_page_description').text().trim();
    const isVerified = $('.tgme_page_title .verified-icon').length > 0 ? 1 : 0;

    return {
      type: 'channel',
      name,
      avatar,
      subscribers,
      description,
      isVerified,
    };
  }

  /**
   * Parse bot data
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Bot data
   */
  _parseBot($) {
    const avatar = $('.tgme_page_photo_image').attr('src') || null;
    const name = $('.tgme_page_title span').text().trim();
    const username = $('.tgme_page_extra').text().trim().replace('@', '');
    const description = $('.tgme_page_description').text().trim();

    return {
      type: 'bot',
      name,
      username,
      avatar,
      description,
    };
  }

  /**
   * Parse group data
   * @param {Object} $ - Cheerio instance
   * @returns {Object} Group data
   */
  _parseGroup($) {
    const avatar = $('.tgme_page_photo_image').attr('src') || null;
    const name = $('.tgme_page_title span').text().trim();
    const extraText = $('.tgme_page_extra').text().trim();
    const description = $('.tgme_page_description').text().trim();
    const isVerified = $('.tgme_page_title .verified-icon').length > 0 ? 1 : 0;

    const members = this._parseMembersInfo(extraText);

    return {
      type: 'group',
      name,
      avatar,
      members: members.total,
      online: members.online,
      description,
      isVerified,
    };
  }

  /**
   * Detect resource type
   * @param {Object} $ - Cheerio instance
   * @returns {string} Resource type
   */
  _detectType($) {
    const actionButton = $('.tgme_action_button_new').text().trim();
    const extra = $('.tgme_page_extra').text().trim();

    if (actionButton.includes('Start Bot')) {
      return 'bot';
    }

    if (extra.includes('online')) {
      return 'group';
    }

    if (extra.includes('subscribers')) {
      return 'channel';
    }

    return 'unknown';
  }

  /**
   * Parse number from text
   * @param {string} text - Text with number
   * @returns {number} Parsed number
   */
  _parseNumber(text) {
    const match = text.match(/[\d\s]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/\s/g, ''));
  }

  /**
   * Parse number with K/M suffix
   * @param {string} text - Text with number (e.g., '1.47K', '150K', '2M')
   * @returns {number} Parsed number
   */
  _parseNumberWithSuffix(text) {
    if (!text) return 0;

    const cleaned = text.replace(/\s/g, '');

    if (cleaned.includes('K')) {
      const num = parseFloat(cleaned.replace('K', ''));
      return Math.round(num * 1000);
    }

    if (cleaned.includes('M')) {
      const num = parseFloat(cleaned.replace('M', ''));
      return Math.round(num * 1000000);
    }

    return parseInt(cleaned) || 0;
  }

  /**
   * Parse members information from text
   * @param {string} text - Text with members info
   * @returns {Object} Members data
   */
  _parseMembersInfo(text) {
    const totalMatch = text.match(/([\d\s]+)\s+members?/);
    const onlineMatch = text.match(/([\d\s]+)\s+online/);

    return {
      total: totalMatch ? parseInt(totalMatch[1].replace(/\s/g, '')) : 0,
      online: onlineMatch ? parseInt(onlineMatch[1].replace(/\s/g, '')) : 0,
    };
  }

  /**
   * Clean username from special characters
   * @param {string} username - Raw username
   * @returns {string} Cleaned username
   */
  _cleanUsername(username) {
    return username.replace(/^@/, '').trim();
  }
}

export default TelegramParser;
