# PositivityAI

PositivityAI is a Chrome extension designed to enhance the positivity of web content by analyzing, modifying, and interacting with text on webpages. It aims to provide users with tools to detect negative and positive sentiments, replace words with alternatives, rewrite sections of text directly from webpages, and eventually, print a summary of analyses and changes. This extension is especially useful for individuals who wish to maintain a positive digital environment.

> **Note**: PositivityAI does not support modifications and analyses on all webpages. Due to the various content security policies and technical restrictions of different websites, some webpages might restrict the extension’s ability to modify or analyze text.

## Features

- **Sentiment Analysis**: Detects negative and positive words within the text of a webpage and highlights them.
- **Replace Functionality**: Allows users to replace specified words on a webpage persistently.
- **Rewrite Functionality**: Enables users to select snippets of text, extract them, and rewrite them directly on the page.
- **Print Functionality**: (In development) Will allow users to print a summary of the sentiment analysis and the original and modified texts.

## Prerequisites

- **Google Chrome Browser**: As this is a Chrome extension, the Google Chrome browser is required.
- **Node.js and npm**: This project uses Node.js and npm to manage dependencies and run scripts. Download and install them from [Node.js official website](https://nodejs.org/).
- **API Keys**:
  - **Google Cloud Platform API Key**: Required for sentiment analysis functionality. You will need to enable the Cloud Natural Language API for your Google Cloud project and generate an API key. Visit [Google Cloud Console](https://console.cloud.google.com/) to set this up.
  - **OCR.space API Key**: Needed for the OCR functionality. You can obtain a free key by registering at [OCR.space API](https://ocr.space/OCRAPI).

## Setting Up

1. **Clone the repository**:
   ```
   git clone https://github.com/yourgithub/positivityai.git
   cd positivityai
   ```
2. **Create a .env file**:

   Create a .env file in the root directory of the project and add your API keys:
    ```
    SENTIMENT_API_KEY=your_google_cloud_sentiment_api_key
    OCR_API_KEY=your_ocr_space_api_key
    ```
3. **Install Dependencies**:

    Install all the necessary dependencies by running:
    ```
    npm install
    ```
4. **Build the extension**:
   
    Build the project using the appropriate npm script:
    ```
    npm run build-all
    ```

## Loading the Extension in Developer Mode

1. Open Google Chrome.
2. Navigate to chrome://extensions/.
3. Enable "Developer mode" at the top right.
4. Click "Load unpacked" and select the build folder from the cloned repository.
5. The PositivityAI extension should now be visible in your extensions list and usable from your browser toolbar.

## Testing

To test the functionality of the PositivityAI Chrome Extension, perform the following steps:

1. **Functionality Check**: Navigate to any webpage and activate the extension. Use the Detect, Replace, and Rewrite functionalities to modify text and analyze sentiment. Ensure the modifications and highlights appear as expected.

2. **Error Monitoring**: Open the Chrome developer console (press `F12` or right-click and select "Inspect") to monitor for any error messages or warnings during operations. This will help identify any potential issues with the extension’s functionality.

3. **Persistence Verification**: After making changes such as replacing words on a webpage using the extension, reload the page to verify that changes persist as expected, ensuring the extension’s actions have a lasting effect.

