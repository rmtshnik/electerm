/** Prepare a local Windows portable build without the release/upload scripts. */
const { cpSync, mkdirSync, readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const root = resolve(__dirname, '../../..')
const target = resolve(root, 'work/app')
mkdirSync(target, { recursive: true })
cpSync(resolve(root, 'src/app'), target, { recursive: true })
const pack = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const electronVersion = pack.devDependencies.electron
delete pack.scripts
delete pack.devDependencies
delete pack.standard
delete pack.dependencies['node-bash']
writeFileSync(resolve(target, 'package.json'), JSON.stringify(pack, null, 2))
writeFileSync(resolve(target, 'lib/install-src.js'), "module.exports = 'win-x64-portable.tar.gz'\n")
cpSync(
  resolve(root, 'node_modules/@electerm/electerm-resource/res/imgs/electerm-round-128x128.png'),
  resolve(target, 'assets/images/electerm-tray.png')
)

const config = JSON.parse(readFileSync(resolve(root, 'src/build/electron-builder.json'), 'utf8'))
config.directories.output = 'dist/keyboard-portable'
config.artifactName = 'electerm-${version}-windows-${arch}-keyboard-portable.${ext}' // eslint-disable-line
config.win.target = ['zip']
delete config.win.publish
config.win.signAndEditExecutable = false
// node-pty and serialport ship Windows prebuilds; no compiler is required.
config.npmRebuild = false
config.electronVersion = electronVersion
config.asarUnpack.push('node_modules/node-pty/prebuilds/**')
writeFileSync(resolve(root, 'work/local-portable-builder.json'), JSON.stringify(config, null, 2))
