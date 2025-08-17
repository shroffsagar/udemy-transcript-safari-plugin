(function() {
  const chapterTranscripts = {};
  let currentChapter = '';

  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  function getCurrentChapterName() {
    const current = document.querySelector('li[class*="curriculum-item-link--is-current"]');
    return current ? current.textContent.trim() : null;
  }

  function captureTranscript() {
    const chapterName = getCurrentChapterName();
    const transcript = getTranscriptText();
    if (chapterName && transcript) {
      currentChapter = chapterName;
      if (chapterTranscripts[chapterName] !== transcript) {
        chapterTranscripts[chapterName] = transcript;
      }
    }
  }

  // Poll for transcript updates only when transcript pane is present
  setInterval(() => {
    if (document.querySelector('span[data-purpose="cue-text"]')) {
      captureTranscript();
    }
  }, 2000);

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const senderHost = sender.url ? new URL(sender.url).hostname : '';
    const isUdemyDomain = senderHost === 'udemy.com' || senderHost.endsWith('.udemy.com');

    if (sender.id !== browser.runtime.id || !isUdemyDomain) {
      return;
    }

    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
    if (msg.action === 'getTranscriptData') {
      sendResponse({ currentChapter, transcripts: chapterTranscripts });
    }
  });
})();
