(function() {
  const ext = typeof browser !== 'undefined' ? browser : chrome;

  function parseVtt(text) {
    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line &&
        !line.startsWith('WEBVTT') &&
        !/^\d+$/.test(line) &&
        !/^\d{2}:\d{2}:\d{2}/.test(line))
      .join('\n');
  }

  async function getTranscriptText() {
    // Prefer cues from the video's track element if available
    const video = document.querySelector('video');
    if (video) {
      const track = video.querySelector('track[kind="subtitles"], track[kind="captions"]');
      if (track) {
        if (track.track && track.track.cues && track.track.cues.length) {
          const cues = Array.from(track.track.cues).map(cue => cue.text.trim());
          if (cues.length) {
            return cues.join('\n');
          }
        }
        if (track.src) {
          try {
            const res = await fetch(track.src);
            if (res.ok) {
              return parseVtt(await res.text());
            }
          } catch (_) { /* ignore */ }
        }
      }
    }

    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"], p[data-purpose="transcript-cue"] span');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  ext.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getTranscript') {
      getTranscriptText().then(text => {
        sendResponse({ transcript: text });
      });
      return true;
    }
  });
})();
