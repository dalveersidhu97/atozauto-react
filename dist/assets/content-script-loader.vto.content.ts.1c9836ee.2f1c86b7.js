(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/vto.content.ts.1c9836ee.js")
    );
  })().catch(console.error);

})();
