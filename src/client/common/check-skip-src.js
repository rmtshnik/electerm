/**
 * Check if install source should skip upgrade check
 */

import { packInfo, srcsSkipUpgradeCheck } from './constants'

export const checkSkipSrc = (installSrc) => {
  // Forks receive upstream changes through Git, never through upstream binaries.
  if (packInfo.fork?.disableUpstreamUpdates) return true
  if (!installSrc) return false
  return srcsSkipUpgradeCheck.some(skipSrc => {
    if (skipSrc === 'skip-upgrade-check') {
      return installSrc === skipSrc
    }
    // For file extensions like '.appx', '.snap', check if installSrc ends with them
    return installSrc.endsWith(skipSrc)
  })
}
