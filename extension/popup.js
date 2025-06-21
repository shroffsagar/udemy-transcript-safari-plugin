document.addEventListener('DOMContentLoaded', function () {
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    if (!tabs.length) return;
    const tab = tabs[0];
    browser.tabs.sendMessage(tab.id, {action: 'getTranscript'}).then(response => {
      const textarea = document.getElementById('transcript');
      if (response && response.transcript) {
        textarea.value = response.transcript;
      } else {
        textarea.value = 'Transcript not found.';
      }
    }).catch(() => {
      document.getElementById('transcript').value = 'Transcript not found.';
    });
  });
});
