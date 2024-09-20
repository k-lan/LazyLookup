let OPENAI_API_KEY = '';
let LANGUAGE = 'Japanese';
let LANGUAGE_RESPONSE = 'English';
let LANGUAGE_ABILITY = 'C2';

// Fetch the API key, languages, and language ability from storage when the background script starts
chrome.storage.local.get(['openaiApiKey', 'language', 'languageResponse', 'languageAbility'], function(result) {
  OPENAI_API_KEY = result.openaiApiKey || '';
  LANGUAGE = result.language || 'Japanese';
  LANGUAGE_RESPONSE = result.languageResponse || 'English';
  LANGUAGE_ABILITY = result.languageAbility || 'C2';
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "translate-text") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"});
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    translateText(request.text)
      .then(translation => {
        console.log('Translation successful:', translation);
        sendResponse({translatedText: translation});
      })
      .catch(error => {
        console.error('Translation error in listener:', error);
        sendResponse({translatedText: `Error: ${error.message}`});
      });
    return true; 
  } else if (request.action === "explainWord") {
    explainWord(request.word, request.sentence).then(explanation => {
      sendResponse({explanation: explanation});
    });
    return true; 
  }
});

async function translateText(text) {
  try {
    console.log('Attempting to translate:', text);
    console.log('Using API key:', OPENAI_API_KEY.substring(0, 5) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {role: 'system', content: `You are a translator. Translate the given text to ${LANGUAGE}. Provide ONLY the translation.`},
          {role: 'user', content: text}
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

async function explainWord(word, sentence) {
    console.log('Attempting to explain word:', word, 'in sentence:', sentence);
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Explain the word "${word}" in the context of the following sentence: "${sentence}". Reply in a two section format separated by line breaks and headers. The sections will be the words meaning in the given context, and two example sentences in the original language. Reply in ${LANGUAGE_RESPONSE}. If possible, adjust the explanation complexity to ${LANGUAGE_ABILITY} level.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Word explanation error:', error);
    return `Error explaining word: ${error.message}`;
  }
}