'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const chapterList = document.getElementById('chapters');
  const textarea = document.getElementById('transcript');
  const downloadBtn = document.getElementById('downloadAll');
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

  function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9_\- ]/gi, '_');
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  function createZip(files) {
    const encoder = new TextEncoder();
    const fileEntries = [];
    const centralEntries = [];
    let offset = 0;

    for (const [name, text] of Object.entries(files)) {
      const data = encoder.encode(text);
      const crc = crc32(data);
      const size = data.length;
      const nameBytes = encoder.encode(name);

      const localHeader = new Uint8Array(30 + nameBytes.length);
      const lh = new DataView(localHeader.buffer);
      lh.setUint32(0, 0x04034b50, true);
      lh.setUint16(4, 20, true);
      lh.setUint16(6, 0, true);
      lh.setUint16(8, 0, true);
      lh.setUint16(10, 0, true);
      lh.setUint16(12, 0, true);
      lh.setUint32(14, crc, true);
      lh.setUint32(18, size, true);
      lh.setUint32(22, size, true);
      lh.setUint16(26, nameBytes.length, true);
      lh.setUint16(28, 0, true);
      localHeader.set(nameBytes, 30);

      const fileRecord = new Uint8Array(localHeader.length + data.length);
      fileRecord.set(localHeader, 0);
      fileRecord.set(data, localHeader.length);
      fileEntries.push(fileRecord);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const ch = new DataView(centralHeader.buffer);
      ch.setUint32(0, 0x02014b50, true);
      ch.setUint16(4, 0, true);
      ch.setUint16(6, 20, true);
      ch.setUint16(8, 0, true);
      ch.setUint16(10, 0, true);
      ch.setUint16(12, 0, true);
      ch.setUint32(16, crc, true);
      ch.setUint32(20, size, true);
      ch.setUint32(24, size, true);
      ch.setUint16(28, nameBytes.length, true);
      ch.setUint16(30, 0, true);
      ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true);
      ch.setUint16(36, 0, true);
      ch.setUint32(38, 0, true);
      ch.setUint32(42, offset, true);
      centralHeader.set(nameBytes, 46);
      centralEntries.push(centralHeader);

      offset += fileRecord.length;
    }

    const centralSize = centralEntries.reduce((sum, arr) => sum + arr.length, 0);
    const out = new Uint8Array(offset + centralSize + 22);
    let pointer = 0;
    fileEntries.forEach(entry => { out.set(entry, pointer); pointer += entry.length; });
    centralEntries.forEach(entry => { out.set(entry, pointer); pointer += entry.length; });

    const dv = new DataView(out.buffer, pointer, 22);
    dv.setUint32(0, 0x06054b50, true);
    dv.setUint16(4, 0, true);
    dv.setUint16(6, 0, true);
    dv.setUint16(8, centralEntries.length, true);
    dv.setUint16(10, centralEntries.length, true);
    dv.setUint32(12, centralSize, true);
    dv.setUint32(16, offset, true);
    dv.setUint16(20, 0, true);

    return out;
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    if (browser.downloads && browser.downloads.download) {
      browser.downloads.download({ url, filename, saveAs: true })
        .then(() => URL.revokeObjectURL(url), () => URL.revokeObjectURL(url));
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  function downloadAll() {
    if (!Object.keys(transcripts).length) return;
    const files = {};
    for (const [chapter, text] of Object.entries(transcripts)) {
      const filename = sanitizeFilename(chapter) + '.txt';
      files[filename] = text;
    }
    const zipBytes = createZip(files);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    triggerDownload(blob, 'transcripts.zip');
  }

  downloadBtn.addEventListener('click', downloadAll);

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

