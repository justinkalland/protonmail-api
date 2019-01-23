```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Create a new label
  const label = await pm.createLabel('foo bar')
  console.log(`Label ${label.name} was created and has ID ${label.id}`)

  pm.close()
})()
```

### Further resources:
- {@link ProtonMail#createLabel|createLabel method}
- {@link Label|Label class}