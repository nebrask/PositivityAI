import React, { useState } from 'react';

function SentimentControl() {
    const [sensitivity, setSensitivity] = useState(3);

    const handleClear = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "clearHighlights"
            }, response => {
                console.log("Clear response: ", response);
            });
        });
    };

    const handleDetect = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { action: "clearHighlights" }, () => {
                chrome.scripting.executeScript({
                    target: {tabId: activeTab.id},
                    function: getPageText,
                }, (results) => {
                    if (results && results[0] && results[0].result) {
                        chrome.runtime.sendMessage({
                            action: "analyzeText",
                            text: results[0].result,
                            sensitivity: sensitivity,
                            tabId: activeTab.id
                        });
                    }
                });
            });
        });
    };

    const sensitivityChange = (event) => {
        setSensitivity(parseInt(event.target.value, 10));
    };

    function getPageText() {
        return document.body.innerText;
    }

    return (
        <div>
            <input type="range" min="1" max="5" className="sensitivity-slider" value={sensitivity} onChange={sensitivityChange} />
            <div className="action-buttons">
                <button onClick={handleDetect}>Analyze</button>
                <button onClick={handleClear}>Clear</button>
            </div>
        </div>
    );
}

export default SentimentControl;
