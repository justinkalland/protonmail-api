const expect = require('chai').expect
const support = require('./support')
const Folder = require('../../lib/folder')

describe('Folder', () => {
  it('returns folders', () => {
    const folders = support.pm.folders

    expect(folders).to.be.a('array')
    expect(folders[0]).to.be.an.instanceOf(Folder)
  })

  it('creates', async () => {
    const name = 'TEST-' + support.randomString()
    const folder = await support.pm.createFolder(name)

    expect(folder).to.be.an.instanceOf(Folder)
    expect(folder.name).to.equal(name)

    await folder.delete()
  })

  it('returns existing when creating duplicate', async () => {
    const name = 'TEST-' + support.randomString()
    const folder = await support.pm.createFolder(name)
    const folder2 = await support.pm.createFolder(name)

    expect(folder).to.equal(folder2)

    await folder.delete()
  })

  it('deletes', async () => {
    const name = 'TEST-' + support.randomString()
    const folder = await support.pm.createFolder(name)

    expect(folder).to.be.an.instanceOf(Folder)

    await folder.delete()
    const lookupFolder = support.pm.getFolderByName(name)

    expect(lookupFolder).to.equal(undefined)
  })

  it('gets by id', async () => {
    const name = 'TEST-' + support.randomString()
    const folder = await support.pm.createFolder(name)

    const lookupFolder = support.pm.getFolderById(folder.id)

    expect(lookupFolder).to.be.an.instanceOf(Folder)
    expect(lookupFolder.id).to.equal(folder.id)

    await folder.delete()
  })

  it('gets by name', async () => {
    const name = 'TEST-' + support.randomString()
    const folder = await support.pm.createFolder(name)

    const lookupFolder = support.pm.getFolderByName(name)

    expect(lookupFolder).to.be.an.instanceOf(Folder)
    expect(folder.name).to.equal(name)

    await folder.delete()
  })
})
