(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/userInfo.content.ts.ac18a0ae.js")
    );
  })().catch(console.error);

})();
