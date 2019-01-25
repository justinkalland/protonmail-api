const Address = require('../lib/address')

/**
 * @hideconstructor
 */
class Email {
  constructor (protonMail, data) {
    /**
     * The unique identifier of the conversation.
     * @type {string}
     */
    this.id = data.ID
    /**
     * The conversation that this email belongs to.
     * @type {string}
     */
    this.conversationId = data.ConversationID
    /**
     * @type {string}
     */
    this.subject = data.Subject
    /**
     * @type {Date}
     */
    this.time = new Date(data.Time * 1000)
    /**
     * @type {Address}
     */
    this.from = new Address(protonMail, data.Sender)
    /**
     * @type {Address[]}
     */
    this.to = data.ToList.map(data => new Address(protonMail, data))
    /**
     * @type {Address[]}
     */
    this.cc = data.CCList.map(data => new Address(protonMail, data))
    /**
     * @type {Address[]}
     */
    this.bcc = data.BCCList.map(data => new Address(protonMail, data))
    /**
     * @type {Object}
     */
    this.headers = data.ParsedHeaders
    /**
     * @type {boolean}
     */
    this.isStarred = false

    this._protonMail = protonMail
    this._data = data

    const labels = []
    let folder
    data.LabelIDs.forEach(id => {
      if (id === '10') {
        this.isStarred = true
        return
      }

      const labelLookup = protonMail.getLabelById(id)
      const folderLookup = protonMail.getFolderById(id)

      if (labelLookup !== undefined) {
        labels.push(labelLookup)
        return
      }

      if (folderLookup === undefined || folderLookup.name === 'all' || (folder !== undefined && !folder.isProtected)) {

      } else if (folder === undefined || !folderLookup.isProtected || folder.id > folderLookup.id) {
        folder = folderLookup
      }
    })

    /**
     * @type {Label[]}
     */
    this.labels = labels
    /**
     * @type {Folder}
     */
    this.folder = folder
  }

  /**
   * Returns the body of the email.
   * @return string
   */
  async getBody () {
    if (this._body !== undefined) {
      return this._body
    }

    if (this._data.Body === undefined) {
      const message = await this._protonMail.getEmail(this.id)
      this._data.Body = message._data.Body
    }

    const data = await this._protonMail._page.evaluate(data => {
      const message = new window.MessageModel(data)
      return message.decryptBody()
    }, this._data)
    this._body = data.message

    return this._body
  }

  /**
   * Permanently deletes the email. It will be gone forever! It will NOT be in the trash!
   * @return {Boolean} true
   */
  async delete () {
    await this._protonMail._page.evaluate(id => {
      return window.messageApi.delete({ IDs: [id] })
    }, this.id)

    return true
  }

  /**
   * Move the email to a new folder.
   * @param {Folder} folder
   * @return {Boolean} true
   */
  async move (folder) {
    if (typeof folder === 'string') {
      folder = this._protonMail.getFolderByName(folder)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.messageApi.label({ IDs: [id], LabelID: labelId })
    }, this.id, folder.id)

    this.folder = folder

    return true
  }

  /**
   * Tag the email with a label.
   * @param {(Label|string)} label Label or a string of the label name.
   * @return {Boolean} true
   */
  async addLabel (label) {
    if (typeof label === 'string') {
      label = this._protonMail.getLabelByName(label)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.messageApi.label({ IDs: [id], LabelID: labelId })
    }, this.id, label.id)

    this.labels.push(label)

    return true
  }

  /**
   * Untag the email.
   * @param {(Label|string)} label Label or a string of the label name.
   * @return {Boolean} true
   */
  async removeLabel (label) {
    if (typeof label === 'string') {
      label = this._protonMail.getLabelByName(label)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.messageApi.unlabel({ IDs: [id], LabelID: labelId })
    }, this.id, label.id)

    this.labels = this.labels.filter(element => {
      return element.id !== label.id
    })

    return true
  }

  /**
   * Star (favorite) the email.
   * @return {Boolean} true
   */
  async star () {
    await this._protonMail._page.evaluate((id) => {
      return window.messageApi.star({ IDs: [id] })
    }, this.id)

    this.isStarred = true

    return true
  }

  /**
   * Unstar (unfavorite) the email.
   * @return {Boolean} true
   */
  async unstar () {
    await this._protonMail._page.evaluate((id) => {
      return window.messageApi.unstar({ IDs: [id] })
    }, this.id)

    this.isStarred = false

    return true
  }

  /**
   * Returns the conversation that the email belongs to.
   * @return {Conversation}
   */
  async getConversation () {
    return this._protonMail.getConversation(this.conversationId)
  }
}

module.exports = Email
