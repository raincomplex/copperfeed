
(function() {

    var config = CopperfeedConfig;
    var $cf;
    
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

    function initWidget() {
        $cf = $('#copperfeed');
        $cf.html($('<p/>', {'class': 'loading'}).text('Loading RSS feed...'));
        $.get(config.feedurl, gotFeedData, 'xml').fail(errorFeedData);
    }

    function errorFeedData() {
        $cf.html($('<p/>', {'class': 'loading'}).text('Error retrieving RSS feed.'));
    }
    
    function gotFeedData(data) {
        $cf.empty();
        
        var $items = $(data).find('item');
        for (var i = 0; i < $items.length; i++) {
            var $fields = $($items[i]).children();
            var item = {};
            for (var k = 0; k < $fields.length; k++) {
                var $field = $($fields[k]);
                item[$field.prop('tagName')] = $field.text();
            }

            addItem(item);
        }

        $cf.scrollTop(0);
        
        if (config.autoscroll) {
            scrollTimerID = setInterval(scrollNextItem, 1000 * (config.autoscrolltime || 5));
        }
    }

    function addItem(item) {
        var $div = $('<div/>', {'class': 'item'});
        
        $div.append($('<h1/>', {'class': 'title'}).text(item['title']));
        $div.append($('<p/>', {'class': 'description'}).html(item['description']));

        $cf.append($div);
    }

    var currentItem = 0;
    var lastScrollTop = 0;
    var scrollTimerID;
    
    function scrollNextItem() {
        var $box = $cf;

        if ($box.scrollTop() != lastScrollTop) {
            // user scrolled, stop autoscroll
            clearInterval(scrollTimerID);
            return;
        }
        
        currentItem++;
        
        var $items = $cf.find('.item');
        if (currentItem >= $items.length)
            currentItem = 0;
        var $dest = $($items[currentItem]);

        var anim = {scrollTop: $box.scrollTop() + $dest.offset().top};
        var time = 1000 * (config.scrolltime || .25);
        var complete = function() {
            lastScrollTop = $box.scrollTop();
        };
        $box.animate(anim, time, complete);
    }

    makeWidgetDiv();
    initJQuery(initWidget);
    
})();
