const puppeteer = require('puppeteer')
const Conversation = require('./conversation')
const Email = require('./email')
const Label = require('./label')
const Folder = require('./folder')

const _defaultFolders = [
  { ID: 0, Name: 'inbox' },
  { ID: 3, Name: 'trash' },
  { ID: 4, Name: 'spam' },
  { ID: 5, Name: 'all' },
  { ID: 6, Name: 'archive' },
  { ID: 7, Name: 'sent' },
  { ID: 8, Name: 'drafts' }
]

/**
 * @hideconstructor
 */
class ProtonMail {
  /**
   * Get a ProtonMail instance that is connected and ready to use.
   * @param {Object} config
   * @param {Object} config.username Required, can be ProtonMail username or email
   * @param {Object} config.password Required
   * @param {Object} config.puppeteerOpts puppeteer launch options
   * @return {ProtonMail}
   */
  static async connect (config) {
    const protonMail = new ProtonMail(config)
    await protonMail._connect()
    return protonMail
  }

  constructor (config) {
    this._config = config
    this._config.puppeteerOpts = config.puppeteerOpts || {}

    if (!config.username) {
      throw new Error('config.username is required')
    }

    if (!config.password) {
      throw new Error('config.password is required')
    }
  }

  async _connect () {
    if (this._browser === undefined) {
      this._browser = await puppeteer.launch({ headless: true, ...this._config.puppeteerOpts })
      this._page = await this._browser.newPage()
    }

    const page = this._page

    await page.goto('https://old.protonmail.com/login')
    await page.waitForSelector('#login_btn')
    await page.type('#username', this._config.username)
    await page.type('#password', this._config.password)
    await page.click('#login_btn')
    let invalidLogin = false
    await Promise.race([
      page.waitForSelector('#ptSidebar'),
      page.waitForSelector('.proton-notification-template.notification-danger ').then(() => { invalidLogin = true })
    ])
    if (invalidLogin) {
      throw new Error('Invalid username and/or password')
    }
    await page.evaluate(() => {
      window.conversationApi = window.angular.element(document.body).injector().get('conversationApi')
      window.labelsModel = window.angular.element(document.body).injector().get('labelsModel')
      window.labelModel = window.angular.element(document.body).injector().get('Label')
      window.MessageModel = window.angular.element(document.body).injector().get('messageModel')
      window.addressesModel = window.angular.element(document.body).injector().get('addressesModel')
      window.messageApi = window.angular.element(document.body).injector().get('messageApi')
      window.encryptMessage = window.angular.element(document.body).injector().get('encryptMessage')
    })

    this._accountAddressData = await page.evaluate(() => {
      return window.addressesModel.getFirst()
    })

    await this._refreshFolders()
    await this._refreshLabels()
  }

  async _refreshLabels () {
    this.labels = []

    const data = await this._page.evaluate(() => {
      return window.labelsModel.get('labels')
    })

    data.forEach(data => {
      this.labels.push(new Label(this, data))
    })
  }

  async _refreshFolders () {
    this.folders = []

    const data = await this._page.evaluate(() => {
      return window.labelsModel.get('folders')
    })

    data.forEach(data => {
      this.folders.push(new Folder(this, data))
    })
    _defaultFolders.forEach(data => {
      data.isProtected = true
      this.folders.push(new Folder(this, data))
    })
  }

  /**
   * Closes the ProtonMail session and headless browser.
   */
  async close () {
    return this._browser.close()
  }

  /**
   * Get a label by ID.
   * @param {string} id
   * @return {Label|undefined}
   */
  getLabelById (id) {
    return this.labels.find(label => {
      return label.id === id
    })
  }

  /**
   * Get a label by name.
   * @param {string} name
   * @return {Label|undefined}
   */
  getLabelByName (name) {
    return this.labels.find(label => {
      return label.name === name
    })
  }

  /**
   * Get a folder by ID.
   * @param {string} id
   * @return {Folder|undefined}
   */
  getFolderById (id) {
    id = String(id)
    return this.folders.find(folder => {
      return folder.id === id
    })
  }

  /**
   * Get a folder by name.
   * @param {string} name
   * @return {Folder|undefined}
   */
  getFolderByName (name) {
    return this.folders.find(folder => {
      return folder.name === name
    })
  }

  /**
   * Create a new folder.
   * @param {string} name Must be unique
   * @return {Folder}
   */
  async createFolder (name) {
    if (this.getFolderByName(name) !== undefined) {
      return this.getFolderByName(name)
    }

    const data = await this._page.evaluate(name => {
      return window.labelModel.create({
        Exclusive: 1,
        Color: '#7272a7',
        Name: name
      }).then(response => {
        return response
      })
    }, name)

    const folder = new Folder(this, data)
    this.folders.push(folder)
    return folder
  }

  /**
   * Create a new label.
   * @param {string} name Must be unique
   * @return {Label}
   */
  async createLabel (name) {
    if (this.getLabelByName(name) !== undefined) {
      return this.getLabelByName(name)
    }

    const data = await this._page.evaluate(name => {
      return window.labelModel.create({
        Exclusive: 0,
        Color: '#7272a7',
        Name: name
      }).then(response => {
        return response
      })
    }, name)

    const label = new Label(this, data)
    this.labels.push(label)
    return label
  }

