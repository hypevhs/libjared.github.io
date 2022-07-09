---
layout: post
title: 3D Model Extractor
tags: python
date: 2015/04/16 22:50:46
---

I used existing software to recreate models based on OpenGL call dumps.

{% include figure.html
  image="/assets/img/modelrip0.png"
  caption="The model in Blender."
%}

<!--more-->

As I became interested in 3D graphics, I was able to convert a Python pickle'd object containing OpenGL draw calls to a 3D model. The intent was to extract 3D models from any running program. This program is evidence I can make a converter from one complex data structure/file format to another.

This is an application that creates [Wavefront OBJ models](http://en.wikipedia.org/wiki/Wavefront_.obj_file) from the output of the fantastic [apitrace project on GitHub](https://github.com/apitrace/apitrace/).

The extractor is in the form of a Python script. Through the use of the extremely simple OBJ format, I can turn a list of OpenGL calls into a list of vertex and face declarations.

I wanted to have a 3D scene to practice 3D programming with, so I chose to use a level from one of my favorite video games: Click Clock Wood from Banjo-Kazooie for the Nintendo 64. However, I couldn't find the model for download anywhere, nor could I find any existing software to make 3D models from a running program. I decided to produce it myself.

This screenshot shows Click Clock Wood, rendered in [Blender](http://www.blender.org/), without textures, and with a single light added.
