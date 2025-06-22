(function() {
  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
  });
})();
