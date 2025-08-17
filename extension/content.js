'use strict';

(function() {
  const chapterTranscripts = {};
  let currentChapter = '';
  const MAX_CHAPTERS = 50;
  const MAX_TRANSCRIPT_LENGTH = 10000;

  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  function getCurrentChapterName() {
    const current = document.querySelector('li[class*="curriculum-item-link--is-current"]');
    if (!current) {
      return null;
    }
    const text = current.textContent.trim();
    return text.replace(/^(Play|Stop)\s*/i, '').trim();
  }

  function captureTranscript() {
    const chapterName = getCurrentChapterName();
    let transcript = getTranscriptText();
    if (chapterName && transcript) {
      currentChapter = chapterName;
      if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
        transcript = transcript.slice(0, MAX_TRANSCRIPT_LENGTH);
      }
      if (chapterTranscripts[chapterName] !== undefined) {
        delete chapterTranscripts[chapterName];
      } else if (Object.keys(chapterTranscripts).length >= MAX_CHAPTERS) {
        const oldest = Object.keys(chapterTranscripts)[0];
        delete chapterTranscripts[oldest];
      }
      chapterTranscripts[chapterName] = transcript;
    }
  }

  // Poll for transcript updates only when transcript pane is present
  setInterval(() => {
    if (document.querySelector('span[data-purpose="cue-text"]')) {
      captureTranscript();
    }
  }, 2000);

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Validate messages from this extension and ensure we're on a Udemy page.
    const pageHost = window.location.hostname;
    const isUdemyDomain = pageHost === 'udemy.com' || pageHost.endsWith('.udemy.com');

    if (sender.id !== browser.runtime.id || !isUdemyDomain) {
      return;
    }

    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
    if (msg.action === 'getTranscriptData') {
      captureTranscript();
      sendResponse({ currentChapter, transcripts: chapterTranscripts });
    }
  });
})();
