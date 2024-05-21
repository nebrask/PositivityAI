/* global chrome */

import React, { useState } from 'react';
import '../styles/DropdownMenu.css';

function DropdownMenu() {
    const [active, setActive] = useState(null);
    const [targetWords, setTargetWords] = useState('');
    const [replacementWords, setReplacementWords] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [sensitivity, setSensitivity] = useState(3);

    const toggleActive = (buttonName) => {
        if (active === buttonName) {
            setActive(null);
        } else {
            setActive(buttonName);
        }
    };

    const handleExport = () => {
        console.log("Starting to print");
        setTimeout(() => {
            try {
                window.print();
                console.log("Print command worked!");
            } catch (error) {
                console.error("Print error:", error);
            }
        }, 500);
    };
    
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
    

    const handleClear = () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "clearHighlights"
            }, response => {
                console.log("Clear response: ", response);
            });
        });
    };
    
    

    return (
        <div className="dropdown-menu">
            <h1>PositivityAI</h1>
            <div className="button-group">
                <button onClick={() => toggleActive('detect')}>
                    <span className={active === 'detect' ? 'active' : ''}>Detect</span>
                </button>
                <button onClick={() => toggleActive('replace')}>
                    <span className={active === 'replace' ? 'active' : ''}>Replace</span>
                </button>
                <button onClick={() => toggleActive('rewrite')}>
                    <span className={active === 'rewrite' ? 'active' : ''}>Rewrite</span>
                </button>
            </div>
            
            {active === 'detect' && (
                
                <div>
                    <input type="range" min="1" max="5" className="sensitivity-slider" value={sensitivity} onChange={sensitivityChange} />
                    <div className="action-buttons">
                        <button onClick={handleDetect}>Analyze</button>
                        <button onClick={handleClear}>Clear</button>
                    </div>
                </div>
            )}
            {active === 'replace' && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter words to replace"
                        value={targetWords}
                        onChange={(e) => setTargetWords(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter replacement words"
                        value={replacementWords}
                        onChange={(e) => setReplacementWords(e.target.value)}
                    />
                    <div className="action-buttons">
                        <button onClick={handleReplace}>Apply</button>
                        <button onClick={handleUndo}>Undo</button>
                    </div>
                </div>
            )}
            {active === 'rewrite' && (
                <div>
                    <textarea
                        placeholder="Placeholder text after capture from screenshot."
                        value={extractedText}
                        onChange={(e) => setExtractedText(e.target.value)}
                        style={{ width: '100%', minHeight: '120px' }}
                    />
                    <div className="action-buttons">
                        <button onClick={() => console.log('Rewritting...')}>Apply</button>
                        <button onClick={() => console.log('Recapturing...')}>Recapture</button>
                    </div>
                </div>
            )}
            <div className="export-button">
                <button onClick={handleExport}>
                    <img src="./assets/export.png" alt="Export" />
                </button>
            </div>
        </div>
    );
}

export default DropdownMenu;