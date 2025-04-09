# README

## 13th Age CharGen, a character builder / sheet based on the 13th age TTRPG

![Screenshot of a completed character](https://github.com/Xenrathe/React-FormGen/blob/main/XenratheBard.png?raw=true)

The 13th Age CharGen is a form for creating or storing a character (i.e. a 'character sheet') for the table-top RPG 13th age. Unlike most character sheets, it has access to the underlying data, allowing players to view skill and ability information in the form itself, as opposed to referring to another source (book, wiki). Additionally, the form can be printed with all the ability info attached, allowing for a nice little packet for players to bring to the table, with all their information in one place!

13th Age CharGen is active on GitHub pages: (???)

### Features:

- Access to the Core-book SRD data (in the form of JSON data)
- Simple to use, belying the complex data and relationships underneath
- Enabling Print Ability Info will include ability & talent cards when printed
- Save/Load characters in simple JSON data format
- Responsive design for mobile, tablet, and desktop
- Support for dark mode

![Screenshot of mobile](https://github.com/Xenrathe/React-FormGen/blob/main/Mobile.png?raw=true)

### Tech Stack:

- CSS: Vanilla
- JS: React
- Backend: N/A - no database
- Other: Packery to condense the printed ability cards; vite-svgr to easily import svgs

![Screenshot of printed abilities](https://github.com/Xenrathe/React-FormGen/blob/main/PrintScreen.png?raw=true)

### To-do List Before Deployment

- mobile scrolling while modal is up, esp full-screen (e.g. gather power)
- make x, +, i buttons a little bigger and spread out for mobile

### Future To-do List

- improved icon relations (dropdown for hostile / neutral / favorable?) or an image pop-up selector; integrate w/ icon-based talents
- additional error checking (not enough bonus options chosen, error on all things with feats when feat counts off, etc)
- SpellInfo dynamically updates depending on level (big change in dataset, I think?)
- AbilitiesBlock sub-blocks borrows space from other sub-blocks to maintain formatting
- clean up printing / don't break cards in half?
- SorcererFamiliar has permanent / random button
- Magical item info (a button to include bonuses from item types, e.g. +2 on weapon is included in ATK roll)
- Include other classes and their ability info?
- Update for second edition?
- A guided step-by-step character creator process (see Lancer's COMP/CON app)?

![Screenshot of add talents modal in dark mode](https://github.com/Xenrathe/React-FormGen/blob/main/AddTalents.png?raw=true)

### Design Brief

This project was created as part of The Odin Project curriculum, expanding on the <a href="https://www.theodinproject.com/lessons/react-new-cv-application">React: CV Application</a> project.

### Attribution

- The 13th Age TTRPG system is published by <a href="https://pelgranepress.com/13th-age/" target="_blank" title="Pelgrane Press">Pelgrane Press</a>
