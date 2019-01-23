```js
const ProtonMail = require('protonmail-api');

(async () => {
  const pm = await ProtonMail.connect({
    username: 'foobar@protonmail.com',
    password: 'somethingsecure'
  })

  // Get folder object by name
  const folder = pm.getFolderByName('foo bar folder')

  // Delete the label
  await folder.delete()
  console.log(`Folder ${folder.name} was deleted`)

  pm.close()
})()
```

### Further resources:
- {@link ProtonMail#getFolderByName|getFolderByName method}
- {@link Folder|Folder class}