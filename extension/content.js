(function() {
  const ext = typeof browser !== 'undefined' ? browser : chrome;

  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  ext.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
  });
})();
