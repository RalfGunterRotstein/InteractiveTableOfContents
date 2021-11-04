/**
 * Creates a TOC whose items scroll the window to their subject when they're clicked.
 * 
 * Also creates divs after the H2 elements that scroll the window up when clicked.
 * 
 * Requires a scroll handler interface with the method "scrollToTargetY(yInPixels)".
 * 
 * @author Ralf Gunter Rotstein <ralf.rotstein@gmail.com>
 * @copyright Copyright (c) 2021, Ralf Gunter Rotstein
 * @license https://www.gnu.org/licenses/gpl-3.0.html GNU General Public License
 * 
 * @category InteractiveTableOfContents
 * @package InteractiveTableOfContents
 * @version 1.0.0
 */

$(document).ready(
    /**
     * Creates the TOC and the .divs-go-to if there is a #table-of-contents__container.
     * @returns {void}
     */
    function() {
        const $container = $("#table-of-contents__container");

        if ($container.length) {
            createTableOfContents($container);
            createDivsGoTo();
        }
    }
);

/**
 * Creates the TOC, whose topics scroll the window to their subject when clicked.
 * @param {jQuery} $container Object of the DIV the TOC and its title will be inserted into.
 * @returns {void}
 */
function createTableOfContents($container) {
    const $h2AndH3Headings = $("h2, h3");
    const $tableOfContents = new TableOfContents($container, $h2AndH3Headings);

    const $tableOfContentsList = new TableOfContentsList($h2AndH3Headings);

    // The table of contents is a 
    $tableOfContents.addTableOfContentsList($tableOfContentsList);
}

/**
 * Creates DIVs that scroll the screen up when clicked inside each .divs-go-to__container.
 * @returns {void}
 */
function createDivsGoTo() {
    $(".divs-go-to__container").each((index, containerObject) => {
        const divsGoToContainer = new DivsGoToContainer($(containerObject));

        const goToTopDiv = new DivGoToTop(smoothScrolling);
        const goToTopicsDiv = new DivGoToTOC(smoothScrolling);

        divsGoToContainer.addDivGoTo(goToTopDiv.getHtml());
        divsGoToContainer.addDivGoTo(goToTopicsDiv.getHtml());
    });
}



/**
 * Creates a DIV with the TOC's title, then adds the topics with "addTableOfContentsList".
 */
class TableOfContents {
    /**
     * Creates the TOC's HTML and inserts it in the given container.
     * @param {jQuery} $container Object of the DIV the TOC and its title will be inserted into.
     * @param {jQuery} $h2AndH3Headings Object with H2 and H3 headings.
	 * @constructor
     */
    constructor($container, $h2AndH3Headings) {
        this.$container = $container;
        this.$headings = $h2AndH3Headings;

        this.$div = this.createDiv();
        $container.append(this.$div);

        this.$heading = this.createHeading("Table Of Contents");
        this.$div.append(this.$heading);
    }

    /**
     * The DIV#table-of-contents, which should go inside the DIV#table-of-contents__container.
     * @returns {HTMLElement}
     */
    createDiv() {
        const $tableOfContents = $("<div></div>");
        $tableOfContents.attr("id", "table-of-contents");

        return $tableOfContents;
    }

    /**
     * The H2 heading of the TOC.
     * @returns {HTMLElement}
     */
    createHeading(text) {
        const containerHeading = $("<h2></h2>");

        containerHeading.attr("id", "table-of-contents__title");
        containerHeading.addClass("not-numbered");
        containerHeading.text(text);

        return containerHeading;
    }

    /**
     * Adds the list of topics to the TOC.
     * @param {HTMLElement} $tableOfContentsList The list with all the TOC topics.
     * @returns {void}
     */
    addTableOfContentsList($tableOfContentsList) {
        this.$tableOfContentsList = $tableOfContentsList;
        this.$div.append(this.$tableOfContentsList.getHtml());
    }
}

/**
 * Creates the list of topics to be inserted in the TOC.
 */
class TableOfContentsList {
    /**
     * Creates the list.
     * @param {jQuery} $h2AndH3Headings Object with H2 and H3 headings.
	 * @constructor
     */
    constructor($h2AndH3Headings) {
        this.$headings = $h2AndH3Headings;

        this.$orderedList = this.createOrderedList();

        this.fillOrderedList();
    }

    /**
     * OL to be filled with LIs.
     * @returns {HTMLElement}
     */
    createOrderedList() {
        const $orderedList = $("<ol></ol>");
        $orderedList.attr("id", "table-of-contents__topics");
        return $orderedList;
    }

    /**
     * Adds a LI for each H2 to the OL; and, after each LI, a UL with LIs for each H3.
     * @returns {void}
     */
    fillOrderedList() {
        for (let i = 0; i < this.$headings.length; i++) {
            if (this.$headings[i].tagName == "H2") {
                const $h2 = $(this.$headings[i]);
                const listItem = new TableOfContentsListItem($h2, smoothScrolling);

                this.$orderedList.append(listItem.getHtml());
            }
            else {
                const $subList = $("<ul></ul>");

                for (; i < this.$headings.length && this.$headings[i].tagName == "H3"; i++) {
                    const $h3 = $(this.$headings[i]);
                    const listItem = new TableOfContentsListItem($h3, smoothScrolling);

                    $subList.append(listItem.getHtml());
                }

                this.$orderedList.append($subList);
                i--;
            }
        }
    }

