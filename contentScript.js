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
        parentElement.replaceChild(document.createTextNode(highlightedSpan.textContent), highlightedSpan);
        parentElement.normalize();
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
        case "initiateCapture":
            startCapture();
            sendResponse({status: "Capture initiated"});
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
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs.length > 0) {
            chrome.runtime.sendMessage({
                action: "analyzeText",
                text: document.body.innerText,
                tabId: tabs[0].id
            });
        }
    });
}

function startCapture() {
    let overlay = document.createElement('div');

    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    overlay.style.cursor = 'crosshair';
    overlay.style.zIndex = '10000';
    document.body.appendChild(overlay);

    let startX, startY, rect;

    overlay.onmousedown = function(e) {
        startX = e.clientX;
        startY = e.clientY;
        rect = document.createElement('div');
        rect.style.position = 'absolute';
        rect.style.left = `${startX}px`;
        rect.style.top = `${startY}px`;
        rect.style.border = '2px dashed white';
        overlay.appendChild(rect);

        overlay.onmousemove = function(e) {
            let currentX = e.clientX;
            let currentY = e.clientY;

            rect.style.width = `${Math.abs(currentX - startX)}px`;
            rect.style.height = `${Math.abs(currentY - startY)}px`;
            rect.style.left = `${Math.min(startX, currentX)}px`;
            rect.style.top = `${Math.min(startY, currentY)}px`;
        };
    };

    overlay.onmouseup = function() {
        overlay.onmousemove = null;
        overlay.onmousedown = null;

        const bounds = {
            x: Math.min(startX, parseInt(rect.style.left, 10)),
            y: Math.min(startY, parseInt(rect.style.top, 10)),

            width: parseInt(rect.style.width, 10),
            height: parseInt(rect.style.height, 10)
        };
    
        document.body.removeChild(overlay);
    
        requestScreenshot(bounds);
    };
    
    function requestScreenshot(bounds) {
        chrome.runtime.sendMessage({
            action: "extractText",
            bounds: bounds
        });
    }
}