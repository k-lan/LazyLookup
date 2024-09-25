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

- [x] Implement single word explanations with example sentences
- [x] Add support for other language pairs
- [x] Improve UI/UX of the popup window
- [ ] Implement a history feature to review past translations???
- [ ] Add support for text-to-speech for pronunciation practice
- [x] Fix word hover in the popup window
- [ ] Correctly display the hiragana reading of the selected word
- [x] Show loading icons when waiting for API responses. Maybe text streaming for word explanations?
- [ ] Get rid of Kuromoji.js, match to the longest result in the dictionary, we want the longest matches.
- [ ] Fix bug related to the settings not always properly displaying correct language.

## Credits

This project uses the following open-source libraries:

- [Kuromoji.js](https://github.com/takuyaa/kuromoji.js): A Japanese morphological analyzer.

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.