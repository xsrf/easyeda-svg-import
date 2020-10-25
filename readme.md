SVG Import Script for EasyEDA (WIP)
===================================
This is me trying to write a script / extension for EasyEDA that can import SVG files / paths into EasyEDA without any distorions or restrictions that the original SVG import has.

*This is work in progress and not at all finished or polished!*

TL;DR
-----
In EasyEDA go to "Advanced" -> "Extensions" -> "Run Script ..." and paste the contents of `svgimport.js` or save the script permanently in "Advanced" -> "Extensions" -> "Load Script ...".

**Be warned! This may corrupt your Project! Have a backup!** 

How it works (will work)
------------------------
I've basically reverse enginered the EasyEDA file format (because the documentation and API suck!) and found that almost all shapes in EasyEDA already use kind of svg format internally. So converting svg to EasyEDA is simple, but has some restrictions. Not all svg sommands are supported.