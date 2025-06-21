# udemy-transcript-safari-plugin

This repository contains a simple Safari Web Extension that displays the
transcript of the currently viewed Udemy video in a popup window.
Instead of copying to the clipboard automatically, you can manually copy the
transcript from the popup.

## Installing in Safari

1. Open **Safari** and enable the *Develop* menu (Preferences → Advanced →
   "Show Develop menu in menu bar").
2. Select **Develop → Show Web Extension Background Page…** and load the
   `extension` folder as an unpacked extension.
3. Click the extension icon while viewing a Udemy course video. A popup will
   appear containing the full transcript text which you can select and copy.

The extension relies purely on JavaScript and does not require any additional
build steps.
