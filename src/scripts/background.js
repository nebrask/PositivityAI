const SENTIMENT_API_KEY = process.env.SENTIMENT_API_KEY;
const OCR_API_KEY = process.env.OCR_API_KEY;

async function analyzeText(text) {
    const apiURL = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${SENTIMENT_API_KEY}`;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ document: { type: 'PLAIN_TEXT', content: text }, encodingType: 'UTF8' })
        });

        const data = await response.json();

        if (data.error) {
            console.error('API error:', data.error.message);

            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Calling API:', error);
        throw error;
    }
}

async function performOCR(imageData, tabId) {
    const base64Image = `data:image/png;base64,${imageData}`;
    const ocrUrl = `https://api.ocr.space/parse/image`;
    let formData = new FormData();

    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', true);
    formData.append('base64Image', base64Image);

    try {
        const response = await fetch(ocrUrl, { method: 'POST', body: formData });
        const data = await response.json();
        
        console.log("OCR API:", data);

        if (data.isErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
            chrome.tabs.sendMessage(tabId, { action: "ocrResult", error: data.ErrorMessage || "No parsed results" });
            
            return;
        }

        chrome.tabs.sendMessage(tabId, { action: "ocrResult", text: data.ParsedResults[0].ParsedText });

    } catch (error) {
        console.error('Error performing OCR:', error);
        chrome.tabs.sendMessage(tabId, { action: "ocrResult", error: error.toString() });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "analyzeText") {
        analyzeText(request.text).then(response => {
            const targetTabId = request.tabId;

            if (targetTabId) {
                chrome.tabs.sendMessage(targetTabId, { action: "displaySentiment", data: response, sensitivity: request.sensitivity });
            } else {
                console.error('No tab identified for sentiment analysis');
                sendResponse({ error: 'No tab identified for sentiment analysis' });
            }
        }).catch(error => {
            console.error('Failed analyzing text:', error);
            sendResponse({ error: error.toString() });
        });
    } else if (request.action === "extractText") {
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
            if (chrome.runtime.lastError) {
                console.error('Error capturing:', chrome.runtime.lastError.message);
                sendResponse({error: chrome.runtime.lastError.message});
                return;
            }
            performOCR(dataUrl.split(',')[1], sender.tab.id);
        });
        return true;
    }
    return true;
});
