```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Create a new folder
  const folder = await pm.createFolder('foo bar folder')
  console.log(`Folder ${folder.name} was created and has ID ${folder.id}`)

  pm.close()
})()
```

### Further resources:
- {@link ProtonMail#createLabel|createFolder method}
- {@link Folder|Folder class}