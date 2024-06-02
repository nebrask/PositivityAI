import React from 'react';

function PrintExport() {
    const handleExport = () => {
        console.log("Starting to print...");
        try {
            window.print();
            console.log("Print command executed!");
        } catch (error) {
            console.error("Print error:", error);
        }
    };

    return (
        <div className="export-button">
            <img src="./assets/export.png" alt="Export" onClick={handleExport} style={{ cursor: 'pointer' }} />
        </div>
    );
}

export default PrintExport;
