/* global chrome */

import React, { useState } from 'react';
import '../styles/DropdownMenu.css';

function DropdownMenu() {
    const [active, setActive] = useState(null);
    const [targetWords, setTargetWords] = useState('');
    const [replacementWords, setReplacementWords] = useState('');
    const [extractedText, setExtractedText] = useState('');

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
        chrome.storage.sync.get({replacementRules: []}, (data) => {
            let rules = Array.isArray(data.replacementRules)?data.replacementRules: [];

            rules.push({
                targetWords: targetWords,
                replacementWords: replacementWords
            });
    
            chrome.storage.sync.set({replacementRules: rules}, () => {
                console.log('Replacement rules saved');
            });
    
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "applyAllReplacements",
                    rules: rules
                });
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
                <div className="action-buttons">
                    <button onClick={() => console.log('Retrying...')}>Retry</button>
                    <button onClick={() => console.log('Clearing...')}>Clear</button>
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
                        <button onClick={() => { setTargetWords(''); setReplacementWords(''); }}>Reset</button>
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
