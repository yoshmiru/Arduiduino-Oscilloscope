(function(){var htmlId='';var timer='';var createRandomString=function(){var str=Math.round(Math.random()*1e15).toString(36);return str};var checkIEDocumentmode=function(){var mode=document.documentMode;if(mode===5){return true}return false};var checkIEBrowser=function(){var ua=window.navigator.userAgent.toLowerCase();if(ua&&ua.indexOf('msie')===-1){return true}return false};var checklegacyIEBrowser=function(){var ua=window.navigator.appVersion.toLowerCase();if(ua&&ua.indexOf('msie 6.')===-1&&ua.indexOf('msie 7.')===-1){return true}return false};var checkIE10Browser=function(){var ua=window.navigator.appVersion.toLowerCase();if(ua&&ua.indexOf('msie 10.')===-1){return true}return false};var checkFFBrowser=function(){var ua=window.navigator.userAgent.toLowerCase();if(ua&&ua.indexOf('firefox')===-1){return true}return false};var checkOs=function(){var ua=window.navigator.userAgent.toLowerCase();if(ua&&ua.indexOf('iphone')===-1&&ua.indexOf('ipod')===-1&&ua.indexOf('ipad')===-1&&ua.indexOf('android')===-1){return true}return false};var checkAndroid=function(){var ua=window.navigator.userAgent.toLowerCase();if(ua&&ua.indexOf('android')===-1){return true}return false};var checkVersion2Android=function(){var ua=window.navigator.userAgent.toLowerCase();if(ua&&ua.indexOf('android 2.')===-1){return true}return false};var addEvent=function(element,event,handler){if(element.addEventListener){element.addEventListener(event,handler,false)}else if(element.attachEvent){element.attachEvent('on'+event,handler)}else{element['on'+event]=handler}};var removeEvent=function(element,event,handler){if(element.removeEventListener){element.removeEventListener(event,handler,false)}else if(element.detachEvent){element.detachEvent('on'+event,handler)}};var link=function(){window.open(res.linkUrl);return false};var open=function(){window.open(res.linkUrl)};var androidlink=function(){var buttonnode=document.createElement('input');buttonnode.setAttribute('type','button');buttonnode.setAttribute('style','display:none;');document.body.appendChild(buttonnode);buttonnode.onclick=open;window.setTimeout(function(){buttonnode.click()},100)};var stop=function(evt){evt.preventDefault();return false};var expand=function(evt){document.getElementById(htmlId).style.overflow="visible";if(checkOs()){if(checkIEBrowser()){document.getElementById(htmlId).style.right='79px'}else{document.getElementById(htmlId).style.right='0px';document.getElementById(htmlId).style.width='94px'}}else{evt.preventDefault();document.getElementById(htmlId).style.right='79px';if(timer){window.clearTimeout(timer)}var elsd=document.getElementById(htmlId);var anchorsd=elsd.getElementsByTagName('a');if(checkAndroid()){addEvent(anchorsd[0],'touchend',link)}else{if(checkVersion2Android()){addEvent(anchorsd[0],'touchend',link)}else{addEvent(anchorsd[0],'touchstart',androidlink);removeEvent(anchorsd[0],'touchend',expand)}}timer=window.setTimeout(function(){if(checkAndroid()){removeEvent(anchorsd[0],'touchend',link)}else{if(checkVersion2Android()){removeEvent(anchorsd[0],'touchend',link)}else{removeEvent(anchorsd[0],'touchstart',androidlink);addEvent(anchorsd[0],'touchend',expand)}}document.getElementById(htmlId).style.right='0px';document.getElementById(htmlId).style.overflow="hidden"},2000)}return false};var close=function(){document.getElementById(htmlId).style.overflow="hidden";if(!checkIEBrowser()){document.getElementById(htmlId).style.right='0px';document.getElementById(htmlId).style.width='15px'}else{document.getElementById(htmlId).style.right='0px'}return false};var dispImark=function(p){var css=res.css.join('');if(checklegacyIEBrowser()){css+=res.imgcss.join('')}else{css+=res.ieimgcss.join('')}var randomid=createRandomString();htmlId=res.htmlbaseId.replace(/__RANDOM_ID__/g,p.id+'_'+randomid);var css=css.replace(/__DIVISION_ID__/g,htmlId);var style=document.createElement('style');style.type='text/css';if(!checkIEBrowser()){style.styleSheet.cssText=css;document.getElementsByTagName('head')[0].appendChild(style)}else{style.innerHTML=css;p.appendChild(style)}var html=document.createElement('div');html.id=htmlId;var imarkAtag=document.createElement('a');imarkAtag.href='javascript:void(0)';var imarkImg=document.createElement('img');imarkAtag.appendChild(imarkImg);html.appendChild(imarkAtag);var image=html.getElementsByTagName('img');if(checklegacyIEBrowser()){image[0].src=res.imgUrl}else{image[0].src=res.gifImg}var anchor=html.getElementsByTagName('a');if(checkOs()){addEvent(anchor[0],'click',link);addEvent(anchor[0],'mouseover',expand);addEvent(anchor[0],'mouseout',close)}else{addEvent(anchor[0],'click',stop);addEvent(anchor[0],'touchend',expand)}p.insertBefore(html,p.firstChild);if(!checkIEBrowser()){var elie=document.getElementById(htmlId);elie.style.right='0px'}};var createImark=function(id){var imark=document.getElementById(id);if(checkIEBrowser()){var parent=imark.parentNode}else{if(document.documentMode!=10){if(window==window.parent){var parent=imark.parentNode}else{var parent=imark.parentNode}}else{var parent=imark.parentNode}}if(checklegacyIEBrowser()){parent.style.display="inline-block"}else{parent.style.display="inline";parent.style.zoom=1}if(!checkIEBrowser()){parent.style.position="absolute"}else if(!checkFFBrowser()){parent.style.position="absolute"}else{parent.style.position="relative"}window.setTimeout(function(){dispImark(parent)},0)};var createDiv=function(){var imarkid=createRandomString();if(document.getElementById(imarkid)!=null){imarkid=createRandomString();document.write('<div id='+imarkid+' style="display:none;"></div>')}else{document.write('<div id='+imarkid+' style="display:none;"></div>')}setTimeout(function(){createImark(imarkid)},0)};var res={css:['div#__DIVISION_ID__ {','margin:0px;','padding:0px;','-ms-filter:alpha(opacity=80);','filter:alpha(opacity=80);','opacity: 0.8;','width:15px;','height:15px;','right:0px;','position:absolute;','z-index:999999;','overflow:hidden;','display:block;','line-height:0px','}',],imgcss:['div#__DIVISION_ID__',' img {','border:none;','width:94px;','height:15px;','line-height:0px','}',],ieimgcss:['div#__DIVISION_ID__',' img {','border:none;','width:94px;','height:15px;','filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="//a248.e.akamai.net/f/248/45380/60m/dac1.download.akamai.com/45379/poi/m1/privacy/a1ex.png",SizingMethod=crop);','line-height:0px','}',],htmlbaseId:'adb___RANDOM_ID__',linkUrl:'http://feedback.impact-ad.jp/optout?a=mone',imgUrl:'//a248.e.akamai.net/f/248/45380/60m/dac1.download.akamai.com/45379/poi/m1/privacy/a1ex.png',gifImg:'//a248.e.akamai.net/f/248/45380/60m/dac1.download.akamai.com/45379/poi/m1/privacy/1x1.gif'};createDiv()})();