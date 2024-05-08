import React from 'react';
import '../styles/DropdownMenu.css';

function DropdownMenu() {
    return (
        <div className="dropdown-menu">
            <h1>PositivityAI</h1>
            <button>Flag Words</button>
            <button>Replace Words</button>
            <button>Text Update via Screenshot</button>
        </div>
    );
}

export default DropdownMenu;
