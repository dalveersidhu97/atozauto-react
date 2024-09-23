(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/vet.content.ts.2b2fa91d.js")
    );
  })().catch(console.error);

})();
