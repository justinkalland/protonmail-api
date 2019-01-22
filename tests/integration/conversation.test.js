const expect = require('chai').expect
const support = require('./support')
const Email = require('../../lib/email')
const Conversation = require('../../lib/conversation')

describe('Conversation', () => {
  describe('gets', async () => {
    let conversation, emptyFolder

    before(async () => {
      const email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
      conversation = await email.getConversation()
      emptyFolder = await support.pm.createFolder(`TEST ${support.randomString()}`)
    })

    after(async () => {
      await conversation.delete()
      await emptyFolder.delete()
    })

    it('multiple conversations', async () => {
      const conversationsLookup = await support.pm.getConversations('all')
      expect(conversationsLookup[0]).to.be.an.instanceOf(Conversation)
    })

    it('multiple conversations using folder instance', async () => {
      const folder = support.pm.getFolderByName('all')
      const conversationsLookup = await support.pm.getConversations(folder)
      expect(conversationsLookup[0]).to.be.an.instanceOf(Conversation)
    })

    it('multiple conversations when none found', async () => {
      const conversationsLookup = await support.pm.getConversations(emptyFolder)
      expect(conversationsLookup).to.be.an('array').and.to.have.lengthOf(0)
    })

    it('single conversation', async () => {
      const conversationLookup = await support.pm.getConversation(conversation.id)
      expect(conversationLookup).to.be.an.instanceOf(Conversation)
      expect(conversationLookup.id).to.equal(conversation.id)
    })

    it('single conversation when not found', async () => {
      const conversationLookup = await support.pm.getConversation('notarealid')
      expect(conversationLookup).to.equal(undefined)
    })

    it('gets the associated emails', async () => {
      const emails = await conversation.getEmails()
      expect(emails[0]).to.be.an.instanceOf(Email)
    })
  })

  it('deletes', async () => {
    const email = await support.pm.sendEmail({
      to: support.pm._accountAddressData.Email,
      subject: `TEST ${support.randomString()}`,
      body: support.randomString()
    })
    const conversation = await email.getConversation()

    await conversation.delete()

    const conversationLookup = await support.pm.getConversation(conversation.id)
    expect(conversationLookup).to.equal(undefined)
  })

  it('moves folder', async () => {
    const email = await support.pm.sendEmail({
      to: support.pm._accountAddressData.Email,
      subject: `TEST ${support.randomString()}`,
      body: support.randomString()
    })
    const conversation = await email.getConversation()
    const folder = await support.pm.createFolder(`TEST ${support.randomString()}`)

    expect(conversation.folder.name).to.equal('inbox')
    await conversation.move(folder)
    expect(conversation.folder).to.equal(folder)

    const conversationsLookup = await support.pm.getConversations(folder)
    expect(conversationsLookup[0]).to.be.an.instanceOf(Conversation)
    expect(conversationsLookup[0].id).to.equal(conversation.id)

    await conversation.delete()
    await folder.delete()
  })

  describe('labels', async () => {
    let conversation, label

    before(async () => {
      const email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
      conversation = await email.getConversation()
      label = await support.pm.createLabel(`TEST ${support.randomString()}`)
    })

    after(async () => {
      await conversation.delete()
      await label.delete()
    })

    it('adds label', async () => {
      expect(conversation.labels).to.have.lengthOf(0)
      await conversation.addLabel(label)
      expect(conversation.labels).to.include(label)

      const conversationsLookup = await support.pm.getConversations(label)
      expect(conversationsLookup).to.have.lengthOf(1)
      expect(conversationsLookup[0]).to.be.an.instanceOf(Conversation)
      expect(conversationsLookup[0].id).to.equal(conversation.id)
    })

    it('removes label', async () => {
      expect(conversation.labels).to.include(label)
      await conversation.removeLabel(label)
      expect(conversation.labels).to.have.lengthOf(0)

      const conversationsLookup = await support.pm.getConversations(label)
      expect(conversationsLookup).to.be.an('array').and.to.have.lengthOf(0)
    })
  })

  describe('stars', async () => {
    let conversation

    before(async () => {
      const email = await support.pm.sendEmail({
        to: support.pm._accountAddressData.Email,
        subject: `TEST ${support.randomString()}`,
        body: support.randomString()
      })
      conversation = await email.getConversation()
    })

    after(async () => {
      await conversation.delete()
    })

    it('adds', async () => {
      expect(conversation.isStarred).to.equal(false)
      await conversation.star()
      expect(conversation.isStarred).to.equal(true)

      const conversationLookup = await support.pm.getConversation(conversation.id)
      expect(conversationLookup.isStarred).to.equal(true)
    })

    it('removes', async () => {
      expect(conversation.isStarred).to.equal(true)
      await conversation.unstar()
      expect(conversation.isStarred).to.equal(false)

      const conversationLookup = await support.pm.getConversation(conversation.id)
      expect(conversationLookup.isStarred).to.equal(false)
    })
  })
})
