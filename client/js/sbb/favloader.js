(function() {
    "use strict";
 
    define(function () {
 
        var link = function(url) {
            var favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.href = url;
            favicon.type = 'image/png';
            document.head.appendChild(favicon);
        };
 
        return {
            link: link
        };
    });
}());