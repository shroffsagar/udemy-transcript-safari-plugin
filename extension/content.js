(function() {
  const ext = typeof browser !== 'undefined' ? browser : chrome;

  function getTranscriptText() {
    // Prefer cues from the video's track element if available
    const video = document.querySelector('video');
    if (video) {
      const track = video.querySelector('track[kind="subtitles"], track[kind="captions"]');
      if (track && track.track && track.track.cues && track.track.cues.length) {
        const cues = Array.from(track.track.cues).map(cue => cue.text.trim());
        if (cues.length) {
          return cues.join('\n');
        }
      }
    }

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
