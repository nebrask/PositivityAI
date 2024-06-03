import React, { useState } from 'react';
import SentimentControl from './components/SentimentControl';
import TextReplace from './components/TextReplace';
import TextRewrite from './components/TextRewrite';
import PrintExport from './components/PrintExport';
import './App.css';

function App() {
    const [active, setActive] = useState(null);

    const toggleActive = (buttonName) => {
        setActive(active === buttonName ? null : buttonName);
    };

    return (
        <div className="dropdown-menu">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={"./assets/icon128.png"} alt="PositivityAI Logo" style={{ marginRight: 10 }} />
                <h1>PositivityAI</h1>
            </div>
            <div className="main-button">
                <button onClick={() => toggleActive('detect')}>
                    <span className={active === 'detect' ? 'active' : ''}>Analyze</span>
                </button>
                <button onClick={() => toggleActive('replace')}>
                    <span className={active === 'replace' ? 'active' : ''}>Replace</span>
                </button>
                <button onClick={() => toggleActive('rewrite')}>
                    <span className={active === 'rewrite' ? 'active' : ''}>Rewrite</span>
                </button>
            </div>
            {active === 'detect' && <SentimentControl />}
            {active === 'replace' && <TextReplace />}
            {active === 'rewrite' && <TextRewrite />}
            <PrintExport />
        </div>
    );
}

export default App;