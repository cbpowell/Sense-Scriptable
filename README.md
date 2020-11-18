# Sense-Scriptable
Display your Sense usage plot in a Scriptable Widget! (iOS 14+)

<img src="../assets/dark_hero.jpeg" height="300">  <img src="../assets/light_hero.jpeg" height="300">

## Description
Sense-Scriptable is a script for the [Scriptable app](https://scriptable.app) that generates a medium-sized widget for use on your iOS homescreen, and displays your energy usage as reported by Sense for the prior hour/day/week/month/year.

Sense-Scriptable uses the unofficial Sense API to pull power usage data, and will be updated automatically by iOS (when the widget is refreshed). Both a light mode and a dark mode style are provided, although unfortunately Scriptable/iOS doesn't support switching automatically at this time.

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
12. Be sure to note the instructions at the beginning of the script, to clear your plaintext username and password from the script (see note below).

## Notes
- Your Sense login info will be stored in the iOS Keychain via Scriptable, so no info is directly stored as plaintext. Be sure to clear the plaintext variables after you initial successful login. However note that there isn't any 'authentication' to get into Scriptable, to prevent someone from using the right script to pull those details out!
- The API method used doesn't typically grab the _most_ up-to-date usage data. For example, when using an `HOUR` range the most recent ~15 minutes can be missing. Presumably that's because this data is filled in by the Websockets part of the API, which isn't supported in Scriptable. To account for this, an extra 15 minutes is requested when using the `HOUR` range. iOS doesn't update widgets all that frequently anyway!

## Shortcuts
Scriptable also lets a script export certain data when run from the iOS Shortcuts app. Sense-Scriptable exports the retreived, reduced plot data points, start time, and end time when run as part of a Shortcut. This helps with the data reduction - from experience, I can say that Shortcuts doesn't _love_ directly manipulating JSON with 3,000+ data points.

## Future Improvement Ideas
1. Time-scheduled light/dark mode switching, as an alternative to switching in sync with the device.
2. Verify average of provided totals is the correct value to use.
3. Add support for solar production - going to need some help here on what data the API provides!
