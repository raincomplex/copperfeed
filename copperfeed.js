
(function() {

    var config = CopperfeedConfig;
    var $cf, $header, $content;
    
    function makeWidgetDiv() {
        var div = document.createElement('div');
        div.id = 'copperfeed';
        document.currentScript.parentNode.insertBefore(div, document.currentScript);
    }
    
    function initJQuery(callback) {
        if (typeof(jQuery) == 'undefined') {
            var tag = document.createElement('script');
            tag.src = 'https://code.jquery.com/jquery-3.2.1.min.js';
            /* getting error "https://code.jquery.com/jquery-3.2.1.min.js is not eligible for integrity checks since it's neither CORS-enabled nor same-origin."
            tag.integrity = 'sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=';
            tag.crossorigin = 'anonymous';
            */
            tag.onload = function() {
                callback();
            };
            document.head.appendChild(tag);
        } else {
            callback();
        }
    }

    function statusMessage(msg) {
        $cf.html($('<p/>', {'class': 'status'}).text(msg));
    }
    
    function initWidget() {
        $cf = $('#copperfeed');
        statusMessage('Loading RSS feed...');
        $.get(config.feedurl, gotFeedData, 'xml').fail(errorFeedData);
    }

    function errorFeedData() {
        statusMessage('Error retrieving RSS feed.');
    }

    function getXMLFields($xmldata) {
        var $fields = $xmldata.children();
        var item = {};
        for (var k = 0; k < $fields.length; k++) {
            var $field = $($fields[k]);
            item[$field.prop('tagName')] = $field.text();
        }
        return item;
    }
    
    function gotFeedData(data) {
        $cf.empty();

        var channel = getXMLFields($(data).find('channel'));
        
        $header = $('<div/>', {'class': 'header'});
        $content = $('<div/>', {'class': 'content'});
        $header.append($('<h1/>', {'class': 'title'}).text(channel['title']));
        $header.append($('<p/>', {'class': 'description'}).html(channel['description']));
        $cf.append($header);
        $cf.append($content);

        var $items = $(data).find('item');
        for (var i = 0; i < $items.length; i++) {
            addItem(getXMLFields($($items[i])));
        }

        $content.scrollTop(0);
        
        if (config.autoscroll) {
            scrollTimerID = setInterval(scrollNextItem, 1000 * (config.autoscrolltime || 5));
        }
    }

    function addItem(item) {
        var $div = $('<div/>', {'class': 'item'});
        
        $div.append($('<h1/>', {'class': 'title'}).text(item['title']));
        $div.append($('<p/>', {'class': 'description'}).html(item['description']));

        $content.append($div);
    }

    var currentItem = 0;
    var lastScrollTop = 0;
    var scrollTimerID;
    
    function scrollNextItem() {
        if ($content.scrollTop() != lastScrollTop) {
            // user scrolled, stop autoscroll
            clearInterval(scrollTimerID);
            return;
        }
        
        currentItem++;
        
        var $items = $content.find('.item');
        if (currentItem >= $items.length)
            currentItem = 0;
        var $dest = $($items[currentItem]);

        var pad = ($dest.outerHeight(true) - $dest.outerHeight()) / 2;
        var anim = {scrollTop: $content.scrollTop() + $dest.offset().top - $content.offset().top - pad};
        var time = 1000 * (config.scrolltime || .25);
        var complete = function() {
            lastScrollTop = $content.scrollTop();
        };
        $content.animate(anim, time, complete);
    }

    makeWidgetDiv();
    initJQuery(initWidget);
    
})();
