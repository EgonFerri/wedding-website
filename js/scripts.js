$(document).ready(function () {

    /***************** Dynamic Engagement Photos Loading ******************/
    var imageFolder = "img/eng_pics/";
    var numImages = 6; // Adjust this number to the total images in your folder
    var gallery = $("#eng-pics-gallery");
    for (var i = 1; i <= numImages; i++) {
        var imgHtml = '<div class="col-md-2">' +
            '<a class="fancybox" rel="group" href="' + imageFolder + i + '-lg.jpg">' +
            '<div class="img-wrap">' +
            '<div class="overlay"><i class="fa fa-search"></i></div>' +
            '<img src="' + imageFolder + i + '-sm.jpg" alt="Engagement Photo ' + i + '" />' +
            '</div></a></div>';
        gallery.append(imgHtml);
    }

    // If necessary, reinitialize fancybox for the new images:
    $('.fancybox').fancybox({
        padding: 4,
        width: 1000,
        height: 800
    });

    /***************** Waypoints (Animate.css v4) ******************/
    // Helper to add v4 animation classes and unhide the element
    function wpAnim(selector, effect, offsetVal) {
        var off = offsetVal || '75%';
        $(selector).waypoint(function () {
            $(selector)
                .css('visibility', 'visible') // override the initial hidden state
                .addClass('animate__animated animate__' + effect);
        }, { offset: off });
    }

    wpAnim('.wp1', 'fadeInLeft');
    wpAnim('.wp2', 'fadeInRight');
    wpAnim('.wp3', 'fadeInLeft');
    wpAnim('.wp4', 'fadeInRight');
    wpAnim('.wp7', 'fadeInUp');
    wpAnim('.wp8', 'fadeInLeft');
    wpAnim('.wp9', 'fadeInRight');

    /***************** Nav Transformicon ******************/
    /* When user clicks the Icon */
    $('.nav-toggle').click(function (event) {
        $(this).toggleClass('active');
        $('.header-nav').toggleClass('open');
        event.preventDefault();
    });
    /* When user clicks a link */
    $('.header-nav li a').click(function () {
        $('.nav-toggle').toggleClass('active');
        $('.header-nav').toggleClass('open');
    });

    /***************** Header BG Scroll ******************/
    $(function () {
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();

            if (scroll >= 20) {
                $('section.navigation').addClass('fixed');
                $('header').css({
                    "border-bottom": "none",
                    "padding": "35px 0"
                });
                $('header .member-actions').css({ "top": "26px" });
                $('header .navicon').css({ "top": "34px" });
            } else {
                $('section.navigation').removeClass('fixed');
                $('header').css({
                    "border-bottom": "solid 1px rgba(255, 255, 255, 0.2)",
                    "padding": "50px 0"
                });
                $('header .member-actions').css({ "top": "41px" });
                $('header .navicon').css({ "top": "48px" });
            }
        });
    });

    /***************** Smooth Scrolling ******************/
    $(function () {
        $('a[href*=\\#]:not([href=#])').click(function () {
            if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top - 90
                    }, 2000);
                    return false;
                }
            }
        });
    });

    /********************** Embed youtube video *********************/
    $('.player').YTPlayer();

    /********************** Add to Calendar **********************/
    var myCalendar = createCalendar({
        options: {
            class: '',
            // You can pass an ID. If you don't, one will be generated for you
            id: ''
        },
        data: {
            title: "Matrimonio di Egon ed Ele",
            start: new Date('Jun 27, 2026 15:30'),
            end: new Date('Jun 28, 2026 01:30'),
            address: "Chiesa di Sant'Egidio Abate, Piazza della Chiesa, Monte Virginio (RM)",
            description: "Cerimonia alle 15:30 presso la Chiesa di Sant'Egidio Abate a Monte Virginio e festa fino all'1:30."
        }
    });

    $('#add-to-cal').html(myCalendar);

    /********************** RSVP **********************/
    $('#rsvp-form').on('submit', function (e) {
        e.preventDefault();
        var data = $(this).serialize();
        var inviteCode = $('#invite_code').val().trim();
        var inviteHash = MD5(inviteCode);
        var validHashes = ['8512aaeb58c10e0e5f8254bb61bbe268'];

        $('#alert-wrapper').html(alert_markup('info', '<strong>Un attimo!</strong> Stiamo salvando i tuoi dati.'));

        if (validHashes.indexOf(inviteHash) === -1) {
            $('#alert-wrapper').html(alert_markup('danger', '<strong>Ops!</strong> Il codice invito non è corretto.'));
        } else {
            $.post('https://script.google.com/macros/s/AKfycbwolaLmeUORhPHwVQ5w0wqk4Kdhk7st0M11aaUGZeWJGPpfdvVghGWvdIOJPHFKETW1/exec', data)
                .done(function (response) {
                    console.log(response);
                    if (response.result === "error") {
                        $('#alert-wrapper').html(alert_markup('danger', response.message));
                    } else {
                        $('#alert-wrapper').html('');
                        $('#rsvp-modal').modal('show');
                    }
                })
                .fail(function (error) {
                    console.log(error);
                    $('#alert-wrapper').html(alert_markup('danger', '<strong>Ops!</strong> Si è verificato un problema con il server.'));
                });
        }
    });

});

