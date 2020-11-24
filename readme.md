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
OpenSCAD creates very simple SVGs just using `path` elements.

SVG however supports [more primitives](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Basic_Shapes) than just `path`. Other primitives, like `line`, `circle`, `polyline`, `rect` etc. are not supported. The main reason for this is that all of these primitives can also be expressed as `path` - which is the most powerful primitive in SVG.

Converting SVGs using Inkscape
------------------------------
As mentioned, the SVGs are required to use `path` elements to be properly imported. If your imported SVG is missing some parts or you get the message "No path-Tags found 😕" you may need to convert it.

An easy way is by using the free software [Inkscape](https://inkscape.org/) and opening your SVG with it. After that, select all elements of your Drawing (`CTRL`+`A`) - or just those missing after import - and convert them to paths using **Path** -> **Object to Path** or **Stroke to Path** (depends on your drawing, try it). Then just save it as a new file.

<img src="images/inkscape-path-menu.png" alt="Inkscape Path-Menu" />

**Path** -> **Union** or **Simplify** may also help reducing complexity if you have an SVG with lots of overlapping shapes.

If you still have issues importing an SVG, feel free to open an issue.