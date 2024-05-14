let replacementChanges = [];

function applyReplacements(rules, currentUrl) {
    const originalHTML = document.body.innerHTML;
    rules.forEach(rule => {
        if (rule.url === currentUrl) {
            document.body.innerHTML = document.body.innerHTML.replace(new RegExp(rule.targetWords, 'gi'), rule.replacementWords);
        }
    });
    replacementChanges.push(originalHTML);
}

function undoReplacement() {
    if (replacementChanges.length > 0) {
        document.body.innerHTML = replacementChanges.pop();
    }
}

chrome.storage.sync.get('replacementRules', (data) => {
    if (data.replacementRules && data.replacementRules.length > 0) {
        const currentUrl = window.location.href;
        applyReplacements(data.replacementRules, currentUrl);
    }
});

chrome.runtime.onMessage.addListener(function(request, sendResponse) {
    const currentUrl = window.location.href;
    if (request.action === "applyAllReplacements") {
        applyReplacements(request.rules, currentUrl);
        sendResponse({status: "Replacements applied"});
    } else if (request.action === "undoChange") {
        undoReplacement();
        sendResponse({status: "Last change undone"});
    }
    return true;
});