/********************** Extras **********************/

// Google map
function buildMapOptions(center) {
    var element = document.getElementById('map-canvas');
    var options = {
        zoom: 15,
        center: center,
        scrollwheel: false
    };

    var globalMapId = (typeof window !== 'undefined' && window.GOOGLE_MAP_ID) ? window.GOOGLE_MAP_ID : null;

    if (element) {
        var mapIdFromData = element.dataset ? element.dataset.mapId : element.getAttribute('data-map-id');
        var mapId = mapIdFromData || globalMapId;
        if (mapId) {
            options.mapId = mapId;
        }
    } else if (globalMapId) {
        options.mapId = globalMapId;
    }

    return options;
}

var advancedMarkerLoader;

function loadAdvancedMarkerElement() {
    if (!advancedMarkerLoader) {
        if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
            advancedMarkerLoader = Promise.resolve(google.maps.marker.AdvancedMarkerElement);
        } else if (google.maps.importLibrary) {
            advancedMarkerLoader = google.maps.importLibrary('marker').then(function (markerLib) {
                return markerLib.AdvancedMarkerElement;
            });
        } else {
            advancedMarkerLoader = Promise.reject(new Error('Advanced Marker library unavailable.'));
        }
    }

    return advancedMarkerLoader;
}

function addMarker(map, position, markerOptions) {
    return loadAdvancedMarkerElement()
        .then(function (AdvancedMarkerElement) {
            var options = Object.assign({
                map: map,
                position: position
            }, markerOptions || {});

            var onClick = options.onClick;
            delete options.onClick;

            var marker = new AdvancedMarkerElement(options);

            if (typeof onClick === 'function') {
                marker.addListener('click', function (event) {
                    onClick({
                        map: map,
                        marker: marker,
                        position: position,
                        event: event
                    });
                });
            }

            return marker;
        })
        .catch(function (error) {
            console.error('Failed to add advanced marker', error);
            return null;
        });
}

function openDirections(destination) {
    if (!destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
        return;
    }

    var coordinates = destination.lat + ',' + destination.lng;
    var directionsUrl = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=' + encodeURIComponent(coordinates);
    var newWindow = window.open(directionsUrl, '_blank');

    if (newWindow && typeof newWindow === 'object') {
        newWindow.opener = null;
    } else {
        window.location.assign(directionsUrl);
    }
}

function createMarkerContent(title, subtitle, variant) {
    var container = document.createElement('div');
    container.className = 'custom-map-marker' + (variant ? ' ' + variant : '');

    if (title) {
        var titleElement = document.createElement('span');
        titleElement.className = 'custom-map-marker__title';
        titleElement.textContent = title;
        container.appendChild(titleElement);
    }

    if (subtitle) {
        var subtitleElement = document.createElement('span');
        subtitleElement.className = 'custom-map-marker__subtitle';
        subtitleElement.textContent = subtitle;
        container.appendChild(subtitleElement);
    }

    return container;
}

function initMap() {
    var churchLocation = { lat: 42.1509325, lng: 12.1239882 };
    var receptionLocation = { lat: 42.1361, lng: 12.1294 };
    var map = new google.maps.Map(document.getElementById('map-canvas'), buildMapOptions(receptionLocation));

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(churchLocation.lat, churchLocation.lng));
    bounds.extend(new google.maps.LatLng(receptionLocation.lat, receptionLocation.lng));
    map.fitBounds(bounds);

    if (map.getZoom() > 16) {
        map.setZoom(16);
    }

    addMarker(map, churchLocation, {
        title: "Chiesa di Sant'Egidio Abate",
        content: createMarkerContent('Chiesa', "Sant'Egidio Abate", 'marker-church'),
        onClick: function () {
            openDirections(churchLocation);
        }
    });
    addMarker(map, receptionLocation, {
        title: "Casacocò",
        content: createMarkerContent('Ricevimento', 'Casacocò', 'marker-reception'),
        onClick: function () {
            openDirections(receptionLocation);
        }
    });
}

// alert_markup
function alert_markup(alert_type, msg) {
    return '<div class="alert alert-' + alert_type + '" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>';
}

// Lightweight MD5 implementation (same version used in tests) for invite code validation
function MD5(string) {
    function RotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function AddUnsigned(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            }
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
        return (lResult ^ lX8 ^ lY8);
    }

    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    }

    function ConvertToWordArray(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;

        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }

        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    }

    function WordToHex(lValue) {
        var WordToHexValue = "";
        var WordToHexValue_temp = "";
        var lByte;
        var lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }

    function Utf8Encode(str) {
        str = str.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < str.length; n++) {
            var c = str.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }

        return utftext;
    }

    var x = Array();
    var k;
    var AA;
    var BB;
    var CC;
    var DD;
    var a;
    var b;
    var c;
    var d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    string = Utf8Encode(string);
    x = ConvertToWordArray(string);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
        a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
    return temp.toLowerCase();
}
