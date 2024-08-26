(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/vto.content.ts.b6ed0629.js")
    );
  })().catch(console.error);

})();
