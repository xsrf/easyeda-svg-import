SVG Import Script for EasyEDA (WIP)
===================================
This is me trying to write a script / extension for [EasyEDA](https://easyeda.com/editor) that can import SVG files / paths into EasyEDA without any distorions or restrictions that the original SVG/Image import has.

*This is work in progress and not at all finished or polished!*

Installation
------------
Clone or Download this repository. Then in [EasyEDA](https://easyeda.com/editor) go to "Advanced" -> "Extensions" -> "Extensions Setting" -> "Load Extension..." -> "Select Files..." and select all files from the `extension` directory of this repository.

<img src="images/EasyEDA-SVG-Install.gif" alt="Extension Installation" />

Usage
-----

**Be warned! This may corrupt your Project! Have a backup!** 

<img src="images/EasyEDA-SVG-Demo.gif" alt="Demo" />

Issues
------
To be fair, I wrote this for a single usecase: Importing procedurally generated SVGs from [OpenSCAD](https://www.openscad.org/) into EasyEDA. And it works fine.