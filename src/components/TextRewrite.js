import React, { useState, useEffect } from 'react';

function TextRewrite() {
    const [extractedText, setExtractedText] = useState('');

    useEffect(() => {
        const ocrResult = (request, sendResponse) => {
            if (request.action === "ocrResult") {
                setExtractedText(request.text);
                sendResponse({status: "OCR text received"});
            }
            return true;
        };

        chrome.runtime.onMessage.addListener(ocrResult);
        return () => chrome.runtime.onMessage.removeListener(ocrResult);
    }, []);

    const handleRewrite = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs.length) {
                console.error("No active tabs");
                return;
            }

            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "initiateCapture" });
        });
    };

    return (
        <div>
            <textarea
                placeholder="Placeholder text after capture from screenshot."
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                style={{ width: '100%', minHeight: '120px' }}
            />
            <div className="action-buttons">
                <button onClick={() => console.log('Rewritting...')}>Apply</button>
                <button onClick={handleRewrite}>Capture</button>
            </div>
        </div>
    );
}

export default TextRewrite;