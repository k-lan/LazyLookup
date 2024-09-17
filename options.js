document.getElementById('save').addEventListener('click', function() {
  var apiKey = document.getElementById('apiKey').value;
  chrome.storage.local.set({openaiApiKey: apiKey}, function() {
    console.log('API key saved');
  });
});

// Load saved API key when options page is opened
chrome.storage.local.get(['openaiApiKey'], function(result) {
  if (result.openaiApiKey) {
    document.getElementById('apiKey').value = result.openaiApiKey;
  }
});