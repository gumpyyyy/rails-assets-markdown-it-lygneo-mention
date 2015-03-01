// Process @mention

'use strict';

//////////////////////////////////////////////////////////////////////////
// Renderer partials

function mention_open(tokens, idx) {
  return '<a href="' +
         tokens[idx].content +
         '" class="' +
         tokens[idx].linkclass +
         '">';
}

function mention_close() { return '</a>'; }

function mention_text(tokens, idx) {
  return tokens[idx].content;
}

//////////////////////////////////////////////////////////////////////////

function isLinkOpen(str)  { return /^<a[>\s]/i.test(str); }
function isLinkClose(str) { return /^<\/a\s*>/i.test(str); }

module.exports = function mention_plugin(md, options) {

  var arrayReplaceAt = md.utils.arrayReplaceAt;
  var escapeHtml = md.utils.escapeHtml;
  var mentions = [];
  var currentUserId;
  var allowHovercards;

  if (typeof options.mentions !== 'undefined') {
    mentions = options.mentions;
  }

  if (typeof options.currentUserId !== 'undefined') {
    currentUserId = options.currentUserId;
  }

  if (typeof options.allowHovercards !== 'undefined') {
    allowHovercards = options.allowHovercards;
  }

  function findPersonById(id) {
    var i;
    for (i = 0; i < mentions.length; i++) {
      if (id === mentions[i].lygneo_id || id === mentions[i].handle) {
        return mentions[i];
      }
    }
    return null;
  }

  function mention(state) {
    var i, j, l, m,
        token,
        tokens,
        blockTokens = state.tokens,
        htmlLinkLevel,
        matches,
        match,
        pos,
        name,
        lygneoId,
        person,
        linkclass,
        text,
        nodes,
        level,
        regex,
        regexGlobal,
        mentionRegExp = '@\\{([^;]+); ([^\\}]+)\\}';

    regex       = new RegExp(mentionRegExp);
    regexGlobal = new RegExp(mentionRegExp, 'g');

    for (j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type !== 'inline') { continue; }
      tokens = blockTokens[j].children;
      htmlLinkLevel = 0;

      for (i = tokens.length - 1; i >= 0; i--) {
        token = tokens[i];

        // skip content of markdown links
        if (token.type === 'link_close') {
          i--;
          while (tokens[i].level !== token.level && tokens[i].type !== 'link_open') {
            i--;
          }
          continue;
        }

        // skip content of html links
        if (token.type === 'html_inline') {
          // we are going backwards, so isLinkOpen shows end of link
          if (isLinkOpen(token.content) && htmlLinkLevel > 0) {
            htmlLinkLevel--;
          }
          if (isLinkClose(token.content)) {
            htmlLinkLevel++;
          }
        }
        if (htmlLinkLevel > 0) { continue; }

        if (token.type !== 'text') { continue; }

        // find mentions
        text = token.content;
        matches = text.match(regexGlobal);
        if (matches === null) { continue; }
        nodes = [];
        level = token.level;

        for (m = 0; m < matches.length; m++) {
          match = matches[m].match(regex);
          pos = text.indexOf(matches[m]);
          name       = match[1];
          lygneoId = match[2];
          linkclass = 'mention';

          if (pos > 0) {
            nodes.push({
              type: 'text',
              content: text.slice(0, pos),
              level: level
            });
          }


          person = findPersonById(lygneoId);

          if (person) {
            if (allowHovercards && person.guid !== currentUserId) {
              linkclass += ' hovercardable';
            }
            nodes.push({
              type: 'mention_open',
              content: person.url || '/people/' + person.guid,
              linkclass: linkclass,
              level: level++
            });
            nodes.push({
              type: 'mention_text',
              content: escapeHtml(name).trim(),
              level: level
            });
            nodes.push({
              type: 'mention_close',
              content: lygneoId,
              level: --level
            });
          } else {
            nodes.push({
              type: 'text',
              content: name,
              level: level
            });
          }
          text = text.slice(pos + match[0].length);
        }

        if (text.length > 0) {
          nodes.push({
            type: 'text',
            content: text,
            level: state.level
          });
        }

        // replace current node
        tokens = arrayReplaceAt(tokens, i, nodes);
        blockTokens[j].children = tokens;
      }
    }
  }

  md.core.ruler.after('inline', 'mention', mention);
  md.renderer.rules.mention_open  = mention_open;
  md.renderer.rules.mention_text  = mention_text;
  md.renderer.rules.mention_close = mention_close;
};
