(function () {
  'use strict';

  (async () => {
    await import(
      /* @vite-ignore */
      chrome.runtime.getURL("assets/vto.content.ts.c9db0156.js")
    );
  })().catch(console.error);

})();
