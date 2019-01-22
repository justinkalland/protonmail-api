/**
 * @hideconstructor
 */
class Label {
  constructor (protonMail, data) {
    this._protonMail = protonMail
    /**
     * The unique identifier of the label.
     * @type {string}
     */
    this.id = data.ID

    /**
     * The name of the label.
     * @type {string}
     */
    this.name = data.Name
  }

  /**
   * Permanently delete - this does not delete associated messages/conversations.
   */
  async delete () {
    await this._protonMail._page.evaluate(id => {
      return window.labelModel.remove(id)
    }, this.id)

    this._protonMail.labels = this._protonMail.labels.filter(label => {
      return label.id !== this.id
    })
  }
}

module.exports = Label
