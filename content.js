// Content script functionality will be added here

let isPopupVisible = false;
let tokenizer = null;

// Initialize Kuromoji tokenizer
console.log("Kuromoji dictionary path:", chrome.runtime.getURL("dict/"));
kuromoji.builder({ dicPath: chrome.runtime.getURL("dict/") }).build((err, _tokenizer) => {
  if(err) {
    console.error("Kuromoji initialization error:", err);
  } else {
    console.log("Kuromoji tokenizer initialized successfully");
    tokenizer = _tokenizer;
  }
});

// Function to create and show the translation popup
function showTranslationPopup(originalText, translatedText) {
  removeTranslationPopup(); // Remove existing popup if any

  // Create popup element
  const popup = document.createElement('div');
  popup.id = 'lazy-lookup-popup';
  popup.className = 'lazy-lookup-popup';
  
  // Separate Japanese words and make them clickable
  const separatedOriginal = separateJapaneseWords(originalText);
  
  // Wrap each word in the translated text with a span
  const wrappedTranslatedText = translatedText.split(' ').map(word => 
    `<span class="translated-word">${word}</span>`
  ).join(' ');
  
  // Add original (with clickable words) and translated text
  popup.innerHTML = `
    <div class="original-text">Original: ${separatedOriginal}</div>
    <div class="translated-text">Translated: ${wrappedTranslatedText}</div>
    <div class="word-explanation"></div>
  `;

  // Style the popup
  Object.assign(popup.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: 'black',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: '9999',
    maxWidth: '300px',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease-in-out'
  });

  // Add event listener for word clicks
  popup.addEventListener('click', handleWordClick);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.onclick = removeTranslationPopup;
  popup.appendChild(closeButton);

  // Add popup to body
  document.body.appendChild(popup);
  isPopupVisible = true;

  // Add these styles
  const style = document.createElement('style');
  style.textContent = `
    .lazy-lookup-popup {
      font-size: 18px;
    }
    .lazy-lookup-popup div {
      margin-bottom: 8px;
    }
    .lazy-lookup-popup button {
      font-size: 12px;
      padding: 5px 10px;
    }
    .translated-word {
      display: inline;
      border-radius: 3px;
    }
    .clickable-word {
      display: inline;
      transition: background-color 0.3s ease, border-radius 0.3s ease;
      border-radius: 3px;
    }
    .clickable-word:hover {
      background-color: rgba(220, 220, 220, 1); /* Lighter gray with 50% opacity */
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
}

// Function to separate Japanese words and wrap them in clickable spans
function separateJapaneseWords(text) {
  if (!tokenizer) {
    console.warn("Tokenizer not initialized, falling back to simple segmentation");
    // Fallback to your original simple segmentation
    const words = text.match(/[一-龯々ぁ-んァ-ヶー]+|[ａ-ｚＡ-Ｚ０-９]+|[、。！？]/g) || [text];
    return words.map(word => `<span class="clickable-word">${word}</span>`).join('');
  }

  const tokens = tokenizer.tokenize(text);
  return tokens.map(token => `<span class="clickable-word" data-pos="${token.pos}">${token.surface_form}</span>`).join('');
}

// Function to handle word clicks
async function handleWordClick(event) {
  if (event.target.classList.contains('clickable-word')) {
    const word = event.target.textContent;
    const sentence = event.target.closest('.original-text').textContent;
    const explanation = await getWordExplanation(word, sentence);
    showWordExplanation(word, explanation);
  }
}

// Function to show word explanation
function showWordExplanation(word, explanation) {
  const popup = document.getElementById('lazy-lookup-popup');
  const explanationDiv = popup.querySelector('.word-explanation');
  
  // Add hiragana reading if available
  const wordWithReading = word.match(/[一-龯々]/g) ? `${word} (${getHiraganaReading(word)})` : word;

  // Format the explanation
  const formattedExplanation = explanation
    .replace(/###\s+(.*)/g, '<h3>$1</h3>') // Convert ### to h3 tags
    .replace(/\n+/g, ' ') // Replace multiple newlines with a single space
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Remove leading and trailing whitespace

  explanationDiv.innerHTML = `
    <h3>${wordWithReading}</h3>
    <div>${formattedExplanation}</div>
  `;

  // Adjust popup height to fit new content
  popup.style.height = 'auto';
  popup.style.maxHeight = '80vh';
  popup.style.overflowY = 'auto';
}

// Helper function to get hiragana reading (you'll need to implement this)
function getHiraganaReading(word) {
  // This is a placeholder. You'll need to implement the actual conversion
  // You might want to use a Japanese language processing library or API for this
  return 'かんぜん'; // Example return
}

// Function to get word explanation from OpenAI
async function getWordExplanation(word, sentence) {
  // Send message to background script to make API call
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({action: "explainWord", word: word, sentence: sentence}, (response) => {
      resolve(response.explanation);
    });
  });
}

// Function to remove the translation popup
function removeTranslationPopup() {
  const existingPopup = document.getElementById('lazy-lookup-popup');
  if (existingPopup) {
    existingPopup.remove();
    isPopupVisible = false;
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    if (isPopupVisible) {
      removeTranslationPopup();
    } else {
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        chrome.runtime.sendMessage({action: "translateText", text: selectedText}, (response) => {
          showTranslationPopup(selectedText, response.translatedText);
        });
      } else {
        console.log('No text selected');
      }
    }
  }
});