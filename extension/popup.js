document.addEventListener('DOMContentLoaded', function () {
  const ext = typeof browser !== 'undefined' ? browser : chrome;
  const isBrowserAPI = typeof browser !== 'undefined';

  function queryActiveTab() {
    return new Promise(resolve => {
      if (isBrowserAPI) {
        ext.tabs.query({active: true, currentWindow: true}).then(resolve);
      } else {
        ext.tabs.query({active: true, currentWindow: true}, resolve);
      }
    });
  }

  function sendMessage(tabId, msg) {
    return new Promise((resolve, reject) => {
      if (isBrowserAPI) {
        ext.tabs.sendMessage(tabId, msg).then(resolve, reject);
      } else {
        ext.tabs.sendMessage(tabId, msg, response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      }
    });
  }

  queryActiveTab().then(tabs => {
    if (!tabs.length) return;
    const tab = tabs[0];
    sendMessage(tab.id, {action: 'getTranscript'}).then(response => {
      const textarea = document.getElementById('transcript');
      if (response && response.transcript) {
        textarea.value = response.transcript;
      } else {
        textarea.value = 'No transcript found. Ensure the transcript pane is enabled.';
      }
    }).catch(() => {
      document.getElementById('transcript').value = 'No transcript found. Ensure the transcript pane is enabled.';
    });
  });
});
