/**
 * @hideconstructor
 */
class Address {
  constructor (protonMail, data) {
    this._protonMail = protonMail // keeping this for future support of things like address book
    /**
     * The email address (example: justin@kalland.ch)
     * @type {string}
     */
    this.email = String(data.Address)

    /**
     * The display name (example: Justin Kalland)
     * @type {string}
     */
    this.name = data.Name
  }

  toString () {
    return this.email
  }
}

module.exports = Address
