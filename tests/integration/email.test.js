const expect = require('chai').expect
const support = require('./support')
const Email = require('../../lib/email')
const Conversation = require('../../lib/conversation')

describe('Email', () => {
  describe('gets', async () => {
    let email, emptyFolder

    before(async () => {
      email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
      emptyFolder = await support.pm.createFolder(`TEST ${support.randomString()}`)
    })

    after(async () => {
      await email.delete()
      await emptyFolder.delete()
    })

    it('multiple emails', async () => {
      const emailsLookup = await support.pm.getEmails('all')
      expect(emailsLookup[0]).to.be.an.instanceOf(Email)
    })

    it('multiple emails using folder instance', async () => {
      const folder = support.pm.getFolderByName('all')
      const emailsLookup = await support.pm.getEmails(folder)
      expect(emailsLookup[0]).to.be.an.instanceOf(Email)
    })

    it('multiple emails when none found', async () => {
      const emailsLookup = await support.pm.getEmails(emptyFolder)
      expect(emailsLookup).to.be.an('array').and.to.have.lengthOf(0)
    })

    it('single email', async () => {
      const emailLookup = await support.pm.getEmail(email.id)
      expect(emailLookup).to.be.an.instanceOf(Email)
      expect(emailLookup.id).to.equal(email.id)
    })

    it('single email when not found', async () => {
      const emailLookup = await support.pm.getEmail('notarealid')
      expect(emailLookup).to.equal(undefined)
    })

    it('gets the associated conversation', async () => {
      const conversation = await email.getConversation()
      expect(conversation).to.be.an.instanceOf(Conversation)
    })
  })

  it('sends', async () => {
    const subject = `TEST ${support.randomString()}`
    const body = support.randomString()
    const to = support.pm._accountAddressData.Email
    const email = await support.pm.sendEmail({
      to,
      subject,
      body
    })
    expect(email).to.be.an.instanceOf(Email)
    expect(email.folder.name).to.equal('inbox')

    const emailLookup = await support.pm.getEmail(email.id)
    expect(emailLookup.subject).to.equal(subject)
    expect(await emailLookup.getBody()).to.equal(body)

    await email.delete()
  })

  it('deletes', async () => {
    const email = await support.pm.sendEmail({
      to: support.pm._accountAddressData.Email,
      subject: `TEST ${support.randomString()}`,
      body: support.randomString()
    })

    await email.delete()

    const emailLookup = await support.pm.getEmail(email.id)
    expect(emailLookup).to.equal(undefined)
  })

  it('moves folder', async () => {
    const email = await support.pm.sendEmail({
      to: support.pm._accountAddressData.Email,
      subject: `TEST ${support.randomString()}`,
      body: support.randomString()
    })
    const folder = await support.pm.createFolder(`TEST ${support.randomString()}`)

    expect(email.folder.name).to.equal('inbox')
    await email.move(folder)
    expect(email.folder).to.equal(folder)

    const emailsLookup = await support.pm.getEmails(folder)
    expect(emailsLookup[0]).to.be.an.instanceOf(Email)
    expect(emailsLookup[0].id).to.equal(email.id)

    await email.delete()
    await folder.delete()
  })

  describe('labels', async () => {
    let email, label

    before(async () => {
      email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
      label = await support.pm.createLabel(`TEST ${support.randomString()}`)
    })

    after(async () => {
      await email.delete()
      await label.delete()
    })

    it('adds label', async () => {
      expect(email.labels).to.have.lengthOf(0)
      await email.addLabel(label)
      expect(email.labels).to.include(label)

      const emailsLookup = await support.pm.getEmails(label)
      expect(emailsLookup).to.have.lengthOf(1)
      expect(emailsLookup[0]).to.be.an.instanceOf(Email)
      expect(emailsLookup[0].id).to.equal(email.id)
    })

    it('removes label', async () => {
      expect(email.labels).to.include(label)
      await email.removeLabel(label)
      expect(email.labels).to.have.lengthOf(0)

      const emailsLookup = await support.pm.getEmails(label)
      expect(emailsLookup).to.be.an('array').and.to.have.lengthOf(0)
    })
  })

  describe('stars', async () => {
    let email

    before(async () => {
      email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
    })

    after(async () => {
      await email.delete()
    })

    it('adds', async () => {
      expect(email.isStarred).to.equal(false)
      await email.star()
      expect(email.isStarred).to.equal(true)

      const emailLookup = await support.pm.getEmail(email.id)
      expect(emailLookup.isStarred).to.equal(true)
    })

    it('removes', async () => {
      expect(email.isStarred).to.equal(true)
      await email.unstar()
      expect(email.isStarred).to.equal(false)

      const emailLookup = await support.pm.getEmail(email.id)
      expect(emailLookup.isStarred).to.equal(false)
    })
  })

  describe('read / unread', async () => {
    let email

    before(async () => {
      email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
    })

    after(async () => {
      await email.delete()
    })

    it('starts unread', async () => {
      expect(email.isRead).to.equal(false)
    })

    it('marks read and then unread', async () => {
      await email.read()
      const emailLookupRead = await support.pm.getEmail(email.id)
      expect(emailLookupRead.isRead).to.equal(true)

      await emailLookupRead.unread()
      const emailLookupUnread = await support.pm.getEmail(email.id)
      expect(emailLookupUnread.isRead).to.equal(false)
    })
  })
})
