# Give me five

Use Lateral to recommend content that is relevant to the page you're currently seeing in Chrome. Example of configuring the extension and getting recommendations:

![Example of configuring the extension and getting recommendations](https://i.imgur.com/Y5e6mOg.gif)  

## Overview

You'll need a Lateral API key with documents added to it, see [our documentation](https://lateral.io/docs/api#adding-documents) for information about how to do that. Once you have that, you can either hard-code your key into the extension and recompile or you can use our precompiled extension that allows you to add a key through the extension itself.

#### Installing

Download the extension [here](give-me-five.crx?raw=true). Visit chrome://extensions/ and drag the downloaded `give-me-five.crx` file to the window and drop it to install. 

#### Configuration

If you're using the version of the extension available from this repository then you will need to add your Subscription Key in order to get recommendations. Click the extension icon (a blue Lateral logo towards the top right of your Chrome browser window) to open the extension window. Click 'Settings' to enter the settings menu. Enter your subscription key where it says 'key' and then click 'Save'. 

#### Get recommendations

Firstly visit the web page you want to get recommendations for in Chrome. Now click the extension icon that sits towards the top right of the Chrome browser window. From here click 'Give me 5' to get recommendations. Alternatively, you can use the keyboard shortcut which is Command (or Ctrl) + Shift + 9. The first time it will ask for extended permissions.

## Customisation

The purpose of open-sourcing this extension is so that you can easily create your own version of the extension. 

#### Development

The main code that powers the extension is under the `src` folder. The javascript and scss are processed as you work by gulp so ensure that gulp is running by running:

```bash
gulp 
```

From the `give-me-five` directory. This will automatically process all files into the `extension` folder. During development you may find it easiest to drag the entire `extension` directory into the [chrome://extensions/](chrome://extensions/) page. This means that you won't need to recompile the extension after every change.

#### To 'bake' your own key in to the extension

If you don't want to have the ability to set the subscription key from within the extension then you can hard-code the key to the extension. Note: please be careful to use a read-only key here otherwise people could potentially delete your data. To set the key, edit the `src/scripts/config.js` file and change the line:

```json
key: null,
```

to:

```json
key: 'your_key_goes_here',
```

Now you will need to re-compile the .crx and install the extension.

#### To create a .crx

To compile a .crx for adding to Chrome you can run:

```bash
gulp release --release
```
