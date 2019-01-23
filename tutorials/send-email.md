```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  await pm.sendEmail({
    to: 'justin@kalland.ch',
    subject: 'Send email tutorial',
    body: 'Hello world'
  })

  pm.close()
})()
```