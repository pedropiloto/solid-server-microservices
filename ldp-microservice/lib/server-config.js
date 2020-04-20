'use strict'

/**
 * Server config initialization utilities
 */

const fs = require('fs-extra')
const path = require('path')
const templateUtils = require('./common/template-utils')
const fsUtils = require('./common/fs-utils')

const debug = require('./debug')

function printDebugInfo (options) {
  debug.settings('Server URI: ' + options.serverUri)
  debug.settings('Auth method: ' + options.auth)
  debug.settings('Strict origins: ' + options.strictOrigin)
  debug.settings('Allowed origins: ' + options.trustedOrigins)
  debug.settings('Db path: ' + options.dbPath)
  debug.settings('Config path: ' + options.configPath)
  debug.settings('Suffix Acl: ' + options.suffixAcl)
  debug.settings('Suffix Meta: ' + options.suffixMeta)
  debug.settings('Allow WebID authentication: ' + !!options.webid)
  debug.settings('Live-updates: ' + !!options.live)
  debug.settings('Multi-user: ' + !!options.multiuser)
  debug.settings('Suppress default data browser app: ' + options.suppressDataBrowser)
  debug.settings('Default data browser app file path: ' + options.dataBrowserPath)
}

/**
 * Ensures that a directory has been copied / initialized. Used to ensure that
 * account templates, email templates and default apps have been copied from
 * their defaults to the customizable config directory, at server startup.
 *
 * @param fromDir {string} Path to copy from (defaults)
 *
 * @param toDir {string} Path to copy to (customizable config)
 *
 * @return {string} Returns the absolute path for `toDir`
 */
function ensureDirCopyExists (fromDir, toDir) {
  fromDir = path.resolve(fromDir)
  toDir = path.resolve(toDir)

  if (!fs.existsSync(toDir)) {
    fs.copySync(fromDir, toDir)
  }

  return toDir
}

/**
 * Ensures that the server config directory (something like '/etc/solid-server'
 * or './config', taken from the `configPath` config.json file) exists, and
 * creates it if not.
 *
 * @param argv
 *
 * @return {string} Path to the server config dir
 */
function initConfigDir (argv) {
  let configPath = path.resolve(argv.configPath)
  fs.mkdirp(configPath)

  return configPath
}

/**
 * Ensures that the customizable 'views' folder exists for this installation
 * (copies it from default views if not).
 *
 * @param configPath {string} Location of configuration directory (from the
 *   local config.json file or passed in as cli parameter)
 *
 * @return {string} Path to the views dir
 */
function initDefaultViews (configPath) {
  let defaultViewsPath = path.join(__dirname, '../default-views')
  let viewsPath = path.join(configPath, 'views')

  ensureDirCopyExists(defaultViewsPath, viewsPath)

  return viewsPath
}

/**
 * Makes sure that the various template directories (email templates, new
 * account templates, etc) have been copied from the default directories to
 * this server's own config directory.
 *
 * @param configPath {string} Location of configuration directory (from the
 *   local config.json file or passed in as cli parameter)
 *
 * @return {Object} Returns a hashmap of template directories by type
 *   (new account, email, server)
 */
function initTemplateDirs (configPath) {
  let accountTemplatePath = ensureDirCopyExists(
    path.join(__dirname, '../default-templates/new-account'),
    path.join(configPath, 'templates', 'new-account')
  )

  let emailTemplatesPath = ensureDirCopyExists(
    path.join(__dirname, '../default-templates/emails'),
    path.join(configPath, 'templates', 'emails')
  )

  let serverTemplatePath = ensureDirCopyExists(
    path.join(__dirname, '../default-templates/server'),
    path.join(configPath, 'templates', 'server')
  )

  // Ensure that the root .acl file exists,
  // because this was not mandatory in before 5.0.0
  ensureDirCopyExists(
    path.join(__dirname, '../default-templates/server/.acl'),
    path.join(configPath, 'templates', 'server', '.acl')
  )

  return {
    account: accountTemplatePath,
    email: emailTemplatesPath,
    server: serverTemplatePath
  }
}

module.exports = {
  ensureDirCopyExists,
  initConfigDir,
  initDefaultViews,
  initTemplateDirs,
  printDebugInfo
}
