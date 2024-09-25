// Content script functionality will be added here

let isPopupVisible = false;
let tokenizer = null;
let language, languageResponse, languageAbility;

// Add this function to fetch settings
function fetchSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language', 'languageResponse', 'languageAbility'], function(result) {
      language = result.language || 'English';
      languageResponse = result.languageResponse || 'English';
      languageAbility = result.languageAbility || 'B1';
      resolve();
    });
  });
}

// Modify the initialization to fetch settings before setting up the tokenizer
async function initialize() {
  await fetchSettings();
  console.log("Kuromoji dictionary path:", chrome.runtime.getURL("dict/"));
  kuromoji.builder({ dicPath: chrome.runtime.getURL("dict/") }).build((err, _tokenizer) => {
    if(err) {
      console.error("Kuromoji initialization error:", err);
    } else {
      console.log("Kuromoji tokenizer initialized successfully");
      tokenizer = _tokenizer;
    }
  });
}

// Call initialize function
initialize();

// Function to create and show the translation popup
function showTranslationPopup(originalText, translatedText) {
  removeTranslationPopup(); // Remove existing popup if any

  // Create popup element
  const popup = document.createElement('div');
  popup.id = 'lazy-lookup-popup';
  popup.className = 'lazy-lookup-popup';
  
  // Separate Japanese words and make them clickable
  const separatedOriginal = separateJapaneseWords(originalText);
  
  // Add original text and loading indicator for translation
  popup.innerHTML = `
    <div class="text-box original-text"><strong>Original:</strong> ${separatedOriginal}</div>
    <div class="text-box translated-text"><strong>${languageResponse}:</strong> <div class="loading-container"><div class="loading"></div></div></div>
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
    .text-box {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .explanation-section {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
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
      background-color: rgba(220, 220, 220, 0.5);
      border-radius: 3px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
    }
    .loading {
      display: inline-block;
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Update the popup with the translation when it's ready
  if (translatedText) {
    updateTranslation(translatedText);
  }
}

// Function to update the translation in the popup
function updateTranslation(translatedText) {
  const popup = document.getElementById('lazy-lookup-popup');
  if (popup) {
    const translatedDiv = popup.querySelector('.translated-text');
    const wrappedTranslatedText = translatedText.split(' ').map(word => 
      `<span class="translated-word">${word}</span>`
    ).join(' ');
    translatedDiv.innerHTML = `<strong>${languageResponse}:</strong> ${wrappedTranslatedText}`;
  }
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
    showWordExplanation(word); // Show loading indicator
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

  // Show loading indicator
  explanationDiv.innerHTML = `
    <h3>${wordWithReading}</h3>
    <div class="loading-container"><div class="loading"></div></div>
  `;

  // Format the explanation when it's ready
  if (explanation) {
    console.log("Raw explanation:", explanation);  // Log the raw explanation

    const sections = explanation.split(/(?=##|###)/).filter(section => section.trim() !== '#');
    
    let formattedExplanation = sections.map(section => {
      const [title, ...content] = section.split('\n');
      if (title.trim().startsWith('#')) {
        return `<div class="explanation-section">
          <h4>${title.replace(/##|###/, '').trim()}</h4>
          ${content.join('<br>').trim()}
        </div>`;
      }
      return '';
    }).join('');

    explanationDiv.innerHTML = `
      <h4>${wordWithReading}</h4>
      ${formattedExplanation}
    `;

    console.log("Formatted explanation HTML:", explanationDiv.innerHTML);  // Log the formatted HTML
  }

  // Adjust popup height to fit new content
  popup.style.height = 'auto';
  popup.style.maxHeight = '80vh';
  popup.style.overflowY = 'auto';
}

// Helper function to get hiragana reading (implement this)
function getHiraganaReading(word) {
  // This is a placeholder. implement the actual conversion
  // You might want to use a Japanese language processing library or API for this
  return 'かんぜん'; // Example return
}

// Modify the getWordExplanation function to use the latest settings
async function getWordExplanation(word, sentence) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      action: "explainWord", 
      word: word, 
      sentence: sentence,
      language: language,
      languageResponse: languageResponse,
      languageAbility: languageAbility
    }, (response) => {
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
        showTranslationPopup(selectedText);
        chrome.runtime.sendMessage({
          action: "translateText", 
          text: selectedText,
          language: language,
          languageResponse: languageResponse,
          languageAbility: languageAbility
        }, (response) => {
          updateTranslation(response.translatedText);
        });
      } else {
        console.log('No text selected');
      }
    }
  }
});