---
layout: post
title: Terrain in the Terminal
tags: c89
date: 2015/05/28 13:00:09
---

I used the diamond-square algorithm to generate a heightmap, then used ncurses to display it in the terminal with colors and varying-intensity ASCII characters.

{% include figure.html
  image="/assets/img/termterrain.png"
  caption="A top-down view of a sandy beach."
%}

<!--more-->

The diamond-square algorithm basically takes a 2D array and subdivides it, generating random points as it goes deeper. The end result is the 2D array being filled with values in the range 0.0 to 1.0 in what looks like terrain.

ncurses is a library that allows terminal windows to be canvases for drawing with characters. I use it here to place colored characters onto the window.

Each value in the range 0.0 to 1.0 maps to a character. If you've seen ASCII art, you'll know that characters with more weight like `#` are used for darker areas and `.` for lighter. I googled and tweaked, and eventually came up with a nice gradient, from light to dark:

``.'`^",:;Il!i><~+-][}{1)(|\/tfjrxnuvczmwqpdbkhaoXYUJCLQ0OZMW&8%B@$#``

This depends on the font used, but it's generally the same throughout. I turn each value into a character, then plot it with a color:

* High up, white mountaintops
* Green grass
* Sand beaches
* Light blue coast
* Lowest, dark blue deep sea

[Try it for yourself.](//github.com/libjared/term-terrain) It is written in C.
