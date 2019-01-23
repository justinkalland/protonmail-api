```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Get label object by name
  const label = pm.getLabelByName('foo bar')

  // Delete the label
  await label.delete()
  console.log(`Label ${label.name} was deleted`)

  pm.close()
})()
```

### Further resources:
- {@link Label|Label class}