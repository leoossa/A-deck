# A-deck
Chrome extension for A-(dding websites to Nextcloud) Deck

[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen?style=for-the-badge)](https://plant.treeware.earth/leoossa/A-deck)

Basically it sends any webpage to your Nextcloud Deck by creating a card. 
Here's the option page:

![options screenshot](https://raw.githubusercontent.com/leoossa/A-deck/master/screenshots/options.png)

Here's the popup with boards fetched from Nextcloud server (you can select which board and stack is default for sending pages)

![popup screenshot](https://raw.githubusercontent.com/leoossa/A-deck/master/screenshots/popup.png)

The popup loads boards from server, also loads all the stacks and saves them. It uses boards color as background color. 

![options screenshot](https://raw.githubusercontent.com/leoossa/A-deck/master/screenshots/screenshot.png)

Currently in development:
- Adding to Web Archive in order not to have problems with vanishing websites
- better styling (including UI/UX and console log messages)
- Context menu (currently it's just an icon) -  allow user to send page to different boards and stacks directly from context menu
- Taking screenshots of website and including it as a attachment in card

Ideas for further development:
- rules for specific domains (query selectors), that user can save in options and use them to fill card data sent to server (ie. instead of sending url and title user may input rulese to create card with 'h1' as title and 'p' as a description)
- domain based rules / global rules
- GUI query selector tool (easy for non-technical user)


## Licence            
This package is [Treeware](https://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/leoossa/A-deck) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.
