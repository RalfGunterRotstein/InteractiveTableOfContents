# InteractiveTableOfContents
A **jQuery** script and some **CSS** styles that create a table of contents whose topics scroll the screen to their subject when clicked, besides clickable SPANS that scroll the screen back to the top.

How to use it:
1. Insert an empty **DIV** with the ID **"table-of-contents__container"** where you want the TOC to appear.
2. Add the class **"not-numbered"** to the **H2 headings** you don’t want to receive a number.
3. Insert an empty **DIV** with the class **"divs-go-to__container"** every place where the user should be able scroll back to the top by clicking.
4. Change the file **style.css** according to your project’s design.

You can see it working at [Interactive Table Of Contents – Ralf’s Portfolio](http://ralf.infinityfreeapp.com/interactive-table-of-contents/).

Requires an interface with the method "scrollToTargetY(targetYInPixels)". I’ve used [my own](https://github.com/RalfGunterRotstein/SmoothScrolling).
