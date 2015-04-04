"use strict";

module.exports = (function () {

    var isWatching = false,

    // watched elements
    watchedItems = [],

    // true if element in viewport     
    isInView = function isInView(element) {
        var bounds = element.getBoundingClientRect();

        return bounds.top >= 0 && bounds.top <= window.innerHeight || bounds.bottom >= 0 && bounds.bottom <= window.innerHeight;
    },

    // tell errrbody the element entered / exited the viewport
    broadcastElementStatus = function (element, status) {
        return element.dispatchEvent(new CustomEvent("viewport:" + status, { bubbles: true }));
    },

    // stop watching scroll and stuff if there are no elements to watch
    registerWatchListChange = function registerWatchListChange() {

        if (watchedItems.length > 0 && !isWatching) {
            attachListener();
        } else if (watchedItems.length === 0 && isWatching) {
            detachListener();
        }
    },

    // add event listeners to the likes of window scroll
    attachListener = function attachListener() {
        isWatching = true;
        ["scroll", "hashchange", "touchend", "resize"].forEach(function (ev) {
            window.addEventListener(ev, checkItems);
        });
    },

    // remove event listeners to the likes of window scroll
    detachListener = function detachListener() {
        isWatching = false;
        ["scroll", "hashchange", "touchend", "resize"].forEach(function (ev) {
            window.removeEventListener(ev, checkItems);
        });
    },

    // what to execute while scrolling / moving viewport location
    checkItems = function checkItems() {

        watchedItems.forEach(function (item) {

            if (item.status === "in" && !isInView(item.element)) {
                broadcastElementStatus(item.element, "out");
                item.status = "out";
            } else if (item.status === "out" && isInView(item.element)) {
                broadcastElementStatus(item.element, "in");
                item.status = "in";
            }
        });
    };

    return {

        // add element to stalk list
        add: function add(element) {
            var config = {
                element: element,
                status: isInView(element) ? "in" : "out"
            };

            watchedItems.push(config);
            broadcastElementStatus(element, config.status);
            registerWatchListChange();
        },

        // remove an element from stalk list
        remove: function remove(element) {
            var newlist = watchedItems.filter(function (item) {
                return item.element !== element;
            });

            if (newlist.length !== watchedItems.length) {
                watchedItems = newlist;
                registerWatchListChange();
                return true;
            }

            return false;
        }

    };
})();