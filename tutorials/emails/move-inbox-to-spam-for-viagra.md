```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Get emails in inbox
  const emailsInInbox = await pm.getEmails('inbox')

  for (const email of emailsInInbox) {
    const body = await email.getBody()

    // Move the email to spam if the body contains 'viagra'
    if (body.includes('viagra')) {
      email.move('spam')
    }
  }

  pm.close()
})()
```

### Further resources:
- {@link ProtonMail#getEmails|getEmails method}
- {@link Email|Email class}