  async _getCounts (type) {
    const countsData = await this._page.evaluate(type => {
      return window[type + 'Api'].count().then(response => {
        return response.data
      })
    }, type)

    const counts = { labels: {}, folders: {} }
    countsData.Counts.forEach(data => {
      let name
      let type
      if (this.getFolderById(data.LabelID)) {
        name = this.getFolderById(data.LabelID).name
        type = 'folders'
      } else if (this.getLabelById(data.LabelID)) {
        name = this.getLabelById(data.LabelID).name
        type = 'labels'
      }

      if (type === undefined) {
        return
      }

      counts[type][name] = {
        total: data.Total,
        unread: data.Unread
      }
    })

    return counts
  }

  /**
   * @return {Object}
   * @example
   * {
   *   labels: {
   *     foobar: { total: 5, unread: 1 }
   *   },
   *   folders: {
   *     inbox: { total: 22, unread: 18 },
   *     trash: { total: 0, unread: 0 },
   *     spam: { total: 5, unread: 0 },
   *     all: { total: 32, unread: 19 },
   *     archive: { total: 0, unread: 0 },
   *     sent: { total: 3, unread: 0 },
   *     drafts: { total: 0, unread: 0 },
   *     myfolder: { total: 2, unread: 1 }
   *   }
   * }
   */
  async getEmailCounts () {
    return this._getCounts('message')
  }

  /**
   * Returns same as [getEmailCounts()]{@link ProtonMail#getEmailCounts} but counted by conversation.
   * See [getEmailCounts()]{@link ProtonMail#getEmailCounts} for example response.
   */
  async getConversationCounts () {
    return this._getCounts('conversation')
  }

  /**
   * Get a conversation by ID.
   * @param {string} id
   * @return {Conversation|undefined}
   */
  async getConversation (id) {
    const data = await this._page.evaluate(id => {
      return window.conversationApi.get(id).then(response => {
        return response.data
      }).catch(() => {
        return undefined
      })
    }, id)

    if (data === undefined) {
      return undefined
    }
    return new Conversation(this, data)
  }

  /**
   * Get array of conversations.
   * @param {string|Label|Folder} folderOrLabel
   * @param {number} page
   * @return {Conversation[]}
   */
  async getConversations (folderOrLabel = 'all', page = 0) {
    let labelId
    if (typeof folderOrLabel === 'string') {
      labelId = (this.getLabelByName(folderOrLabel) || this.getFolderByName(folderOrLabel)).id
    } else {
      labelId = folderOrLabel.id
    }

    const data = await this._page.evaluate((labelId, page) => {
      return window.conversationApi.query({
        LabelID: labelId,
        Limit: 50, // the API will return 50 or 100, but page number seems to always be based on 50
        Page: page
      }).then(response => {
        return response.data
      })
    }, labelId, page)

    const conversations = []

    data.Conversations.forEach(data => {
      conversations.push(new Conversation(this, data))
    })

    return conversations
  }

  /**
   * Get an email by ID.
   * @param {string} id
   * @return {Email|undefined}
   */
  async getEmail (id) {
    const data = await this._page.evaluate(id => {
      return window.messageApi.get(id).then(response => {
        return response.data.Message
      }).catch(() => {
        return undefined
      })
    }, id)

    if (data === undefined) {
      return undefined
    }
    return new Email(this, data)
  }

  /**
   * Get array of emails.
   * @param {string|Label|Folder} folderOrLabel
   * @param {number} page
   * @return {Email[]}
   */
  async getEmails (folderOrLabel = 'all', page = 0) {
    let labelId
    if (typeof folderOrLabel === 'string') {
      labelId = (this.getLabelByName(folderOrLabel) || this.getFolderByName(folderOrLabel)).id
    } else {
      labelId = folderOrLabel.id
    }

    const data = await this._page.evaluate((labelId, page) => {
      return window.messageApi.query({
        LabelID: labelId,
        Limit: 50, // the API will return 50 or 100, but page number seems to always be based on 50
        Page: page
      }).then(response => {
        return response.data
      })
    }, labelId, page)

    const emails = []

    data.Messages.forEach(data => {
      emails.push(new Email(this, data))
    })

    return emails
  }

  /**
   * Send an email.
   * @param {Object} options
   * @param {Address|string} options.to
   * @param {string} options.subject
   * @param {string} options.body
   * @return {Email}
   */
  async sendEmail (options) {
    const { to, subject, body } = options
    const data = {
      toList: [{ Name: to, Address: to }],
      subject,
      body,
      address: this._accountAddressData
    }

    const emailId = await this._page.evaluate(async (data) => {
      const message = window.MessageModel()
      message.AddressID = data.address.ID
      message.From = data.address
      message.Password = ''
      message.AutoSaveContacts = 0
      message.ToList = data.toList
      message.Subject = data.subject
      message.setDecryptedBody(data.body)
      const encryptedBody = await message.encryptBody(data.address.Keys[0].PublicKey)

      const draftData = {
        Message: {
          AddressID: message.AddressID,
          Body: encryptedBody,
          Subject: message.Subject,
          ToList: message.ToList,
          CCList: [],
          BCCList: [],
          Unread: 0,
          Sender: { Name: message.From.DisplayName || '', Address: message.From.Email }
        }
      }

      const draftResponse = await window.messageApi.createDraft(draftData)
      message.ID = draftResponse.data.Message.ID
      message.MIMEType = draftResponse.data.Message.MIMEType
      const packages = await window.encryptMessage(message, message.emailsToString())

      await window.messageApi.send({
        id: message.ID,
        AutoSaveContacts: message.AutoSaveContacts,
        ExpirationTime: message.ExpirationTime,
        Packages: packages
      })

      return message.ID
    }, data)

    return this.getEmail(emailId)
  }
}

module.exports = ProtonMail
