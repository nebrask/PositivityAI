function applyReplacements(rules) {
    rules.forEach(rule => {
        document.body.innerHTML = document.body.innerHTML.replace(new RegExp(rule.targetWords, 'gi'), rule.replacementWords);
    });
}

chrome.storage.sync.get('replacementRules', (data) => {
    if (data.replacementRules && data.replacementRules.length > 0) {
        applyReplacements(data.replacementRules);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "applyAllReplacements") {
        applyReplacements(request.rules);
        sendResponse({status: "Replacements applied"});
    }
});
