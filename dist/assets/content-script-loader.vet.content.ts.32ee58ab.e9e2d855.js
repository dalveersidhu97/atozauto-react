(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/vet.content.ts.32ee58ab.js")
    );
  })().catch(console.error);

})();
