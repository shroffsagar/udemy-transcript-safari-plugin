'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const chapterList = document.getElementById('chapters');
  const textarea = document.getElementById('transcript');
  let transcripts = {};

  function selectChapter(chapter) {
    textarea.value = transcripts[chapter] || '';
    [...chapterList.children].forEach(li => {
      li.classList.toggle('active', li.dataset.chapter === chapter);
    });
  }

  function renderChapters(current) {
    chapterList.innerHTML = '';
    const chapters = Object.keys(transcripts);
    chapters.forEach(chapter => {
      const li = document.createElement('li');
      li.textContent = chapter;
      li.dataset.chapter = chapter;
      if (chapter === current) {
        li.classList.add('active');
      }
      li.addEventListener('click', () => selectChapter(chapter));
      chapterList.appendChild(li);
    });

    const defaultChapter = current && transcripts[current] ? current : chapters[0];
    if (defaultChapter) {
      selectChapter(defaultChapter);
    } else {
      textarea.value = 'No transcripts recorded. Open the transcript pane on Udemy to start recording.';
    }
  }

  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    if (!tabs.length) return;
    const tab = tabs[0];
    try {
      const hostname = new URL(tab.url).hostname;
      if (hostname.endsWith('.udemy.com')) {
        browser.tabs.sendMessage(tab.id, {action: 'getTranscriptData'}).then(response => {
          if (response && response.transcripts) {
            transcripts = response.transcripts;
            renderChapters(response.currentChapter);
          } else {
            textarea.value = 'No transcripts recorded. Open the transcript pane on Udemy to start recording.';
          }
        }).catch(() => {
          textarea.value = 'No transcripts recorded. Open the transcript pane on Udemy to start recording.';
        });
      } else {
        textarea.value = 'This extension only works on Udemy course pages.';
      }
    } catch (e) {
      textarea.value = 'This extension only works on Udemy course pages.';
    }
  });
});

