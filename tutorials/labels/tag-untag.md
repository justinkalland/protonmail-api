```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Get the first email in the inbox
  const emailsInInbox = await pm.getEmails('inbox')
  const email = emailsInInbox[0]

  // Tag the email with a label
  await email.addLabel('foo bar')
  console.log(`The email now has ${email.labels.length} labels`)

  // Untag the email
  await email.removeLabel('foo bar')
  console.log(`The email now has ${email.labels.length} labels`)

  pm.close()
})()
```

Adding and removing labels from conversations works the same way, with the same method names:

```js
const conversationsInInbox = await pm.getConversations('inbox')
const conversation = conversationsInInbox[0]
await conversation.addLabel('foo bar')
await conversation.removeLavbel('foo bar')
```

### Further resources:
- {@link Label|Label class}
- {@link Email|Email class}
- {@link Conversation|Conversation class}