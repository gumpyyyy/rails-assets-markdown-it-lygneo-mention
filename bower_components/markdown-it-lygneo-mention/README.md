# markdown-it-lygneo-mention

[![Build Status](https://img.shields.io/travis/lygneo/markdown-it-lygneo-mention/master.svg?style=flat)](https://travis-ci.org/lygneo/markdown-it-lygneo-mention)
[![Coverage Status](https://img.shields.io/coveralls/lygneo/markdown-it-lygneo-mention/master.svg?style=flat)](https://coveralls.io/r/lygneo/markdown-it-lygneo-mention?branch=master)
[![npm version](https://img.shields.io/npm/v/markdown-it-lygneo-mention.svg?style=flat)](https://npmjs.com/package/markdown-it-lygneo-mention)

> lygneo-style @mention plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

`@{User Name; user@pod.tld}` => `<a href="/people/1337" class="mention">User Name</a>`

## Install

node.js, bower:

```bash
npm install markdown-it-lygneo-mention --save
bower install markdown-it-lygneo-mention --save
```

## Use

```js
var md = require('markdown-it')()
            .use(require('markdown-it-lygneo-mention'), {
              mentions: [
                {
                  lygneo_id: 'user@pod.tld',
                  guid: 1337
                },
                {
                  handle: 'foo@bar.baz',
                  url: '/my/awesome/url',
                  guid: 42
                }
              ],
              allowHovercards: true,
              currentUserId: 1337
            });

md.render('@{User Name; user@pod.tld}'); // => '<a href="/people/1337" class="mention">User Name</a>'
md.render('@{Foo Bar; foo@bar.baz}'); // => '<a href="/my/awesome/url" class="mention hovercardable">Foo Bar</a>'
```

_Differences in browser._ If you load the script directly into the page, without
package system, module will add itself globally as `window.markdownitLygneoMention`.

## License

[MIT](https://github.com/svbergerem/markdown-it-hashtag/blob/master/LICENSE)