    /**
     * Whole list of topics.
     * @returns {HTMLElement} OL
     */
    getHtml() { return this.$orderedList; }
}

/**
 * Creates a LI that scrolls the screen to a heading when clicked.
 */
class TableOfContentsListItem {
    /**
     * Creates the LI with all it does.
     * @param {Object} $scrollHandler Interface with the method "scrollToTargetY(yInPixels)".
	 * @constructor
     */
    constructor($h2OrH3Heading, scrollHandler) {
        this.$heading = $h2OrH3Heading;
        this.scrollHandler = scrollHandler;
        
        this.$listItem = this.createListItem();
        const innerHtml = $h2OrH3Heading.html();
        this.$internalSpan = this.createInternalSpan(innerHtml);
        this.$listItem.append(this.$internalSpan);

        this.$listItem.on("click", this.scrollToHeading.bind(this));
        this.targetDistanceFromTop = 0;
    }

    /**
     * Creates an empty LI with the proper classes.
     * @returns {HTMLElement}
     */
    createListItem() {
        const $listItem = $("<li></li>");

        $listItem.addClass("clickable-list-item");
        if (this.$heading.hasClass("not-numbered"))
            $listItem.addClass("not-numbered");

        return $listItem;
    }

    /**
     * Creates a SPAN with the LI's text.
     * @returns {HTMLElement}
     */
    createInternalSpan(innerHtml) {
        const $internalSpan = $("<span></span>");
        $internalSpan.html(innerHtml);

        return $internalSpan;
    }

    /**
     * The LI.
     * @returns {HTMLElement}
     */
    getHtml() { return this.$listItem; }

    /**
     * Scrolls the screen to the corresponding heading. Should happen on click.
     */
    scrollToHeading() { this.scrollHandler.scrollToTargetY(this.$heading.offset().top + this.targetDistanceFromTop); }
}





/**
 * Appends divs to a previously existing container.
 */
class DivsGoToContainer {
    /**
     * Sets the container.
     * @param {HTMLElement} $containerObject Where to insert the DIVs.
	 * @constructor
     */
    constructor($containerObject) {
        this.$divsGoToContainer = $containerObject;
    }

    /**
     * Appends the given DIV to the container.
     * @param {HTMLElement} $containerObject To which to append the DIVs.
     * @returns {void}
     */
    addDivGoTo($divGoTo) { this.$divsGoToContainer.append($divGoTo); }
}

/**
 * Creates a DIV that scrolls the screen to its target when clicked.
 * @abstract
 */
class DivGoToTarget {
    /**
     * Creates the DIV with everything it does.
     * @param {string} text Text to put inside the DIV.
     * @param {Object} $scrollHandler Interface with the method "scrollToTargetY(yInPixels)".
	 * @constructor
     */
    constructor(text, scrollHandler) {
        this.scrollHandler = scrollHandler;

        this.$div = this.createDiv();
        this.$internalSpan = this.createInternalSpan(text);
        this.$div.append(this.$internalSpan);

        this.$internalSpan.on("click", this.goTo.bind(this));
    }

    /**
     * Creates an empty DIV with the proper classes.
     * @returns {HTMLElement}
     */
    createDiv() {
        const $div = $("<div></div>");
        $div.addClass("div-go-to");
        return $div;
    }

    /**
     * Creates a SPAN with the DIV's text.
     * @returns {HTMLElement}
     */
    createInternalSpan(text) {
        const $internalSpan = $("<span></span>");
        $internalSpan.text(text);
        
        return $internalSpan;
    }

    /**
     * The DIV.
     * @returns {HTMLElement}
     */
    getHtml() { return this.$div; }

    /**
     * Calls this.scrollHandler.scrollToTargetY(y) with the top of the target object as Y.
     * @returns {void}
     */
    goTo() { throw new Error("Override this method"); }
}

/**
 * Creates a DIV that scrolls the screen to the top of the page.
 * @abstract
 */
class DivGoToTop extends DivGoToTarget {
    constructor(scrollHandler) {
        super("beginning", scrollHandler);
    }

    /**
     * Scrolls the screen to the top of the page.
     * @returns {void}
     */
    goTo() { this.scrollHandler.scrollToTargetY(0); }
}

/**
 * Creates a DIV that scrolls the screen to the table of contents.
 * @abstract
 */
class DivGoToTOC extends DivGoToTarget {
    constructor(scrollHandler) {
        super("topics", scrollHandler);
    }

    /**
     * Scrolls the screen to the table of contents.
     * @returns {void}
     */
    goTo() { this.scrollHandler.scrollToTargetY($("#table-of-contents__container").offset().top); }
}