const API_KEY = process.env.API_KEY;

async function analyzeText(text) {
    const apiURL = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${API_KEY}`;

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                document: {
                    type: 'PLAIN_TEXT',
                    content: text,
                },
                encodingType: 'UTF8'
            })
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

chrome.runtime.onMessage.addListener(function(request, sendResponse) {
    if (request.action === "analyzeText") {
        analyzeText(request.text).then(response => {
            if (request.tabId != null) {
                chrome.tabs.sendMessage(request.tabId, {
                    action: "displaySentiment",
                    data: response
                });
            } else {
                console.error('No tab was identified');
            }
        }).catch(error => {
            console.error('Failed analyzing text:', error);
            sendResponse({ error: error.toString() });
        });
        
        return true;
    }
});

