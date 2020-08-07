const fs = require('fs')
const path = require('path')
const minidump = require('minidump')
const electronDownload = require('electron-download')
const extractZip = require('extract-zip')

const electronMinidump = async (options) => {
  const {version, quiet, force, file} = options
  const platform = 'win32'
  const directory = path.join(__dirname, 'cache', version + '-' + platform)

  await download({version, quiet, directory, platform, force})

  const symbolPaths = [
    path.join(directory, 'breakpad_symbols'),
    path.join(directory, 'electron.breakpad.syms'),
  ]
  const r = await new Promise((resolve, reject) => {
    minidump.walkStack(file, symbolPaths, (err, rep) => {
      if (err) reject(err)
      resolve(rep)
    })
  })
  return r.toString('utf8')
}

const download = (options) => {
  return new Promise((resolve, reject) => {
    const {version, quiet, directory, platform, force} = options

    if (fs.existsSync(directory) && !force) return resolve()

    electronDownload({
      platform,
      arch: 'x64',

      mirror: 'https://dl.frontapp.com/',
      customDir: 'electron-artifacts/v8.3.0-front-1_20200601',
      version: '8.3.0-front-1',

      symbols: true,
      quiet,
      force,
    }, (error, zipPath) => {
      if (error != null) return reject(error)
      extractZip(zipPath, {dir: directory}, resolve)
    })
  })
}

module.exports = {minidump: electronMinidump}
