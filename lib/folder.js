/**
 * @hideconstructor
 */
class Folder {
  constructor (protonMail, data) {
    this._protonMail = protonMail
    /**
     * The unique identifier of the folder.
     * @type {string}
     */
    this.id = String(data.ID)

    /**
     * The name of the folder.
     * @type {string}
     */
    this.name = data.Name

    /**
     * True if a protected sysyem folder (such as inbox).
     * @type {boolean}
     */
    this.isProtected = data.isProtected === true
  }

  /**
   * Permanently delete - this does not delete associated messages/conversations.
   */
  async delete () {
    await this._protonMail._page.evaluate(id => {
      return window.labelModel.remove(id)
    }, this.id)

    this._protonMail.folders = this._protonMail.folders.filter(folder => {
      return folder.id !== this.id
    })
  }
}

module.exports = Folder
