(function() {
    "use strict";
 
    define(function () {
 
        var link = function(url) {
            var css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = url;
			css.type = "text/css";
            document.head.appendChild(css);
        };
 
        return {
            link: link
        };
    });
}());