const expect = require('chai').expect
const support = require('./support')
const Label = require('../../lib/label')

describe('Label', () => {
  it('returns labels', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)
    const labels = support.pm.labels

    expect(labels).to.be.a('array')
    expect(labels[0]).to.be.an.instanceOf(Label)

    await label.delete()
  })

  it('creates', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)

    expect(label).to.be.an.instanceOf(Label)
    expect(label.name).to.equal(name)

    await label.delete()
  })

  it('returns existing when creating duplicate', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)
    const label2 = await support.pm.createLabel(name)

    expect(label).to.equal(label2)

    await label.delete()
  })

  it('deletes', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)

    expect(label).to.be.an.instanceOf(Label)

    await label.delete()
    const lookupLabel = support.pm.getLabelByName(name)

    expect(lookupLabel).to.equal(undefined)
  })

  it('gets by id', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)

    const lookupLabel = support.pm.getLabelById(label.id)

    expect(lookupLabel).to.be.an.instanceOf(Label)
    expect(lookupLabel.id).to.equal(label.id)

    await label.delete()
  })

  it('gets by name', async () => {
    const name = 'TEST-' + support.randomString()
    const label = await support.pm.createLabel(name)

    const lookupLabel = support.pm.getLabelByName(name)

    expect(lookupLabel).to.be.an.instanceOf(Label)
    expect(label.name).to.equal(name)

    await label.delete()
  })
})
