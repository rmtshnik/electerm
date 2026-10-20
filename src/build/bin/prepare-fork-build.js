/**
 * Prepare this fork for electron-builder without upstream upload credentials.
 * Run after the frontend build; production dependencies are installed separately.
 */
const { cpSync, mkdirSync, readFileSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')

const root = resolve(__dirname, '../../..')
const target = resolve(root, 'work/app')
const pack = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const electronVersion = pack.devDependencies.electron
mkdirSync(target, { recursive: true })
cpSync(resolve(root, 'src/app'), target, { recursive: true })
cpSync(resolve(root, 'package-lock.json'), resolve(target, 'package-lock.json'))
delete pack.scripts
delete pack.devDependencies
delete pack.standard
pack.repository.url = 'git+https://github.com/rmtshnik/electerm.git'
pack.homepage = 'https://github.com/rmtshnik/electerm'
pack.bugs.url = 'https://github.com/rmtshnik/electerm/issues'
pack.releases = 'https://github.com/rmtshnik/electerm/releases'
writeFileSync(resolve(target, 'package.json'), JSON.stringify(pack, null, 2))
writeFileSync(resolve(target, 'lib/install-src.js'), "module.exports = 'skip-upgrade-check'\n")
cpSync(
  resolve(root, 'node_modules/@electerm/electerm-resource/res/imgs/electerm-round-128x128.png'),
  resolve(target, 'assets/images/electerm-tray.png')
)

const config = JSON.parse(readFileSync(resolve(root, 'src/build/electron-builder.json'), 'utf8'))
config.appId = 'io.github.rmtshnik.electerm'
config.directories.output = 'dist/fork'
config.artifactName = 'electerm-fork-${version}-${os}-${arch}.${ext}' // eslint-disable-line
config.electronVersion = electronVersion
config.asarUnpack.push('node_modules/node-pty/prebuilds/**')
// node-pty and serialport provide N-API binaries for Windows.
config.npmRebuild = process.platform !== 'win32'
config.win.target = ['zip', 'nsis']
config.win.signAndEditExecutable = false
config.nsis.artifactName = 'electerm-fork-${version}-windows-${arch}-setup.${ext}' // eslint-disable-line
config.mac.target = ['dmg', 'zip']
config.mac.identity = '-'
config.mac.hardenedRuntime = false
config.mac.notarize = false
config.linux.target = ['deb', 'AppImage', 'tar.gz']
config.linux.maintainer = 'rmtshnik <rmtshnik@users.noreply.github.com>'
for (const platform of ['win', 'mac', 'linux', 'snap']) {
  delete config[platform].publish
}
writeFileSync(resolve(root, 'work/fork-builder.json'), JSON.stringify(config, null, 2))
