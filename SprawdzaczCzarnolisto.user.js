// ==UserScript==
// @name	Sprawdzacz czarnolisto
// @namespace	https://github.com/kasper93/
// @author	kasper93
// @description	Sprawdza czy dana osoba ma nas na czarnolisto. Zapamiętuje to i oznacza.
// @include	http://*.wykop.pl/*
// @downloadURL	https://raw.githubusercontent.com/kasper93/userscripts/master/SprawdzaczCzarnolisto.user.js
// @updateURL	https://raw.githubusercontent.com/kasper93/userscripts/master/SprawdzaczCzarnolisto.user.js
// @version	2.4.2
// @grant	none
// @run-at	document-end
// ==/UserScript==

// Podziękowania dla Ginden za protipa.

function main($) {
    var apiKey = "kpGpNe9uXx";
    var self = $('.quickpoint a[title="Przejdź do swojego profilu"]').text();

    rysujCzarnolisto(JSON.parse(localStorage['czarnolisto'] || '[]'));

    $(document).ajaxComplete(function () {
        rysujCzarnolisto(JSON.parse(localStorage['czarnolisto'] || '[]'));
    });

    if (gdzie("wpis")) {
        sprawdzCzarnolisto($('li[data-type=entry]'));
    }
    
    $(".activitiesStream").on("focus", ".addcommentin", function() {
        sprawdzCzarnolisto($(this).closest('li[data-type=entry]'));
    });

    function sprawdzCzarnolisto(entry) {
        if (!entry.hasClass("cC")) {
            var nick = $('.aCI strong.fbold', entry).text();
            var id = entry.data("id");
            if (nick != self) {
                $.ajax({
                    url: "http://a.wykop.pl/entries/index/" + id + "/appkey," + apiKey + ",format,jsonp",
                    type: "GET",
                    dataType: "jsonp",
                    jsonp : false,
                    jsonpCallback: "wykopParser",
                    success: function(r){
                        if (r.can_comment) {
                            zapiszCzarnolisto(id, nick, false);
                        } else if (r.error === undefined) {
                            zapiszCzarnolisto(id, nick, true);
                        }
                        entry.addClass("cC");
                        console.log('Sprawdziłem: ' + id);
                    }
                });
            }
        }
    }

    function zapiszCzarnolisto(id, nick, bCzarnolisto) {
        var czarnolisto = JSON.parse(localStorage['czarnolisto'] || '[]');

        if (bCzarnolisto) {
            czarnolisto.pushUnique(nick);
            localStorage.setItem('czarnolisto', JSON.stringify(czarnolisto));
        } else {
            czarnolisto.remove(nick);
            localStorage.setItem('czarnolisto', JSON.stringify(czarnolisto));
        }
        rysujCzarnolisto(czarnolisto);
    }

    function rysujCzarnolisto(czarnolisto) {
        if (czarnolisto.length == 0) {
            return;
        }
        $('blockquote header').each(function () {
            $('.czarnotext', this).remove();
            if (czarnolisto.indexOf($('a > strong.fbold', this).text()) != -1) {
                //$(this).append('<span class="color-5 czarnotext" style="display: inline-block; width: 6px; height: 6px; margin-right: 5px;"></span>'); // jakiś kwadrat, ale nie podoba mi się.
                //$('.czarnotext', this).css('background', $('.czarnotext', this).css('color'));
                $(this).append('<span class="czarnotext small color-5 fbold">(czarnolisto)</span>')
            }
        });
    }

    Array.prototype.pushUnique = function (item) {
        if (this.indexOf(item) == -1) {
            this.push(item);
            return true;
        }
        return false;
    }

    Array.prototype.remove = function (item) {
        if (this.indexOf(item) != -1) {
            this.splice(this.indexOf(item), 1);
            return true;
        }
        return false;
    }

    function gdzie(e) {
        return document.location.pathname.substring(0, 5) == '/' + e
    };
};

// jQueryLoader, see https://github.com/kasper93/userscripts for unminified version.
function a(){this.message="unsafeWindow failed!";this.name="Exception"}try{main(jQuery)}catch(b){console.log(b.message);try{if("undefined"===typeof unsafeWindow.jQuery)throw new a;main(unsafeWindow.jQuery)}catch(c){console.log(c.message);try{var d=document.createElement("script");d.textContent="("+main.toString()+")(window.jQuery);";document.body.appendChild(d)}catch(e){console.log(e.message)}}};
