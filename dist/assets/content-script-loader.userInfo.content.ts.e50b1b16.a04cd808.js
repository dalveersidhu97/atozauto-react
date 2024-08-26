(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/userInfo.content.ts.e50b1b16.js")
    );
  })().catch(console.error);

})();
