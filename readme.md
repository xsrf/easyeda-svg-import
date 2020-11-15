SVG Import Script for EasyEDA (WIP)
===================================
This is me trying to write a script / extension for [EasyEDA](https://easyeda.com/editor) that can import SVG files / paths into EasyEDA without any distorions or restrictions that the original SVG/Image import has.

*This is work in progress and not at all finished or polished!*

Installation
------------
Clone or Download this repository. Then in [EasyEDA](https://easyeda.com/editor) go to "Advanced" -> "Extensions" -> "Extensions Setting" -> "Load Extension..." -> "Select Files..." and select all files from the `extension` directory of this repository.

<img src="images/step1.png" alt="Extension Setting...">

*Extension Setting...*

<img src="images/step2.png" alt="Load Extension, Select Files...">

*Load Extension, Select Files...*

<img src="images/step3.png" alt="Select all files from extension">

*Select all files from "extension"*

<img src="images/step4.png" alt="Load Extension">

*Load Extension*

<img src="images/step5.png" alt="Extension List">

*Extension should show up in extension list, click Cancel*

**Be warned! This may corrupt your Project! Have a backup!** 

Usage
-----

<img src="images/step6.png" alt="Extension List">

*SVG Import* Menu

<img src="images/dialog.png" alt="Extension List">

*Main Import Dialog*

Issues
------
To be fair, I wrote this for a single usecase: Importing procedurally generated SVGs from [OpenSCAD](https://www.openscad.org/) into EasyEDA. And it works fine.