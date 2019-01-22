const Email = require('./email')

/**
 * @hideconstructor
 */
class Conversation {
  constructor (protonMail, data) {
    this._protonMail = protonMail
    let conversationData = {}
    let emailsData

    if (data.Conversation === undefined) {
      conversationData = data
    } else {
      conversationData = data.Conversation
      emailsData = data.Messages

      conversationData.Time = emailsData[0].Time
      conversationData.LabelIDs = []
      emailsData.forEach(data => {
        data.LabelIDs.forEach(id => {
          if (conversationData.LabelIDs.indexOf(id) === -1) {
            conversationData.LabelIDs.push(String(id))
          }
        })
      })
    }

    /**
     * The unique identifier of the conversation.
     * @type {string}
     */
    this.id = conversationData.ID
    /**
     * @type {string}
     */
    this.subject = conversationData.Subject
    /**
     * @type {Date}
     */
    this.time = new Date(conversationData.Time * 1000)
    /**
     * @type {boolean}
     */
    this.isStarred = false
    this._emailsData = emailsData

    const labels = []
    let folder
    conversationData.LabelIDs.forEach(id => {
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
   * Get the emails that belong to the conversation.
   * @return {Email[]}
   */
  async getEmails () {
    if (this._emails !== undefined) {
      return this._emails
    }

    if (this._emailsData === undefined) {
      // todo: fetch emails through API because they are missing (when fetching array of conversaions)
    }

    const emails = []

    this._emailsData.forEach(data => {
      emails.push(new Email(this._protonMail, data))
    })

    this._emails = emails

    return emails
  }

  /**
   * Permanently deletes the conversation and associated emails. It will be gone forever! It will NOT be in the trash!
   * @return {Boolean} true
   */
  async delete () {
    await this._protonMail._page.evaluate(id => {
      return window.conversationApi.delete([id], 5)
    }, this.id)

    return true
  }

  /**
   * Move the conversation to a new folder.
   * @param {Folder} folder
   * @return {Boolean} true
   */
  async move (folder) {
    if (typeof folder === 'string') {
      folder = this._protonMail.getFolderByName(folder)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.conversationApi.label(labelId, [id])
    }, this.id, folder.id)

    this.folder = folder

    return true
  }

  /**
   * Tag the conversation with a label.
   * @param {(Label|string)} label Label or a string of the label name.
   * @return {Boolean} true
   */
  async addLabel (label) {
    if (typeof label === 'string') {
      label = this._protonMail.getLabelByName(label)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.conversationApi.label(labelId, [id])
    }, this.id, label.id)

    this.labels.push(label)

    return true
  }

  /**
   * Untag the conversation.
   * @param {(Label|string)} label Label or a string of the label name.
   * @return {Boolean} true
   */
  async removeLabel (label) {
    if (typeof label === 'string') {
      label = this._protonMail.getLabelByName(label)
    }

    await this._protonMail._page.evaluate((id, labelId) => {
      return window.conversationApi.unlabel(labelId, [id])
    }, this.id, label.id)

    this.labels = this.labels.filter(element => {
      return element.id !== label.id
    })

    return true
  }

  /**
   * Star (favorite) the conversation.
   * @return {Boolean} true
   */
  async star () {
    await this._protonMail._page.evaluate((id) => {
      return window.conversationApi.star([id])
    }, this.id)

    this.isStarred = true

    return true
  }

  /**
   * Unstar (unfavorite) the conversation.
   * @return {Boolean} true
   */
  async unstar () {
    await this._protonMail._page.evaluate((id) => {
      return window.conversationApi.unstar([id])
    }, this.id)

    this.isStarred = false

    return true
  }
}

module.exports = Conversation
