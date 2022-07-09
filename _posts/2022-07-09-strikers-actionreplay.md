---
layout: post
title: Hacking Super Mario Strikers for infinite powerups
tags: reverse-engineering
date: 2022-07-09T15:04:14-05:00
---

{% include figure.html
  image="/assets/img/smstrikers.jpg"
  caption="The final product: utter chaos."
%}

I disassembled PowerPC instructions in Dolphin Emulator in order to make a cheat code. The aim was to make the in-game "infinite power ups" cheat *actually* infinite.

<!--more-->

### Analysis

In Super Mario Strikers, power ups are given in 3 situations:

1. every time the opposing team attacks your player that wasn't dribbling the ball
2. every time your player takes a "cool" shot
3. when the "Infinite power ups" cheat is enabled, every 10 seconds (applies to both teams)

For #2, it's hard to pin down the game's definition of "cool". It can miss the goal, be partially charged, a one-timer shot, from anywhere on the pitch, and it can even smack an opponent nowhere near the goalie. I haven't seen a post-dribble uncharged shot ever count, but it might. I've taken really simple shots that make a goal, yet still don't reward me with an item. I really don't know what it checks for. GameFAQs says "when the goalie makes a big save" but that's wrong.

We want to find the code/memory responsible for #3 and somehow increase its frequency.

