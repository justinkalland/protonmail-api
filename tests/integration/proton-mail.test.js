const expect = require('chai').expect
const support = require('./support')

describe('ProtonMail', () => {
  it('gets conversation counts', async () => {
    const counts = await support.pm.getConversationCounts()
    expect(counts).to.be.a('object')
    expect(counts['labels']).to.be.a('object')
    expect(counts['folders']).to.be.a('object')
    expect(counts['folders']).to.include.all.keys('inbox', 'spam', 'trash')
    expect(counts['folders']['inbox']).to.have.all.keys('total', 'unread')
  })

  it('gets email counts', async () => {
    const counts = await support.pm.getEmailCounts()

    expect(counts).to.be.a('object')
    expect(counts['labels']).to.be.a('object')
    expect(counts['folders']).to.be.a('object')
    expect(counts['folders']).to.include.all.keys('inbox', 'spam', 'trash')
    expect(counts['folders']['inbox']).to.have.all.keys('total', 'unread')
  })
})
