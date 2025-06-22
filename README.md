# udemy-transcript-safari-plugin

This repository contains a small Safari Web Extension that shows the
transcript of the currently viewed Udemy video in a popup window.
You can manually copy the transcript from the popup.

## Installing in Safari

1. Open **Safari** and enable the *Develop* menu (Preferences → Advanced →
   *Show Develop menu in menu bar*).
2. Choose **Develop → Show Web Extension Background Page…** and load the
   `extension` folder from this repository.

3. In Safari Extension settings, allow the extension on `udemy.com` and set "When visiting other websites" to Deny.
4. While watching a Udemy course video, click the extension icon. A popup will
   appear containing the transcript text which you can select and copy. If the
   popup reports that no transcript was found, make sure the transcript pane is
   visible on the Udemy page.

The extension relies solely on the files in the `extension` directory and does
not require any build steps. All styles are bundled locally so the popup works
offline without fetching remote resources. The popup window includes custom
styling for a wider layout and cleaner appearance. Simply load the folder in Safari as described above. If you want to create a distributable Safari app extension,
run `xcrun safari-web-extension-converter` on macOS and open the generated
Xcode project.
