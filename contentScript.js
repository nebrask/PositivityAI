let replacementChanges = [];

function applyReplacements(rules, currentUrl) {
    const originalHTML = document.body.innerHTML;
    rules.forEach(rule => {
        if (rule.url === currentUrl) {
            document.body.innerHTML = document.body.innerHTML.replace(new RegExp(rule.targetWords, 'gi'), `${rule.replacementWords}`);
        }
    });
    replacementChanges.push(originalHTML);
}

function undoReplacement() {
    if (replacementChanges.length > 0) {
        document.body.innerHTML = replacementChanges.pop();
    }
}

function highlightText(sentimentData) {
    let modifiedText = document.body.innerHTML;
    sentimentData.sentences.forEach(sentence => {
        const regex = new RegExp(sentence.text.content, "gi");
        const replacement = `<span style="background-color: ${sentence.sentiment.score > 0 ? 'green' : 'red'};" class="highlight">${sentence.text.content}</span>`;
        modifiedText = modifiedText.replace(regex, replacement);
    });
    document.body.innerHTML = modifiedText;
}

function clearHighlights() {
    const highlightedSpans = document.querySelectorAll('span.highlight');
    highlightedSpans.forEach(highlightedSpan => {
        const parentElement = highlightedSpan.parentNode;
        if (parentElement) {
            parentElement.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
            parentElement.normalize();
        }
    });
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "displaySentiment") {
        highlightText(request.data);
    } else if (request.action === "applyAllReplacements") {
        const currentUrl = window.location.href;
        applyReplacements(request.rules, currentUrl);
        highlightText(request.data);
        sendResponse({status: "Replacements applied, text re-analyzed"});
    } else if (request.action === "undoChange") {
        undoReplacement();
        highlightText(request.data);
        sendResponse({status: "Last change undone"});
    } else if (request.action === "clearHighlights") {
        clearHighlights();
        sendResponse({status: "Highlights cleared"});
    }
});

chrome.storage.sync.get('replacementRules', (data) => {
    if (data.replacementRules && data.replacementRules.length > 0) {
        const currentUrl = window.location.href;
        applyReplacements(data.replacementRules, currentUrl);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    analyzePageText();
});

function analyzePageText() {
    chrome.runtime.sendMessage({
        action: "analyzeText",
        text: document.body.innerText
    });
}