Two caveats:
1. The [Strikers AR codes that come with Dolphin](https://github.com/dolphin-emu/dolphin/blob/bb097c0576d4ea847f627b31887399f152e50e12/Data/Sys/GameSettings/G4QE01.ini) don't seem to work for me, so they aren't helpful.
2. Sometimes Dolphin crashes when I use the debugger and/or the Cheat Search. "Unable to resolve read address 804d25cc PC 500" and either the game hard locks ([buzzzzzzz](https://www.youtube.com/watch?v=aw_yenwvRZg)) or Dolphin crashes to desktop.

A good practice in memory editing is to try and guess, if I were the game developer, what are some ways I could implement this feature? And what values must be in memory for each algorithm to operate that way?

We know the powerups are distributed based on some sort of timer. I noticed they always come out when the game clock hits X:X9. That's every 10 seconds. My guess was it issues items when the game clock modulus 10 is roughly equal to 0. But then I noticed that after one team makes a goal, items are distributed when the clock hits X:X3.2 or whatever. Because the timing is different between plays, the game-clock-modulus didn't seem so applicable anymore.

The next idea is to see what memory changes when we toggle the cheat on and off in the cheats menu. There is a decent hunk of memory that consistently changes when we switch it ON/OFF, but that's more than likely related to the menu code, since it offers to "accept changes" when we back out of the menu. Meh.

I turned cheats back on and did more analysis. Items are always distributed to both teams at the same time. Even if one team misses a distribution because they had 2 items already, after making space in both inventories, distributions are still synchronized/simultaneous between the two teams. Also, the 10-second timing is not affected by how long the post-goal cutscene is, even if you skip it; so the item timer counts down only when the ball is in play.

My next guess was that there was a variable that "schedules" an item distribution when the game clock is less than or equal to it. I found a neat variable that decreases by (a large number) once every 10 seconds, resetting every 6 cycles, which strongly suggests some game-clocky logic, but the value was incomprehensible, even as a float. Maybe it was a pointer to the texture used for the game clock's tens place?

My next guess was that there is a variable that counts downwards until it hits some low value, then resets to something repesenting ~10 seconds. I searched for 32-bit signed ints that follow this behavior, and found two results.

0x804b2a70 and 0x804b2b88.

I'll call them "ITEMTIMER0" and "ITEMTIMER1" respectively.

The integer interpretation of the value was nonsense, but these were consistently counting down to low and resetting high after I received an item. After plugging them into Excel's HEX2FLOAT and seeing "9.98", it was immediately promsing.

These are single-precision floats. They are written to every frame. ITEMTIMER0 always equals ITEMTIMER1. They constantly count down from 10.0, by about -0.02 per frame (for 5 out of every 6 frames). This pattern approximates (0.02 * 5)/6 = 0.016666, which because of 60 FPS, is exactly equal to the ideal seconds per frame of 1/60 = 0.016666.

When I receive an item, the HUD flashes with a starburst animation. 3 frames before the flash, the value is 0.0199617. The frame after that, it's reset to 10.0. I can only assume this means the animation is delayed.

I set a memory on-write breakpoint for ITEMTIMER0 and it logs `MBP 80065748 ( --- ) Write32 410dc274 at 804b2a70 ( --- )`. That means code at address PC=80065748 is writing value 0x410dc274 (8.85997) to ITEMTIMER0. Let's look at the disassembly surrounding that PC:

```
lfs   f1, 0x0060 (r31)
lfs   f0, -0x738C (rtoc)
fsubs f1,f1,f31        ; f31 = ~0.02d
stfs  f1, 0x0060 (r31) <----- PC=80065748
lfs   f1, 0x0060 (r31)
fcmpo cr0,f1,f0
bge-   ->0x80065778
```

Starting from PC, this code can be interpreted as:

- [Docs](https://www.ibm.com/docs/en/aix/7.1?topic=set-stfs-store-floating-point-single-instruction) - Take f1 (4021b84e80000000, 8.859973907470703), convert it to single-precision (410dc274, 8.85997), store it in the address r31+0060 = 804b2a10+0060 = 804b2a70.
- [Docs](https://www.ibm.com/docs/en/aix/7.1?topic=set-lfs-load-floating-point-single-instruction) - Load that same address back to f1 (okay...? lol)
- [Docs](https://www.ibm.com/docs/en/aix/7.1?topic=set-fcmpo-floating-compare-ordered-instruction) - compare f1 and f0
- [Docs](https://www.ibm.com/docs/en/aix/7.2?topic=processor-floating-point-compare-instructions) and [Docs](https://www.ibm.com/docs/en/aix/7.1?topic=embi-extended-branch-mnemonics-that-incorporate-bo-field-partial-bi-field) - if f1 (8.8599d) is greater than or equal to f0 (0.0d), then skip the section that undoubtedly rewards us with items! (Interesting note: the minus there is a branch prediction hint. It tells the CPU that the branch will most likely not be taken, even though it *is* taken 99.8% of the time.)

Inside that section, I placed a breakpoint, and let the game run for 9ish seconds. Boom, it hit.

```
lfs   f0, -0x735C (rtoc) <----- PC=80065758
stfs  f0, 0x0060 (r31)
```

First thing it does is load something into f0. `rtoc`, according to several sketchy sources, is apparently another way of saying `GPR2`. The Dolphin register tab calls it `r2`. r2 = 8037cbe0. Effective address for this instruction is therefore 8037cbe0-735c=80375884. Dolphin's memory viewer says at that location, the value is 0x41200000 (10.0f)! I'll call this address ITEMTIMERRESET. Can I poke this memory location? Let's set it to 0x40000000 (2.0f), using the Dolphin memory viewer set value button.

It's chaos! Powerups every 2 seconds! And 0.1f is even worse.

Luckily, the address for ITEMTIMERRESET is stable; if I reset the game, the variable (rather, a constant value of 10.0f) is still at the same address.

### Generating an AR Code

AR Codes write values to memory. Don't ask me when or how, they just do. We need to write a code that sets the value at ITEMTIMERRESET to 0.1f.

The [AR tutorial for Dolphin](https://github.com/dolphin-emu/dolphin/wiki/GameCube-Action-Replay-Code-Types-(Simple-Version)) says that codes that start with 0x04 can write 32 bits to a memory location. If our address ITEMTIMERRESET is 0x80375884, our "offset" would be 0x80000000 less than that, or 0x00375884. And the value we want to write is 0x3dcccccd (0.1f). This [AR decompiler/helper](https://gamehacking.org/system/ngc) double checks our work.

The final AR code is...

**Name: Enhance the "Infinite Power Ups" Cheat**

**Code: 04375884 3DCCCCCD**

Note that the in-game cheat "infinite power ups" must be unlocked and enabled for this to work. Since the cheats don't work for cup matches, this won't either.

### Other links

- [Hacking Super Monkey Ball Part 2 – Decompilation with Ghidra](https://www.smokingonabike.com/2021/02/28/hacking-super-monkey-ball-part-2-decompilation-with-ghidra/)
- [Hex to float converter](https://gregstoll.com/~gregstoll/floattohex/)
- [PPC cheat sheet](https://www.cs.uaf.edu/2011/fall/cs301/lecture/11_21_PowerPC.html)
