// Vanilla JS replacement for jQuery features

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('eng-pics-gallery');
  if (gallery) loadEngagementPhotos(gallery);

  const navToggleBtn = document.querySelector('.nav-toggle');
  if (navToggleBtn) {
    navToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navToggle();
    });
  }
  document.querySelectorAll('.header-nav li a').forEach(link => {
    link.addEventListener('click', navToggle);
  });

  window.addEventListener('scroll', handleScroll);

  document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach(link => {
    link.addEventListener('click', smoothScroll);
  });

  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRsvpSubmit();
    });
  }

  setupAnimations();
  setupShareButtons();

  const myCalendar = createCalendar({
    options: { class: '', id: '' },
    data: {
      title: "Egon and Ele's Wedding",
      start: new Date('Nov 27, 2017 10:00'),
      end: new Date('Nov 29, 2017 00:00'),
      address: 'ITC Fortune Park Hotel, Kolkata',
      description: "We can't wait to see you on our big day. For any queries or issues, please contact Mr. Amit Roy at +91 9876543210."
    }
  });
  const addToCal = document.getElementById('add-to-cal');
  if (addToCal) addToCal.innerHTML = myCalendar;
});

function loadEngagementPhotos(gallery, imageFolder = 'img/eng_pics/', numImages = 6) {
  for (let i = 1; i <= numImages; i++) {
    const html = `<div class="col-md-2"><a href="${imageFolder}${i}-lg.jpg"><div class="img-wrap"><div class="overlay"><i class="fa fa-search"></i></div><img src="${imageFolder}${i}-sm.jpg" alt="Engagement Photo ${i}" /></div></a></div>`;
    gallery.insertAdjacentHTML('beforeend', html);
  }
}

function navToggle() {
  document.querySelector('.nav-toggle')?.classList.toggle('active');
  document.querySelector('.header-nav')?.classList.toggle('open');
}

function handleScroll() {
  const scroll = window.scrollY;
  const nav = document.querySelector('section.navigation');
  const header = document.querySelector('header');
  if (!nav || !header) return;
  if (scroll >= 20) {
    nav.classList.add('fixed');
    header.style.borderBottom = 'none';
    header.style.padding = '35px 0';
    header.querySelector('.member-actions').style.top = '26px';
    header.querySelector('.navicon').style.top = '34px';
  } else {
    nav.classList.remove('fixed');
    header.style.borderBottom = 'solid 1px rgba(255, 255, 255, 0.2)';
    header.style.padding = '50px 0';
    header.querySelector('.member-actions').style.top = '41px';
    header.querySelector('.navicon').style.top = '48px';
  }
}

function smoothScroll(e) {
  const link = e.currentTarget;
  if (location.pathname.replace(/^\//, '') === link.pathname.replace(/^\//, '') && location.hostname === link.hostname) {
    const target = document.querySelector(link.hash) || document.querySelector(`[name='${link.hash.slice(1)}']`);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 90, behavior: 'smooth' });
    }
  }
}

function setupShareButtons() {
  const shareBar = document.getElementsByClassName('share-bar');
  const po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://apis.google.com/js/platform.js';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  for (let i = 0; i < shareBar.length; i++) {
    const html = `<iframe allowtransparency="true" frameborder="0" scrolling="no" src="https://platform.twitter.com/widgets/tweet_button.html?url=${encodeURIComponent(window.location)}&amp;text=${encodeURIComponent(document.title)}&amp;hashtags=egonedele&amp;count=horizontal" style="width:105px; height:21px;"></iframe>` +
      `<iframe src="//www.facebook.com/plugins/like.php?href=${encodeURIComponent(window.location)}&amp;width&amp;layout=button_count&amp;action=like&amp;show_faces=false&amp;share=true&amp;height=21&amp;appId=101094500229731&amp;width=150" scrolling="no" frameborder="0" style="border:none; overflow:hidden;width:150px; height:21px;" allowTransparency="true"></iframe>` +
      '<div class="g-plusone" data-size="medium"></div>';
    shareBar[i].innerHTML = html;
    shareBar[i].style.display = 'inline-block';
  }
}

function setupAnimations() {
  const pairs = [
    ['.wp1', 'fadeInLeft'],
    ['.wp2', 'fadeInRight'],
    ['.wp3', 'fadeInLeft'],
    ['.wp4', 'fadeInRight'],
    ['.wp5', 'fadeInLeft'],
    ['.wp6', 'fadeInRight'],
    ['.wp7', 'fadeInUp'],
    ['.wp8', 'fadeInLeft'],
    ['.wp9', 'fadeInRight']
  ];
  const opts = { root: null, rootMargin: '0px 0px -25% 0px', threshold: 0 };
  pairs.forEach(([selector, anim]) => {
    document.querySelectorAll(selector).forEach(el => {
      const ob = new IntersectionObserver(entries => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            el.classList.add('animated', anim);
            ob.unobserve(el);
          }
        });
      }, opts);
      ob.observe(el);
    });
  });
}

function handleRsvpSubmit() {
  const inviteCode = document.getElementById('invite_code');
  const alertWrapper = document.getElementById('alert-wrapper');
  if (!inviteCode || !alertWrapper) return;
  alertWrapper.innerHTML = alert_markup('info', '<strong>Just a sec!</strong> We are saving your details.');
  const codeHash = MD5(inviteCode.value);
  if (codeHash !== '8512aaeb58c10e0e5f8254bb61bbe268' && codeHash !== '8512aaeb58c10e0e5f8254bb61bbe268') {
    alertWrapper.innerHTML = alert_markup('danger', '<strong>Sorry!</strong> Your invite code is incorrect.');
  } else {
    alertWrapper.innerHTML = '';
    const modal = document.getElementById('rsvp-modal');
    if (modal) {
      modal.classList.add('in');
      modal.style.display = 'block';
      modal.querySelector('.close').addEventListener('click', () => {
        modal.classList.remove('in');
        modal.style.display = 'none';
      });
    }
  }
}

// Google map helpers
function initMap() {
  var location = {lat: 42.1361, lng: 12.1294};
  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 15,
    center: location,
    scrollwheel: false
  });
  new google.maps.Marker({ position: location, map: map });
}

function initBBSRMap() {
  var la_fiesta = {lat: 20.305826, lng: 85.85480189999998};
  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 15,
    center: la_fiesta,
    scrollwheel: false
  });
  new google.maps.Marker({ position: la_fiesta, map: map });
}

function alert_markup(alert_type, msg) {
  return `<div class="alert alert-${alert_type}" role="alert">${msg}<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span>&times;</span></button></div>`;
}

// MD5 Encoding (unchanged)
var MD5 = function (string) {
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
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
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
    function ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
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
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    }
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
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
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    string = Utf8Encode(string);
    x = ConvertToWordArray(string);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
        AA = a; BB = b; CC = c; DD = d;
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
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
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
        b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
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
};
