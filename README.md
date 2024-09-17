# LazyLookup Chrome Extension

LazyLookup is a Chrome extension designed to help language learners, particularly those studying Japanese. It provides quick translations and word explanations for selected text on any webpage.

## Features

- Translate selected Japanese text to English with a keyboard shortcut (Alt+Z)
- Display both original text and translation in a popup
- Click on individual Japanese words for detailed explanations
- Uses Kuromoji.js for accurate Japanese word segmentation
- Utilizes OpenAI's GPT 4o-mini model for translations and word explanations

## Installation

1. Clone this repository or download the source code
2. Open Chrome/Brave and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The LazyLookup extension should now be installed and visible in your Chrome toolbar

## Configuration

1. Click on the LazyLookup's `details` in the Extensions page
2. Select "Extension Options" to open the options page
3. Enter your OpenAI API key and save (get your key [here](https://platform.openai.com/account/api-keys))

## Usage

1. Select Japanese text on any webpage
2. Press Alt+Z (or your configured shortcut) to translate
3. A popup will appear with the original text and translation
4. Click on individual Japanese words in the original text for detailed explanations

## TODO List

- [ ] Implement single word explanations with example sentences
- [ ] Implement better error handling for API calls
- [ ] Add support for other language pairs
- [ ] Improve UI/UX of the popup window
- [ ] Implement a history feature to review past translations
- [ ] Add support for text-to-speech for pronunciation practice

## Credits

This project uses the following open-source libraries:

- [Kuromoji.js](https://github.com/takuyaa/kuromoji.js): A Japanese morphological analyzer.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.