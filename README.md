# protonmail-api
Unofficial API for interacting with ProtonMail.

Allows interaction with ProtonMail through a simple Node.js API. Leverages the official [WebClient](https://github.com/ProtonMail/WebClient), keeping with the spirit of security and privacy. Currently supports sending email, managing email/conversations, and managing labels and folders. See the [documentation](https://justinkalland.github.io/protonmail-api/) for full functionality.

_This project is not endorsed or supported by Proton Technologies AG._

# Quick Start
## Setup
```
npm install protonmail-api
```
## Send an Email
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
## More Examples
Numerous examples can be found in the [tutorials section of the documentation](https://justinkalland.github.io/protonmail-api/).

# Documentation
[Full documentation found here](https://justinkalland.github.io/protonmail-api/)

# How?
This library uses [Puppeteer](https://github.com/GoogleChrome/puppeteer) (headless Chromium) to load and control the official [ProtonMail WebClient](https://github.com/ProtonMail/WebClient).

The first attempt at building this was by trying to reverse engineer the API from the WebClient. This proved to be difficult and fragile. By utilizing the AngularJS modules (through the headless browser) this library is able to leverage all the work that goes into the official WebClient. This also means complex and sensitive things (like cryptography) are not handled by this library. The main drawback to this approach is the added weight of Puppeteer.

# Contributing
This project is looking for maintainers and contributors. Please contact justin@kalland.ch if you are interested.

To run integration tests you need to provide a ProtonMail account. It is best to use a dedicated testing account without any filters. The credentials are set as environment variables `PM_USERNAME` and `PM_PASSWORD`.

Example:
```
PM_USERNAME=footest@protonmail.com PM_PASSWORD=kgjSOE223qWer npm run test
```