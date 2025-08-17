(function() {
  const api = typeof browser !== 'undefined' ? browser : chrome;
  if (!api) return;

  const COURSE_ID = location.pathname.split('/')[2] || 'course';
  let lastRenderedChapter = null;

  function getCurrentChapterName() {
    const current = document.querySelector('li[class*="curriculum-item-link--is-current"]');
    return current ? current.textContent.trim() : null;
  }

  function getTranscriptText() {
    const cueSpans = document.querySelectorAll('span[data-purpose="cue-text"]');
    return Array.from(cueSpans).map(span => span.textContent.trim()).join('\n');
  }

  function isTranscriptVisible() {
    const pane = document.querySelector('div[data-purpose="transcript"]');
    return pane && pane.offsetParent !== null;
  }

  async function loadCourseTranscripts() {
    const store = await api.storage.local.get('transcripts');
    const transcripts = store.transcripts || {};
    return transcripts[COURSE_ID] || {};
  }

  async function saveCourseTranscripts(courseTranscripts) {
    const store = await api.storage.local.get('transcripts');
    const transcripts = store.transcripts || {};
    transcripts[COURSE_ID] = courseTranscripts;
    await api.storage.local.set({ transcripts });
  }

  async function captureTranscript() {
    if (!isTranscriptVisible()) return;

    const chapter = getCurrentChapterName();
    if (!chapter) return;

    const text = getTranscriptText();
    if (!text) return;

    const courseTranscripts = await loadCourseTranscripts();
    if (courseTranscripts[chapter] !== text) {
      courseTranscripts[chapter] = text;
      await saveCourseTranscripts(courseTranscripts);
    }
    renderUI(courseTranscripts, chapter);
    lastRenderedChapter = chapter;
  }

  async function renderUI(courseTranscripts, selectedChapter) {
    const pane = document.querySelector('div[data-purpose="transcript"]');
    if (!pane) return;

    let container = document.getElementById('udemy-transcript-plugin');
    if (!container) {
      Array.from(pane.children).forEach(child => (child.style.display = 'none'));
      container = document.createElement('div');
      container.id = 'udemy-transcript-plugin';
      container.style.display = 'flex';
      container.style.height = '100%';
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
    if (isTranscriptVisible()) {
      const chapter = getCurrentChapterName();
      if (chapter && chapter !== lastRenderedChapter) {
        captureTranscript();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  api.runtime?.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'getTranscript') {
      sendResponse({ transcript: getTranscriptText() });
    }
  });
})();
