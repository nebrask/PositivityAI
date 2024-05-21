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

function highlightText(sentimentData, sensitivity) {
    let modifiedText = document.body.innerHTML;
    let threshold = Math.abs(1 - sensitivity * 0.2);

    console.log(`Sensitivity: ${sensitivity}, Threshold: ${threshold}`);

    sentimentData.sentences.forEach(sentence => {
        if (Math.abs(sentence.sentiment.score) >= threshold) {
            const regex = new RegExp(sentence.text.content, "gi");
            const replacement = `<span style="background-color: ${sentence.sentiment.score > 0 ? 'green' : 'red'};" class="highlight">${sentence.text.content}</span>`;
            modifiedText = modifiedText.replace(regex, replacement);
        }
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

chrome.runtime.onMessage.addListener(function(request, sendResponse) {
    switch (request.action) {
        case "displaySentiment":
            clearHighlights();
            highlightText(request.data, request.sensitivity || 3);
            sendResponse({status: "Text highlighted according to sensitivity"});
            break;
        case "applyAllReplacements":
            const currentUrl = window.location.href;
            applyReplacements(request.rules, currentUrl);
            sendResponse({status: "Replacement words applied"});
            break;
        case "undoChange":
            undoReplacement();
            sendResponse({status: "Last change undone"});
            break;
        case "clearHighlights":
            clearHighlights();
            sendResponse({status: "Highlights cleared"});
            break;
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