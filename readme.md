SVG Import Script for EasyEDA (WIP)
===================================
This is me trying to write a script / extension for [EasyEDA](https://easyeda.com/editor) that can import SVG files / paths into EasyEDA without any distorions or restrictions that the original SVG import has.

*This is work in progress and not at all finished or polished!*

TL;DR
-----
In [EasyEDA](https://easyeda.com/editor) go to "Advanced" -> "Extensions" -> "Run Script ..." and paste the contents of `svgimport.js` or save the script permanently in "Advanced" -> "Extensions" -> "Load Script ...".

**Be warned! This may corrupt your Project! Have a backup!** 

How it's done
-------------
I've basically reverse engineered the EasyEDA file format (because the documentation and API suck!) and found that almost all shapes in EasyEDA already use kind of svg format internally. So converting svg to EasyEDA is not that hard, but has some restrictions. Not all svg sommands are supported and not all shape-types support intersecting paths or multiple paths.
Also, only `path`-Nodes are supported. No `circle`, `rect` etc... But I guess most tools create path nodes anyways.

To be fair, I wrote this for a single usecase: Importing procedurally generated SVGs from [OpenSCAD](https://www.openscad.org/) into EasyEDA. And it works fine.