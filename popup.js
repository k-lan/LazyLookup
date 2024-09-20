document.addEventListener('DOMContentLoaded', function() {
  const settingsIcon = document.getElementById('settings-icon');
  const optionsPanel = document.getElementById('options-panel');
  const quickSaveButton = document.getElementById('quick-save');

  // Load saved settings
  chrome.storage.local.get(['language', 'languageResponse', 'languageAbility'], function(result) {
    if (result.language) {
      document.getElementById('quick-language').value = result.language;
    }
    if (result.languageResponse) {
      document.getElementById('quick-languageResponse').value = result.languageResponse;
    }
    if (result.languageAbility) {
      document.getElementById('quick-languageAbility').value = result.languageAbility;
    }
  });

  // Toggle options panel
  settingsIcon.addEventListener('click', function() {
    if (optionsPanel.style.display === 'none') {
      optionsPanel.style.display = 'block';
    } else {
      optionsPanel.style.display = 'none';
    }
  });

  // Save quick settings
  quickSaveButton.addEventListener('click', function() {
    var language = document.getElementById('quick-language').value;
    var languageResponse = document.getElementById('quick-languageResponse').value;
    var languageAbility = document.getElementById('quick-languageAbility').value;
    
    chrome.storage.local.set({
      language: language,
      languageResponse: languageResponse,
      languageAbility: languageAbility
    }, function() {
      console.log('Quick settings saved');
      // Optionally, show a "saved" message to the user
      alert('Settings saved successfully!');
    });
  });
});