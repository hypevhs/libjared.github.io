---
layout: post
title: SFML Shader
tags: csharp
date: 2015/04/16 22:38:13
---

I made a demonstration of OpenGL's fragment shader with SMFL.NET.

{% include figure.html
  video_basename="sfmlshader"
  caption="The shader in action."
%}

<!--more-->

OpenGL's fragment shader language allows developers to define complex per-pixel visual calculations for execution on the GPU. I read up on it and produced some interesting graphical effects.

Calculating the colors for pixels on a screen can be [embarrassingly parallel](http://en.wikipedia.org/wiki/Embarrassingly_parallel). Fragment shaders is a manifestation of that idea, where each pixel is sent through a function modifying its color before displaying it onscreen. The only textures in this project are black-and-white outlines of the individual letters. Every other color was defined as a function of screen coordinates, using [GLSL](https://www.google.com/search?q=glsl&tbm=isch). This project was developed using SFML.NET, a graphics library that sits on top of OpenGL.


