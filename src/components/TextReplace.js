import React, { useState } from 'react';

function TextReplace() {
    const [targetWords, setTargetWords] = useState('');
    const [replacementWords, setReplacementWords] = useState('');

    const handleReplace = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const currentUrl = tabs[0].url;
            chrome.storage.sync.get({replacementRules: []}, (data) => {
                let rules = Array.isArray(data.replacementRules) ? data.replacementRules : [];
                rules.push({
                    url: currentUrl,
                    targetWords: targetWords,
                    replacementWords: replacementWords
                });

                chrome.storage.sync.set({replacementRules: rules}, () => {
                    console.log('Updated replacement rules saved');
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "applyAllReplacements",
                        rules: rules
                    });
                });
            });
        });
    };

    const handleUndo = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "undoChange"
            }, response => {
                console.log(response.status);
            });
        });
    };

    return (
        <div>
            <input type="text" placeholder="Enter words to replace" value={targetWords} onChange={e => setTargetWords(e.target.value)} />
            <input type="text" placeholder="Enter replacement words" value={replacementWords} onChange={e => setReplacementWords(e.target.value)} />
            <div className="action-buttons">
                <button onClick={handleReplace}>Apply</button>
                <button onClick={handleUndo}>Undo</button>
            </div>
        </div>
    );
}

export default TextReplace;
