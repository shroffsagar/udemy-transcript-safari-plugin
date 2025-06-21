// Register context menu on installation
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'copy-transcript',
    title: 'Copy Transcript',
    contexts: ['page', 'selection']
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy-transcript') {
    browser.tabs.sendMessage(tab.id, { action: 'copyTranscript' });
  }
});
