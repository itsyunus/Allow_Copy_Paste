// Universal Paste Enabler - Works on ALL websites
(function () {
    'use strict';

    // ALL events that could block paste/copy
    const blockedEvents = [
        'paste', 'copy', 'cut',
        'contextmenu', 'selectstart', 'select',
        'beforepaste', 'beforecopy', 'beforecut',
        'dragstart', 'drop'
    ];

    // 1. CAPTURE PHASE - Stop all paste blocking at the earliest point
    blockedEvents.forEach(evt => {
        document.addEventListener(evt, e => e.stopImmediatePropagation(), true);
        window.addEventListener(evt, e => e.stopImmediatePropagation(), true);
    });

    // 2. OVERRIDE addEventListener - Neuter any paste blockers
    const origAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, fn, opts) {
        if (blockedEvents.includes(type)) {
            return origAdd.call(this, type, () => { }, opts); // Replace with empty function
        }
        return origAdd.call(this, type, fn, opts);
    };

    // 3. OVERRIDE onpaste/oncopy setters on ALL prototypes
    const prototypes = [
        HTMLElement.prototype,
        HTMLInputElement.prototype,
        HTMLTextAreaElement.prototype,
        HTMLBodyElement.prototype,
        Document.prototype,
        Window.prototype,
        Element.prototype
    ];

    const handlers = ['onpaste', 'oncopy', 'oncut', 'oncontextmenu', 'onselectstart',
        'onbeforepaste', 'onbeforecopy', 'onbeforecut', 'ondragstart', 'ondrop'];

    prototypes.forEach(proto => {
        handlers.forEach(handler => {
            try {
                Object.defineProperty(proto, handler, {
                    get: () => null,
                    set: () => true,
                    configurable: true
                });
            } catch (e) { }
        });
    });

    // 4. KEYBOARD SHORTCUT - Ensure Ctrl+V/Cmd+V always works
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V' || e.keyCode === 86)) {
            e.stopImmediatePropagation();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
            e.stopImmediatePropagation();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'x' || e.key === 'X' || e.keyCode === 88)) {
            e.stopImmediatePropagation();
        }
    }, true);

    // 5. CLEAN INLINE HANDLERS from all elements
    function cleanElement(el) {
        if (!el || !el.removeAttribute) return;
        handlers.forEach(h => {
            try {
                el[h] = null;
                el.removeAttribute(h);
            } catch (e) { }
        });
        // Also remove data attributes that might be used for JS blocking
        try {
            el.removeAttribute('data-paste');
            el.removeAttribute('data-clipboard');
        } catch (e) { }
    }

    // 6. CODE EDITOR SUPPORT (CodeMirror, Ace, Monaco)
    function enableEditors() {
        // CodeMirror
        document.querySelectorAll('.CodeMirror').forEach(el => {
            if (el.CodeMirror) {
                el.CodeMirror.setOption('readOnly', false);
                el.addEventListener('paste', function (e) {
                    e.stopImmediatePropagation();
                    const text = (e.clipboardData || window.clipboardData).getData('text');
                    if (text) el.CodeMirror.replaceSelection(text);
                }, true);
            }
        });
        document.querySelectorAll('.CodeMirror textarea, .CodeMirror-code').forEach(el => {
            el.addEventListener('paste', e => e.stopImmediatePropagation(), true);
        });

        // Ace Editor
        document.querySelectorAll('.ace_editor').forEach(el => {
            if (el.env && el.env.editor) {
                el.addEventListener('paste', function (e) {
                    e.stopImmediatePropagation();
                    const text = (e.clipboardData || window.clipboardData).getData('text');
                    if (text) el.env.editor.insert(text);
                }, true);
            }
        });
        document.querySelectorAll('.ace_text-input').forEach(el => {
            el.addEventListener('paste', e => e.stopImmediatePropagation(), true);
        });

        // Monaco Editor
        document.querySelectorAll('.monaco-editor textarea, .monaco-editor .inputarea').forEach(el => {
            el.addEventListener('paste', e => e.stopImmediatePropagation(), true);
        });
    }

    // 7. PROCESS ALL ELEMENTS
    function processAll() {
        document.querySelectorAll('*').forEach(cleanElement);
        enableEditors();
    }

    // 8. MUTATION OBSERVER - Handle dynamic content
    const observer = new MutationObserver(() => processAll());

    // 9. CSS - Enable text selection everywhere
    const style = document.createElement('style');
    style.id = 'paste-enabler-css';
    style.textContent = `
        *, *::before, *::after {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
            -webkit-touch-callout: default !important;
        }
        input, textarea, [contenteditable="true"] {
            -webkit-user-select: auto !important;
            user-select: auto !important;
        }
    `;

    // 10. INITIALIZE
    function init() {
        (document.head || document.documentElement).appendChild(style);
        processAll();
        observer.observe(document.documentElement, { childList: true, subtree: true });

        // Re-scan for late-loading content
        setTimeout(processAll, 300);
        setTimeout(processAll, 1000);
        setTimeout(processAll, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', processAll);

    console.log('✅ Universal Paste Enabler Active!');
})();
