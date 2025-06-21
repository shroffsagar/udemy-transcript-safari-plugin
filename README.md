# udemy-transcript-safari-plugin

This repository contains a simple Safari Web Extension that lets you copy the
transcript of the currently viewed Udemy video directly to your clipboard.
The extension adds a **Copy Transcript** item to the context menu.

## Installing in Safari

1. Open **Safari** and enable the *Develop* menu (Preferences → Advanced →
   "Show Develop menu in menu bar").
2. Select **Develop → Show Web Extension Background Page…** and load the
   `extension` folder as an unpacked extension.
3. Once loaded, right–click anywhere on a Udemy video page and choose
   **Copy Transcript**. The full transcript text will be copied to your clipboard.

The extension relies purely on JavaScript and does not require any additional
build steps.
