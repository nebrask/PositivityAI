let replacementChanges = [];

function applyReplacements(rules, currentUrl) {
    const originalHTML = document.body.innerHTML;
    rules.forEach(rule => {
        if (rule.url === currentUrl) {
            document.body.innerHTML = document.body.innerHTML.replace(new RegExp(rule.targetWords, 'gi'), `<span style="background-color: yellow;">${rule.replacementWords}</span>`);
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
    if (request.action === "displaySentiment") {
        highlightText(request.data);
    } else if (request.action === "applyAllReplacements") {
        const currentUrl = window.location.href;
        applyReplacements(request.rules, currentUrl);
        sendResponse({status: "Replacements applied"});
    } else if (request.action === "undoChange") {
        undoReplacement();
        sendResponse({status: "Last change undone"});
    }
});

function highlightText(sentimentData) {
    let modifiedText = document.body.innerHTML;
    sentimentData.sentences.forEach(sentence => {
        const regex = new RegExp(sentence.text.content, "gi");
        const replacement = `<span style="background-color: ${sentence.sentiment.score > 0 ? 'green' : 'red'};">${sentence.text.content}</span>`;
        modifiedText = modifiedText.replace(regex, replacement);
    });

    document.body.innerHTML = modifiedText;
}


function analyzePageText() {
    chrome.runtime.sendMessage({
        action: "analyzeText",
        text: document.body.innerText
    });
}

document.addEventListener('DOMContentLoaded', function() {
    analyzePageText();
});
