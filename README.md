# Sense-Scriptable
Display your Sense usage plot in a Scriptable Widget! (iOS 14+)

<img src="../assets/dark_hero.jpeg" height="300">  <img src="../assets/light_hero.jpeg" height="300">

## Description
Sense-Scriptable is a script for the [Scriptable app](https://scriptable.app) that generates a medium-sized widget for use on your iOS homescreen, and displays your energy usage as reported by Sense for the prior hour/day/week/month/year.

Sense-Scriptable uses the unofficial Sense API to pull data using your account credentials, and will be updated automatically by iOS (when the widget is refreshed). Both a light mode and a dark mode style are provided, although unfortunately Scriptable/iOS doesn't support switching automatically at this time.

## Setup and Configuration
1. First, install the [Scriptable app](https://scriptable.app) if you don't have it already!
2. In Scriptable, add a new, empty script in Scriptable by tapping the "plus" icon:

   <img src="../assets/scriptable.jpeg" width="350">
3. Copy the contents of [Sense Widget.js](https://github.com/cbpowell/Sense-Scriptable/blob/main/Sense%20Widget.js) into the new, empty script.
4. Enter your Sense credentials (email and password), the range of data you'd like to display (`HOUR`, `DAY`, `WEEK`, `MONTH`, `YEAR`), and whether or not to use dark mode style (`true` or `false`).

   <img src="../assets/config_script.jpeg" width="350">
5. Feel free to customize the script details, like the name and icon - I use "Sense Widget" with a lightning bolt icon, naturally.
6. Tap Done to save the script.
7. On your iOS home screen, enter jiggle mode and tap the "plus" icon in the top left to add a widget.
8. Search for Scriptable, and add a "medium" widget (a 2x1 size):

   <img src="../assets/add_widget.jpeg" width="350">
9. If still in jiggle mode, tap on the new widget to configure it, or long press on it and select "Edit Widget".
10. Select your "Sense Widget" (or whatever you named it) as the script to run for the widget, change the When Interfacing option to "Open URL", and enter `sense://` in the URL field (this will open Sense when you tap on the widget):
   
    <img src="../assets/config_widget.jpeg" width="350">
11. Complete!

## Notes
- Sense-Scriptable will save a file called "SenseAuth.json" in the Scriptable folder of your iCloud Drive. This saves your authentication token to avoid hammering the Sense authentication server every time the widget refreshes. This file does have your unencrypted API token, so make sure your iCloud Drive is secure (presumably it is, by default). That said...
- Currently, **your Sense username and password will be stored in plaintext** in the Scriptable app, and your iCloud Drive. Consider that security implication accordingly! Scriptable does support set/get to the iOS Keychain, so I'll work on implementing that (noting that any Scriptable app could still retreive from the Keychain).

- The API method used doesn't typically grab the _most_ up-to-date usage data. For example, when using an `HOUR` range the most recent ~15 minutes can be missing. Presumably that's because this data is filled in by the Websockets part of the API, which isn't supported in Scriptable. To account for this, an extra 15 minutes is requested when using the `HOUR` range. iOS doesn't update widgets all that frequently anyway!

## Shortcuts
Scriptable also lets a script export certain data when run from the iOS Shortcuts app. Sense-Scriptable exports the retreived, reduced plot data points, start time, and end time when run as part of a Shortcut. This helps with the data reduction - from experience, I can say that Shortcuts doesn't _love_ directly manipulating JSON with 3,000+ data points.

## Future Improvement Ideas
1. Improve credentials storage.
1. Time-scheduled light/dark mode switching, as an alternative to switching in sync with the device.
3. Verify average of provided totals is the correct value to use.
4. Add support for solar production - going to need some help here on what data the API provides!
