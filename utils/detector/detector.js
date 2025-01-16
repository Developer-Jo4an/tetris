import * as Bowser from "bowser";

function getBrowserData() {
    return global.navigator ? Bowser.getParser(global.navigator.userAgent) : null;
}

export function isMac() {
  return !!browserData?.parsedResult.os.name.match(/macOS/);
}

export function isMobile() {
  return !!browserData?.parsedResult.platform.type.match(/mobile/);
}


export const browserData = getBrowserData();
