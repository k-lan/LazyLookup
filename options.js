document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.local.get(['openaiApiKey', 'language', 'languageResponse', 'languageAbility'], function(result) {
    if (result.openaiApiKey) {
      document.getElementById('apiKey').value = result.openaiApiKey;
    }
    if (result.language) {
      document.getElementById('language').value = result.language;
    }
    if (result.languageResponse) {
      document.getElementById('languageResponse').value = result.languageResponse;
    }
    if (result.languageAbility) {
      document.getElementById('languageAbility').value = result.languageAbility;
    }
  });

  // Save settings
  document.getElementById('save').addEventListener('click', function() {
    var apiKey = document.getElementById('apiKey').value;
    var language = document.getElementById('language').value;
    var languageResponse = document.getElementById('languageResponse').value;
    var languageAbility = document.getElementById('languageAbility').value;
    
    chrome.storage.local.set({
      openaiApiKey: apiKey,
      language: language,
      languageResponse: languageResponse,
      languageAbility: languageAbility
    }, function() {
      console.log('Settings saved');
      // Optionally, show a "saved" message to the user
      alert('Settings saved successfully!');
    });
  });
});