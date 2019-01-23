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

  // Move the email to the trash
  await email.move('trash')
  console.log(`The email now is now in: ${email.folder.name}`)

  pm.close()
})()
```

Moving conversations works the same way, with the same method .move:

```js
const conversationsInInbox = await pm.getConversations('inbox')
const conversation = conversationsInInbox[0]
await conversation.move('trash')
```

### Further resources:
- {@link Folder|Folder class}
- {@link Email|Email class}
- {@link Conversation|Conversation class}