export function privacySignalEnabled({ globalPrivacyControl, doNotTrack, windowDoNotTrack } = {}) {
  return globalPrivacyControl === true || doNotTrack === "1" || windowDoNotTrack === "1";
}

export function readingWindowIsActive({ visibilityState, hasFocus } = {}) {
  return visibilityState === "visible" && hasFocus === true;
}
