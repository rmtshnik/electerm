const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const vm = require('node:vm')

const source = readFileSync(resolve(__dirname, '../../client/common/check-skip-src.js'), 'utf8')
  .replace(/^import .* from .*$/m, '')
  .replace('export const checkSkipSrc', 'const checkSkipSrc')
const check = (packInfo, installSrc) => {
  const context = { packInfo, srcsSkipUpgradeCheck: ['.snap', '.appx', 'skip-upgrade-check'] }
  return vm.runInNewContext(source + '\ncheckSkipSrc(' + JSON.stringify(installSrc) + ')', context)
}

test('fork builds never offer upstream binaries, including builds without install source', () => {
  const pack = require('../../../package.json')
  assert.equal(pack.fork.disableUpstreamUpdates, true)
  for (const src of ['', 'npm', 'win-x64-portable.tar.gz']) {
    assert.equal(check(pack, src), true)
  }
})

test('upstream builds retain their existing update policy', () => {
  assert.equal(check({}, ''), false)
  assert.equal(check({}, 'win-x64-portable.tar.gz'), false)
  assert.equal(check({}, 'electerm.snap'), true)
  assert.equal(check({}, 'skip-upgrade-check'), true)
})
