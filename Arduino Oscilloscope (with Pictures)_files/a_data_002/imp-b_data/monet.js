(function() {
  //version of impression.js: the format is like '4.3.13'.
  var VERSION = '2.3.0';

  // Set Up
  var IMP_URL = {
    'm1': 'https://m.one.impact-ad.jp/view',
  };
  var KEYWORD_REF = 'ref';
  var KEYWORD_IDFA = 'idfa';
  var KEYWORD_ADID = 'adid';
  var HISTORY_INHIBIT = '1';
  var SAMPLING_RATE = '0';
  var FLAG_VIEWABLE = 'true';
  var FLAG_IFRAME = false;
  var INTERVAL = [0, 1];
  var POSITION = '';

  var ADV_SETTINGS = {
    a   : 'K0631',
    cp  : 'C10000029',
    l   : 'L10000254',
    am  : 'M019',
    cr  : '138',
    ct  : '3376',
    h   : '0',
    w   : '0'
  };

  // Utilitiy Object
  var utils = {
    // check Legacy IE
    isLegacyIe : function(){
      var ua = window.navigator.userAgent.toLowerCase();
      var versionString = ua.match(/msie (\d+)\./);
      if (versionString) {
        var version = parseInt(versionString[1], 10);
        if (version < 9) {
          return true;
        }
      }
      return false;
    },
    // Append 1x1 tag to <body>
    appendPixelTagToBody : function(requestUrl) {
      var obj = document.createElement('img');
      obj.style.width = 1;
      obj.style.height = 1;
      obj.style.display = 'none';
      obj.async = true;
      obj.src = requestUrl;
      document.body.appendChild(obj);
    },
    formartRequestQuery: function(params) {
      var query = '?';
      Object.keys(params).forEach(function(key, index, array) {
        if (params[key] !== undefined) {
          query += key + '=' + params[key];
          if (index !== array.length - 1) {
            query += '&';
          }
        }
      });
      return query;
    },
    // Get URL parameter
    getQueryString : function(urlParams) {
      var result = {};
      if (urlParams !== '') {
        var query = urlParams.substring(1);
        var parameters = query.split('&');
        for (var i = 0; i < parameters.length; i++) {
          var element = parameters[i].split('=');
          var paramName = decodeURIComponent(element[0]);
          var paramValue = decodeURIComponent(element[1]);
          result[paramName] = paramValue;
        }
      }
      return result;
    },
    getSrc : function(){
      return encodeURIComponent(location.href);
    },
    getRefer : function(){
      return encodeURIComponent(document.referrer);
    },
    randomNum: function(){
      var NUMBER = '123456789';
      var random = '';
      for (var i = 0; i < 10; i++) {
        random += NUMBER.charAt(Math.floor(NUMBER.length * Math.random()));
      }
      return random;
    },
    currentScript : function() {
      var script = document.currentScript || (function() {
        var nodeList = document.getElementsByTagName('script');
        return nodeList.item(nodeList.length - 1);
      })();

      if(script.src.indexOf('ic=') < 0){
        script = utils.findScript();
      }
      return script;
    },
    findScript : function() {
      var nodeList = document.getElementsByTagName('script');
      var script;
      for(var i=0; i<nodeList.length; i++){
        var src = nodeList[i].src;
        if(src.indexOf('img.ak.impact-ad.jp\/ic\/pone\/commonjs\/monet.js') > 0){
          script = nodeList[i];
        }
      }
      return script;
    },
    getQuery : function(){
      var src = decodeURIComponent(utils.currentScript().src);
      var queries = src.split('?');
      var query = '';
      for(var i=1; i<queries.length; i++){
        if(i === queries.length-1){
          query = query + queries[i];
        } else {
          query = query + queries[i] + '?';
        }
      }
      return query;
    },
    parseQuery : function(query){
      var object = {};
      var params = query.split('&');

      for(var i=0; i<params.length; i++){
        var key = params[i].split('=')[0];
        var val = params[i].split('=')[1];
        if(key === 'ic'){
          object['ic'] = encodeURIComponent(params[i].split('ic=')[1]);
        } else {
          object[key] = val;
        }
      }
      return object;
    },
    request: function(query, element, url) {
      var timestamp = new Date().getTime();
      var id = 'm1V_' + timestamp;
      var img = document.createElement('img');
      var endPoint = url;
      img.src = endPoint + query;
      img.id = id;
      element.appendChild(img);
      img.parentNode.removeChild(img);
    },
    mergeParams : function(placement, advSetting) {
      var object = placement;
      for(var key in advSetting) {
        object[key] = advSetting[key];
      }
      return object;
    }
  };

  var main = function() {
    var query = utils.getQuery();
    var placement = utils.parseQuery(query);
    var setting = utils.mergeParams(placement, ADV_SETTINGS);
    tracking(setting);
  };

  function callback(status, placement) {
    var params = {};
    if (status > 0) {
      params.n = 'OK';
      if (status > 1) {
        params.n = 'VTIME'
      }
      if (status === 200) {
        params.n = 'READY'
      }
      if (status === 201) {
        params.n = 'ATF';
      }
      if (status === 202) {
        params.n = 'BTF';
      }
      if (status === 203) {
        params.n = 'OTF'
      }
      if (status === 300) {
        params.n = 'CLICK'
      }
      if (status === 400) {
        params.n = 'NG'
      }
      if(params.n === 'ATF' || params.n === 'BTF' || params.n === 'OTF'){
        POSITION = params.n;
      }
      params.act = 'VA';
      params.hig = 1;
      params.cust1 = POSITION;
      var d = Object.keys(placement);
      for (var i = 0; i < d.length; i++) {
        if (d[i] !== 'act' && d[i] !== 'callback' && d[i] !== 'interval' && d[i] !== 'element') {
          if (d[i] === 'ss') {
            params[d[i]] = utils.randomNum();
          } else {
            params[d[i]] = placement[d[i]];
          }
        }
      }
      params.vs = Math.floor(params.vs);
      var queryMone = '?e='+params.n+'&ic='+params.ic
      utils.request(queryMone, placement.element, IMP_URL.m1);
    }
  };

  var tracking = function(setting){
    // Sampling
    var FALG_SAMPLE = (Math.floor(Math.random()*SAMPLING_RATE) === 0) ? true : false;
    if (FALG_SAMPLE) {
     requestImpression(setting);
     if(FLAG_VIEWABLE && !utils.isLegacyIe()){
       setting.callback = callback;
       setting.interval = INTERVAL;
       setting.id = utils.randomNum();
       if(setting.tid){
        setting.selector = setting.tid;
       }
       startViewable(setting);
     }
    }
  };

  // viewable 
  var startViewable = function(setting){
    // x1 object to viewable
    ;(function(){var g='2.3.0';var j={getUrl:function(){return encodeURIComponent(window.location.href)},getRefer:function(){return encodeURIComponent(document.referrer)},hasParentIframe:function(){if(window!==parent){return 1}return 0},isLegacyIe:function(){var a=window.navigator.userAgent.toLowerCase();var b=a.match(/msie (\d+)\./);if(b){var c=parseInt(b[1],10);if(c<9){return true}}return false},currentScript:function(){var b=document.currentScript||(function(){var a=document.getElementsByTagName('script');return a.item(a.length-1)})();return b},getParams:function(){var a=decodeURIComponent(j.currentScript().src);var b=a.split('?')[1];var c=b.split('&');return c}};if(!j.isLegacyIe()){!function(e){function t(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return e[i].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}([function(e,t,n){n(1),n(4),n(1),n(2),n(3),n(9),n(7),n(10),e.exports=n(8)},function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}var r=n(2),a=i(r),u=n(4),o=i(u),s=n(10),l=i(s);!function(){function e(e){var n=e,i=a.default.hasParentIframe();1===i?(n.id=1,n.selector="body",t(n)):0===i&&(n.element?t(n):(n.selector||(n.element=a.default.adFrame),n.element?"IFRAME"===n.element.tagName?window.addEventListener&&n.element.addEventListener("load",function(){n.exec||(n.exec=!0,t(n))},!1):t(n):window.addEventListener("load",function(){n.element=a.default.adFrame,n.element&&t(n)})))}function t(e){var t=e.id,r=l.default.getQueue(t);if(0===Object.keys(r).length){var a=new o.default(e);if(r.placement=a,l.default.setQueue(e.element.id,r),a.rect){var u=a.rect.width,s=a.rect.height;0===u||0===s?n(e):(clearInterval(r.measureTimer),i(a))}}else{var c=r.placement;if(c.rect){var f=c.rect.width,d=c.rect.height;0===f||0===d?n(e):(clearInterval(r.measureTimer),i(c))}}}function n(t){var n=t.id,i=l.default.getQueue(n);if(!i.measureTimer){var r=function(){e(t)};i.measureTimer=setInterval(r,100),l.default.setQueue(t.element.id,i)}}function i(e){e.placement.cb(200,e.params),a.default.isTargetBrowser()?(e.placement.startTime=(new Date).getTime(),e.isViewable()):e.placement.cb(400,e.params)}window.DACV=window.DACV||{cb:function(e){var t=l.default.getQueue(1);t.placement.requestAnimationFrameCb(e)},start:function(t){e(t)}}}()},function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),u=n(3),o=i(u),s=function(){function e(){r(this,e)}return a(e,null,[{key:"clientRect",value:function(e){var t=this.hasParentIframe(),n={};return 1===t?(n.width=e.getBoundingClientRect().width||e.scrollWidth||window.innerWidth,n.height=e.getBoundingClientRect().height||e.scrollHeight||window.innerHeight,n.top=e.getBoundingClientRect().top||0,n.left=e.getBoundingClientRect().left||0):n=e.getBoundingClientRect(),n}},{key:"isHidden",value:function(){return"undefined"!==document.hidden?document.hidden:document.webkitHidden}},{key:"isIos",value:function(){var e=this.ua;return!!(e&&e.indexOf("iphone")>0||e.indexOf("ipod")>0||e.indexOf("ipad")>0)}},{key:"isIosChrome",value:function(){var e=this.ua;return!!(e&&e.indexOf("crios")>0)}},{key:"isModernIos",value:function(){var e=this.ua,t=e.match(/iphone os (\d{1,2})/)||e.match(/cpu os (\d{1,2})/)||e.match(/ipad; cpu os (\d{1,2})/);if(t){var n=parseInt(t[1],10);return n>o.default.LEGACY_SAFARI_VERSION}return!1}},{key:"isIosModernChrome",value:function(){var e=this.ua,t=e.match(/crios\/(\d+)/);if(t){var n=parseInt(t[1],10);return n>o.default.LEGACY_CHROME_VERSION}return!1}},{key:"isAndroid",value:function(){var e=this.ua;return!!(e&&e.indexOf("android")>0)}},{key:"isIe",value:function(){var e=this.ua;return!!(e&&e.indexOf("edge")>0||e.indexOf("trident/7")>0||e.indexOf("msie")>0)}},{key:"isModernIe",value:function(){var e=this.ua,t=e.match(/msie (\d+)\./);if(t){var n=parseInt(t[1],10);if(n>o.default.LEGACY_IE_VERSION)return!0}return e.indexOf("trident/7")>0}},{key:"isLegacyIe",value:function(){var e=this.ua,t=e.match(/msie (\d+)\./);if(t){var n=parseInt(t[1],10);if(n<=o.default.LEGACY_IE_VERSION)return!0}return!1}},{key:"isLegacyEdge",value:function(){var e=this.ua,t=e.match(/edge\/(\d+)/);if(t){var n=parseInt(t[1],10);if(n<o.default.LEGACY_EDGE_VERSION)return!0}return!1}},{key:"isEdge",value:function(){var e=this.ua,t=e.match(/edge\/(\d+)/);if(t){var n=parseInt(t[1],10);if(n>o.default.LEGACY_EDGE_VERSION)return!0}return!1}},{key:"isSafari",value:function(){var e=this.ua;return!(!(e&&e.indexOf("safari")>0)||this.isChrome())}},{key:"isModernSafari",value:function(){var e=this.ua,t=e.match(/version\/(\d{1,2})/);if(t){var n=parseInt(t[1],10);return n>o.default.LEGACY_SAFARI_VERSION}return!1}},{key:"isFirefox",value:function(){var e=this.ua;return!!(e&&e.indexOf("firefox")>0)}},{key:"isChrome",value:function(){var e=this.ua;return!!(e&&e.indexOf("chrome")>0)}},{key:"isModernChrome",value:function(){var e=this.ua,t=e.match(/chrome\/(\d+)/);if(t){var n=parseInt(t[1],10);return n>o.default.LEGACY_CHROME_VERSION}return!1}},{key:"isOpera",value:function(){var e=this.ua;return!!(e&&e.indexOf("opr")>0)}},{key:"isModernOpera",value:function(){var e=this.ua,t=e.match(/opr\/(\d+)/);if(t){var n=parseInt(t[1],10);return n>=o.default.LEGACY_OPERA_VERSION}return!1}},{key:"getTargetElement",value:function(e){return document.querySelector(e)}},{key:"calcBoundary",value:function(e,t,n){if(n+t<=0)return 0;if(n>=e)return 0;var i=1;n<0&&(i=(n+t)/t);var r=1;return n+t>e&&(r=(e-n)/t),i*r}},{key:"getInViewRatio",value:function(e){var t=this.calcBoundary(e.parentViewportWidth,e.width,e.viewportX),n=this.calcBoundary(e.parentViewportHeight,e.height,e.viewportY);return t*n}},{key:"hasParentIframe",value:function(){return window!==window.parent?1:0}},{key:"isInView",value:function(t,n){return!(!e.isInviewRatioThreshold(t,n)||e.isHidden())}},{key:"isInviewFpsThreshold",value:function(e){return e>=o.default.INVIEW_FPS_THRESHOLD}},{key:"isInviewRatioThreshold",value:function(e,t){return t>=e}},{key:"isTargetBrowser",value:function(){if(1===e.hasParentIframe()){if("undefined"!=typeof $sf&&"undefined"!=typeof $sf.ext)return!0;if(e.isIos())return!!e.isModernIos()&&(!!e.isSafari()||(e.isIosChrome(),!1));if(e.isAndroid())return!!e.isModernChrome();if(e.isIe()){if(e.isModernIe()||e.isLegacyEdge())return!0;if(e.isEdge())return!0}else{if(e.isOpera())return!!e.isModernOpera();if(e.isSafari())return!!e.isModernSafari();if(e.isFirefox())return!0;if(e.isChrome())return!!e.isModernChrome()}return!1}return!0}},{key:"pluckAdFrame",value:function(e){var t=[],n=void 0;if("IFRAME"===e.tagName){var i=e.width||e.style.width,r=e.height||e.style.height,a=e.style.display;i>1&&r>1&&"none"!==a&&(e.id=e.id||"dacv_"+this.randomNum,n=e,n.selector=e.id)}t[t.length]=e.getElementsByTagName("img"),t[t.length]=e.getElementsByTagName("a"),t[t.length]=e.getElementsByTagName("div"),t[t.length]=e.getElementsByTagName("iframe"),t[t.length]=e.getElementsByTagName("embed"),t[t.length]=e.getElementsByTagName("object"),t[t.length]=e.getElementsByTagName("video");for(var u=0;u<t.length;u++){for(var o=void 0,s=0;s<t[u].length;s++){o=t[u][s];var l=o.width||o.style.width,c=o.height||o.style.height,f=o.style.display;if(l>1&&c>1&&"none"!==f){o.id=o.id||"dacv_"+this.randomNum,n=o,n.selector=o.id;break}}if(n)break}return n}},{key:"previousSibling",value:function(e){return e.previousSibling}},{key:"largeSizeAd",value:function(){return 242500}},{key:"ua",get:function(){return window.navigator.userAgent.toLowerCase()}},{key:"randomNum",get:function(){for(var e="123456789",t="",n=0;n<10;n++)t+=e.charAt(Math.floor(e.length*Math.random()));return t}},{key:"viewportSize",get:function(){var e={};return e.height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight,e.width=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,e}},{key:"viewportOffset",get:function(){var e={};return e.top=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop,e.left=window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft,e}},{key:"browserSize",get:function(){var e={};return e.height=window.outerHeight,e.width=window.outerWidth,e}},{key:"browserTop",get:function(){var e=this.ua,t=/windows/,n=/windows\snt\s10/,i=/mac\sos\sx/,r=0;return t.test(e)&&(r=86),(i.test(e)||n.test(e))&&(r=81),r}},{key:"currentScript",get:function(){var e=document.currentScript||function(){var e=document.getElementsByTagName("script");return e.item(e.length-1)}();return e}},{key:"adFrame",get:function(){for(var e=this.currentScript,t=this.previousSibling(e),n=void 0;t;)1===t.nodeType&&(n=this.pluckAdFrame(t)),t=!n&&this.previousSibling(t);return n}}]),e}();t.default=s},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r=function(){function e(){n(this,e)}return i(e,null,[{key:"TAG_VERSION",get:function(){return"0.0.1"}},{key:"DELAY_NUM",get:function(){return 100}},{key:"VIEWABLE_DECISION_TIME",get:function(){return 1e3}},{key:"NUMBER_OF_DETERMINATIONS",get:function(){return this.VIEWABLE_DECISION_TIME/this.DELAY_NUM}},{key:"INVIEW_RATIO_THRESHOLD",get:function(){return.5}},{key:"BEFORE_INVIEW_RATIO_THRESHOLD",get:function(){return.3}},{key:"INVIEW_FPS_THRESHOLD",get:function(){return 50}},{key:"LEGACY_IE_VERSION",get:function(){return 8}},{key:"LEGACY_CHROME_VERSION",get:function(){return 50}},{key:"LEGACY_SAFARI_VERSION",get:function(){return 8}},{key:"LEGACY_EDGE_VERSION",get:function(){return 14}},{key:"LEGACY_OPERA_VERSION",get:function(){return 38}},{key:"SWF_URL",get:function(){return"//img.ak.impact-ad.jp/x1/imp_js/DacV.swf"}},{key:"INTERSECTION_OBSERVER_THRESHOLD",get:function(){return[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]}}]),e}();t.default=r},function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),u=n(2),o=i(u),s=n(5),l=i(s),c=n(3),f=i(c),d=n(9),h=i(d),m=n(7),v=i(m),p=function(){function e(t){r(this,e),this.placement={},this.placement.id=o.default.randomNum,this.placement.interval=t.interval,this.placement.inviewThreshold=t.inviewThreshold,this.placement.cb=t.callback,this.placement.selector=t.selector||"",this.placement.element=t.element||o.default.getTargetElement(this.placement.selector),this.placement.ratio=0,this.placement.startTime=0,this.placement.viewableStatus=!1,this.placement.firstVisible=!1,this.placement.interval&&0===this.placement.interval[0]&&(this.placement.firstVisible=!0),this.placement.exec=!1,this.params=t,this.params.vs=0,this.params.ss=o.default.randomNum,this.params.element=this.placement.element}return a(e,[{key:"didInviewCheck",value:function(e){this.placement.ratio=e}},{key:"didInviewThresholdCheck",value:function(e,t){var n=e*t;void 0===this.placement.inviewThreshold&&(n>=o.default.largeSizeAd()?this.placement.inviewThreshold=.3:this.placement.inviewThreshold=.5)}},{key:"invalid",value:function(){this.placement.cb(400,this.params)}},{key:"count",value:function(){var e=this,t=this.placement.ratio,n=o.default.isInView(this.placement.inviewThreshold,t);if(1===o.default.hasParentIframe()&&this.placement.firstVisible?"undefined"!=typeof $sf&&"undefined"!=typeof $sf.ext?this.isFirstVisibile(t):o.default.isChrome()&&!o.default.isModernChrome()||this.isFirstVisibile(t):0===o.default.hasParentIframe()&&this.placement.firstVisible&&this.isFirstVisibile(t),n&&this.placement.viewableStatus){var i=this.placement.id;h.default.setQueue(i,(new Date).getTime()),this.placement.viewableStatus=!0}else if(n&&!this.placement.viewableStatus){var r=this.placement.id;this.placement.firstVisible?h.default.setQueue(r,this.placement.startTime):(h.default.setQueue(r,(new Date).getTime()),this.params.vs+=.05),this.placement.viewableStatus=!0}else if(!n&&this.placement.viewableStatus)this.params.vs+=.05,this.placement.viewableStatus=!1;else{var a=this.placement.id;h.default.clearQueue(a),this.placement.viewableStatus=!1}var u=this.placement.id,s=h.default.getQueue(u);if(s.length>1){var l=s[s.length-2],c=s[s.length-1],f=(c-l)/1e3;this.params.vs+=f}if(this.placement.interval){var d=this.placement.interval;d.forEach(function(t){t<=e.params.vs&&(e.placement.interval.shift(),e.placement.cb(t,e.params))})}else this.placement.cb(this.params.vs,t,this.params);this.placement.firstVisible=!1}},{key:"isFirstVisibile",value:function(e){var t=void 0;t=e<=1&&e>=.5?201:0===e?202:203,this.placement.cb(t,this.params)}},{key:"isViewable",value:function(){var e=this,t=new l.default(this.placement.element);this.didInviewThresholdCheck(this.rect.width,this.rect.height),t.check(this.didInviewCheck.bind(this),this.invalid.bind(this)),setInterval(function(){e.count()},f.default.DELAY_NUM)}},{key:"swfCb",value:function(e,t){var n=o.default.isInviewFpsThreshold(t);v.default.setResult(e,n);var i=v.default.ids,r=v.default.getResult(i[0]),a=v.default.getResult(i[1]),u=v.default.getResult(i[2]),s=v.default.getResult(i[3]),l=v.default.getResult(i[4]),c=Math.min(1,(r+a+u+s)/4/(2-l));Number.isNaN(c)||this.placement.firstVisible&&(this.isFirstVisibile(c),this.placement.firstVisible=!1),this.didInviewCheck(c)}},{key:"requestAnimationFrameCb",value:function(e){this.didInviewCheck(e)}},{key:"rect",get:function(){return o.default.clientRect(this.placement.element)}}]),e}();t.default=p},function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),u=n(2),o=i(u),s=n(6),l=i(s),c=n(3),f=i(c),d=n(8),h=i(d),m=function(){function e(t){r(this,e),this.element=t,this.rect=o.default.clientRect(this.element),this.width=this.rect.width,this.height=this.rect.height,this.x=this.rect.left,this.y=this.rect.top}return a(e,[{key:"check",value:function(e,t){this.dispatchBrowser(e,t)}},{key:"dispatchBrowser",value:function(e,t){var n=this,i=this;1===o.default.hasParentIframe()?"undefined"!=typeof $sf&&"undefined"!=typeof $sf.ext?setInterval(function(){i.safeFrame(e)},100):o.default.isIos()?(o.default.isModernIos()&&o.default.isSafari()&&this.rafFpsFluctuations(),o.default.isIosChrome()&&o.default.isIosModernChrome()):o.default.isAndroid()?o.default.isModernChrome()&&this.intersectionObserver(e):o.default.isIe()?o.default.isModernIe()||o.default.isLegacyEdge()?setInterval(function(){i.fivePoint(e)},100):o.default.isEdge()?this.intersectionObserver(e):o.default.isLegacyIe():o.default.isOpera()?o.default.isModernOpera()&&this.intersectionObserver(e):o.default.isSafari()?o.default.isModernSafari()&&this.rafFpsFluctuations():o.default.isFirefox()?setInterval(function(){i.useMozInnerScreen(e)},100):o.default.isChrome()&&o.default.isModernChrome()&&this.intersectionObserver(e):setInterval(function(){i.rect=n.element.getBoundingClientRect(),i.x=n.rect.left,i.y=n.rect.top;var t=n.scrollAmount("x"),r=n.scrollAmount("y"),a=t*r/1e4;e(a)},100)}},{key:"intersectionObserver",value:function(e){var t=new IntersectionObserver(function(t){var n=t[0].intersectionRatio;e(n)},{threshold:f.default.INTERSECTION_OBSERVER_THRESHOLD});t.observe(this.element)}},{key:"swfFpsFluctuations",value:function(){for(var e=new l.default(this.width,this.height),t=0;t<5;t++)e.create(t)}},{key:"mouseMovePoint",value:function(e){var t=this,n=function(){if(document.attachEvent)document.attachEvent("onmousemove",t.getMouseMoveInfo),document.fireEvent("onmousemove");else if(document.addEventListener){document.addEventListener("mousemove",t.getMouseMoveInfo,!1);var e=document.createEvent("MouseEvent");e.initEvent("mousemove",!0,!0),document.dispatchEvent(e)}};setTimeout(n,0)}},{key:"useMozInnerScreen",value:function(e){var t=window.mozInnerScreenX,n=window.mozInnerScreenY,i=window.screenX,r=window.screenY,a={};a.width=window.innerWidth,a.height=window.innerHeight,a.viewportX=t-i,a.viewportY=n-r-o.default.browserTop,a.parentViewportWidth=window.outerWidth,a.parentViewportHeight=window.outerHeight-o.default.browserTop;var u=o.default.getInViewRatio(a);e(u)}},{key:"getMouseMoveInfo",value:function(e){if(document.detachEvent?document.detachEvent("onmousemove",arguments.callee):document.removeEventListener&&document.removeEventListener("mousemove",arguments.callee),this.mouseMove.clientX=e.clientX,this.mouseMove.clientY=e.clientY,this.mouseMove.screenX=e.screenX,this.mouseMove.screenY=e.screenY,document.attachEvent)this.element.attachEvent("onload",getDomInfo),this.element.fireEvent("onload");else if(document.addEventListener){this.element.addEventListener("load",getDomInfo);var t=document.createEvent("UIEvent");t.initEvent("load",!0,!0),this.element.dispatchEvent(t)}}},{key:"getDomInfo",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0,t=arguments[1];document.detachEvent?this.element.detachEvent("onload",arguments.callee):document.removeEventListener&&this.element.removeEventListener("load",arguments.callee);var n=o.default.viewportSize.width,i=o.default.viewportSize.height,r=o.default.browserSize.width,a=o.default.browserSize.height,u=window.screenLeft,s=window.screenTop,l=window.screenX,c=window.screenY,f=u-this.mouseMove.screenX+this.mouseMove.clientX,d=s-this.mouseMove.screenY+this.mouseMove.clientY,h={};h.width=n,h.height=i,h.viewportX=this.mouseMove.clientX-e.clientX,h.viewportY=this.mouseMove.clientY-e.clientY,h.parentViewportWidth=r-(u-l-f),h.parentViewportHeight=a-(s-c-d);var m=o.default.getInViewRatio(h);t(m)}},{key:"fivePoint",value:function(e){var t=document,n=!!t.elementFromPoint(this.x+2,this.y+2),i=!!t.elementFromPoint(this.x+this.width-2,this.y+2),r=!!t.elementFromPoint(this.x+2,this.y+this.height-2),a=!!t.elementFromPoint(this.x+this.width-2,this.y+this.height-2),u=!!t.elementFromPoint(this.x+this.width/2,this.y+this.height/2),o=Math.min(1,(n+i+r+a)/4/(2-u));e(o)}},{key:"scrollAmount",value:function(e){var t=o.default.viewportSize,n=0,i=0,r=0,a=0,u=0,s=0;if("x"===e?(n=document.documentElement.scrollLeft||document.body.scrollLeft,i=n+this.x,r=n+t.width,a=this.width):"y"===e&&(n=document.documentElement.scrollTop||document.body.scrollTop,i=n+this.y,r=n+t.height,a=this.height),u=i+a,i<=r&&n<=u){var l=(r-i)/a*100,c=(u-n)/a*100;l>=100&&(s=c),c>=100&&(s=l),l>=100&&c>=100&&(s=100)}return s}},{key:"rafFpsFluctuations",value:function(){var e=new h.default(this.width,this.height);e.start()}},{key:"safeFrame",value:function(e){var t=$sf.ext.inViewPercentage();e(t)}}]),e}();t.default=m},function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var a=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),u=n(4),o=(i(u),n(3)),s=i(o),l=n(7),c=i(l),f=Math.floor(1e5*Math.random()),d=function(){function e(t,n){r(this,e),this.width=t,this.height=n}return a(e,[{key:"create",value:function(e){var t=document.createElement("object");if(t.type="application/x-shockwave-flash",t.id=f,t.data=s.default.SWF_URL,t.width=this.width/2+"px",t.height=this.height/2+"px",4===e){var n=this.width/100*(100-100*s.default.BEFORE_INVIEW_RATIO_THRESHOLD*2),i=this.height/100*(100-100*s.default.BEFORE_INVIEW_RATIO_THRESHOLD*2);t.width=n+"px",t.height=i+"px"}if(t.setAttribute("allowscriptaccess","always"),t.setAttribute("swliveconnect","true"),t.setAttribute("quality","low"),t.setAttribute("wmode","transparent"),t.style.zIndex=-10,t.style.position="absolute",0===e)t.style.margin="0px 0px 0px 0px",t.style.top="0px",t.style.left="0px";else if(1===e)t.style.margin="0px 0px 0px "+this.width/2+"px",t.style.top="0px",t.style.right="0px";else if(2===e)t.style.margin=this.height/2+"px 0px 0px 0px",t.style.bottom="0px",t.style.left="0px";else if(3===e)t.style.margin=this.height/2+"px 0px 0px "+this.width/2+"px",t.style.bottom="0px",t.style.right="0px";else if(4===e){var r=this.height/100*s.default.BEFORE_INVIEW_RATIO_THRESHOLD*100,a=this.width/100*s.default.BEFORE_INVIEW_RATIO_THRESHOLD*100;t.style.margin=r+"px 0px 0px "+a+"px",t.style.top="0px",t.style.right="0px",t.style.left="0px"}else t.style.margin="0px 0px 0px 0px";var u=document.createElement("param");u.name="flashvars",u.value="a="+f,t.appendChild(u),document.body.appendChild(t),c.default.ids=f++}}]),e}();t.default=d},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r={ids:[],area:{}},a=function(){function e(){n(this,e)}return i(e,null,[{key:"getResult",value:function(e){return r.area[e]}},{key:"setResult",value:function(e,t){r.area[e]=t}},{key:"queue",get:function(){return r},set:function(e){r.push(e)}},{key:"ids",get:function(){return r.ids},set:function(e){r.ids.push(e),r.area[e]={}}}]),e}();t.default=a},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r=function(){function e(t,i){n(this,e),this.width=t,this.height=i,this.frameWidth=2,this.oldTime=(new Date).getTime(),this.updateTime=(new Date).getTime()}return i(e,[{key:"start",value:function(){var e=document.createElement("iframe");e.style.width=this.frameWidth+"px",e.style.height="1px",e.style.position="absolute",e.style.marginTop=this.height/2+"px",e.style.marginRight="0px",e.style.marginLeft=(this.width-this.frameWidth)/2+"px",e.style.marginBottom="0px",e.style.top="0px",e.frameBorder="0",document.body.appendChild(e);var t=e.contentWindow?e.contentWindow.document:e.contentDocument;t.write('<html><head></head><body><script type="text/javascript">!function() {var oldTime = new Date().getTime();var rafFps = 0;function render() {rafFps++;window.requestAnimationFrame(render);}render();setInterval(function() {var updateTime = new Date().getTime();var fps = parseInt(rafFps * 1000 / (updateTime - oldTime));if (fps >= 50) {window.parent.DACV.cb(1);} else {window.parent.DACV.cb(0);}rafFps = 0;oldTime = new Date().getTime();}, 100);}();</script></body></html>'),t.close()}}]),e}();t.default=r},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r={},a=function(){function e(){n(this,e)}return i(e,null,[{key:"getQueue",value:function(e){return r[e]}},{key:"setQueue",value:function(e,t){r[e]||(r[e]=[]),r[e].push(t)}},{key:"clearQueue",value:function(e){r[e]=[]}}]),e}();t.default=a},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),r={},a=function(){function e(){n(this,e)}return i(e,null,[{key:"getQueue",value:function(e){return r[e]||(r[e]={}),r[e]}},{key:"setQueue",value:function(e,t){r[e]=t}},{key:"getAllQueue",value:function(){return r}}]),e}();t.default=a}])};window.X1V=window.X1V||{start:function(a){window.DACV.start(a)}}})();
    window.X1V.start(setting);
  };

  var requestImpression = function(setting){
    var paramsPixel = [];
    // get src
    var src = utils.getSrc();
    paramsPixel.push('src=' + src);

    // Url Praramter analysis for iFrame
    var params = 0;
    var key;
    var qryParams = utils.getQueryString(location.search);
    if(key in qryParams){
      params++;
    }
    if (params > 0) {
      var valueRef  = encodeURIComponent(qryParams[KEYWORD_REF]);
      var valueIdfa = qryParams[KEYWORD_IDFA];
      var valueAdid = qryParams[KEYWORD_ADID];
      if (valueRef) {
        paramsPixel.push('ref=' + valueRef);
        FLAG_IFRAME = true;
      }
      if (valueIdfa) {
        paramsPixel.push('idfa=' + valueIdfa);
      }
      if (valueAdid) {
        paramsPixel.push('adid=' + valueAdid);
      }
    }

    if (FLAG_IFRAME === true) {
        // iFrame
        paramsPixel.push('ifr=1');
    } else {
      // Referrer
      if (document.referrer) {
        var ref = utils.getRefer();
        paramsPixel.push('ref=' + ref);
      }
    }

     // X1pixel Params
    for (var prop in setting) {
      if (setting[prop] !== '') {
        paramsPixel.push(prop + '=' + setting[prop]);
       }
     }

    // Version
    paramsPixel.push('d4c=' + VERSION);

    // Audience History Inhibition Flag
    if (HISTORY_INHIBIT === '1') {
      paramsPixel.push('hig=' + HISTORY_INHIBIT);
    }

    paramsPixel.push('ss=' + utils.randomNum());

    // Request Pixel
    var urlForPixelMone = IMP_URL.m1 + '?' + 'e=IMP&ic=' + setting.ic;
    utils.appendPixelTagToBody(urlForPixelMone);
  };

  main();

})();