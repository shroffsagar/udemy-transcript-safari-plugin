(function() {
  const COURSE_ID = location.pathname.split('/')[2] || 'course';
  let lastChapter = null;
  let uiRendered = false;

  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    const lines = Array.from(cueSpans).map(span => span.textContent.trim());
    return lines.join('\n');
  }

  function getCurrentChapterName() {
    const current = document.querySelector('li[class*="curriculum-item-link--is-current"]');
    return current ? current.textContent.trim() : null;
  }

  function isTranscriptVisible() {
    const pane = document.querySelector('div[data-purpose="transcript"]');
    return !!(pane && pane.offsetParent !== null);
  }

  async function recordCurrentTranscript() {
    const pane = document.querySelector('div[data-purpose="transcript"]');
    const chapter = getCurrentChapterName();
    if (!pane || !chapter) return;

    const transcript = getTranscriptText();
    if (!transcript) return;

    const store = await browser.storage.local.get('transcripts');
    const transcripts = store.transcripts || {};
    if (!transcripts[COURSE_ID]) transcripts[COURSE_ID] = {};
    transcripts[COURSE_ID][chapter] = transcript;
    await browser.storage.local.set({ transcripts });
    renderUI(transcripts[COURSE_ID], chapter);
    uiRendered = true;
  }

  function renderUI(courseTranscripts, selectedChapter) {
    const pane = document.querySelector('div[data-purpose="transcript"]');
    if (!pane) return;

    let container = document.getElementById('udemy-transcript-plugin');
    if (!container) {
      container = document.createElement('div');
      container.id = 'udemy-transcript-plugin';
      container.style.display = 'flex';
      container.style.height = '100%';
      pane.innerHTML = '';
      pane.appendChild(container);
    }
    container.innerHTML = '';

    const sidebar = document.createElement('div');
    sidebar.style.width = '200px';
    sidebar.style.overflowY = 'auto';
    sidebar.style.borderRight = '1px solid #ddd';

    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    list.style.margin = '0';

    Object.keys(courseTranscripts).forEach(chapter => {
      const item = document.createElement('li');
      item.textContent = chapter;
      item.style.padding = '8px';
      item.style.cursor = 'pointer';
      if (chapter === selectedChapter) {
        item.style.fontWeight = 'bold';
      }
      item.addEventListener('click', () => renderUI(courseTranscripts, chapter));
      list.appendChild(item);
    });
    sidebar.appendChild(list);

    const content = document.createElement('div');
    content.style.flex = '1';
    content.style.padding = '8px';
    content.style.whiteSpace = 'pre-wrap';
    content.textContent = courseTranscripts[selectedChapter] || '';

    container.appendChild(sidebar);
    container.appendChild(content);
  }

  const observer = new MutationObserver(() => {
    const visible = isTranscriptVisible();
    const chapter = getCurrentChapterName();

    if (visible) {
      if (chapter && chapter !== lastChapter) {
        lastChapter = chapter;
        recordCurrentTranscript();
      } else if (!uiRendered) {
        recordCurrentTranscript();
      }
    } else {
      uiRendered = false;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
  });
})();

