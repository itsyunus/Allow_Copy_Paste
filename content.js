// Content script - injects the bypass script into page context
(function () {
    'use strict';

    // Inject script into page context (not isolated world)
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
})();
