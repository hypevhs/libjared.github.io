---
layout: post
title: Connect Four
tags: js
date: 2015/04/16 23:15:33
---

As a part of Mobile App Development, I made a Connect 4 game in HTML5 (\<canvas\> and JavaScript). The win detection was challenging to implement.

I encourage you to look at the [source code](/assets/js/c4.js). One of the requirements of the project was to make sure only one object (a ConnectFour constructor function) was exposed to the page. Every variable of the game must be located in that function, to prevent cluttering the global scope.

<div class="c4center">
	<div>
		<h3>Kinect Fore</h3>
		<h3 id="c4text">This text should have changed.</h3>
	</div>
	<div>
		<canvas id="c4canv" width=350 height=300>Your browser does not support canvas tags</canvas>
	</div>
</div>
<style>
#c4canv {
    border-style: dashed;
    border-width: 1px;
    width: 90%;
    max-width: 350px;
    height: auto;
    background-color: khaki;
}

.c4textblue {
    color: blue;
}

.c4textred {
    color: red;
}

.c4center {
    text-align: center;
}
</style>
<script src="/assets/js/c4.js"></script>
<script>
	new ConnectFour().ready();
</script>
