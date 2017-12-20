var nameSpace = Helper || {};

( function () {
  "use strict";
  
  var timeline;
  var tl, bg;
  var wrapper, clickThrough, background, 
      logo, copy, cta, cta_text, cta_arrow, f1_copy1, 
      f2_copy1, f3_copy1, productLogo, 
      video, video_namespaced, video_src, video_poster;
  
  nameSpace.init = function () {
    // Initialize any variables here
    wrapper = nameSpace.$( '#wrapper' );
    clickThrough = document.getElementById('click_through');
    background = nameSpace.$( '#bg' );
    logo = nameSpace.$( '#logo' );
    f1_copy1 = nameSpace.$( '#f1_copy1' );
    f2_copy1 = nameSpace.$( '#f2_copy1' );
    f3_copy1 = nameSpace.$( '#f3_copy1' );
    video = nameSpace.$( '#video_container');
    video_namespaced = nameSpace.$( '#video_ad' );
    cta = nameSpace.$( '#cta' );
    cta_text = nameSpace.$( ' #cta_text');
    cta_arrow = nameSpace.$( '#cta_arrow');
    productLogo = nameSpace.$( '#product_logo');

    // Content Variables set through Dynamic feed
    video_src = "en_gopro.mp4";
    video_poster = "en_poster.jpg";

    // CSS Variables set through Dynamic Feed
    background[0].style.backgroundImage = "url(bg.jpg)";
    background[0].style.transform = "scale3d(1.2, 1.2, 1) translateX(-82px) translateY(-2px) rotate(10deg)";
    background[0].style.width =  "465px";
    background[0].style.height = "440px";
    // productLogo[0].style.backgroundImage = "url(productLogo.png)";
    logo[0].style.backgroundImage = "url(logos.png)";
    f1_copy1[0].style.backgroundImage = "url(edit.png)";
    f2_copy1[0].style.backgroundImage = "url(video.png)";
    f3_copy1[0].style.backgroundImage = "url(voice.png)";
    cta_text[0].innerText = "詳しく見る";
    cta_text[0].style.fontSize = "12px";
    cta_text[0].style.bottom = "16px";
    cta_text[0].style.left = "204px";
    cta_text[0].style.letterSpacing ="0pt";
    cta_arrow[0].style.width = "15px";
    cta_arrow[0].style.right = "18px";
    cta_arrow[0].style.bottom = "16.5px";
    cta_arrow[0].src = "cta_arrow.png"

    wrapper.addClass( 'show' );

    nameSpace.initClickTag();
    nameSpace.initAnimation();


    if ( Enabler.isInitialized() ) {
      nameSpace.startAnimation();
    } else {
      Enabler.addEventListener( studio.events.StudioEvent.INIT, nameSpace.startAnimation );
    }
  };

  nameSpace.initClickTag = function () {
    // clickThrough.onclick = function () {
    //  Enabler.exitOverride("Background Exit", "http://www.amazon.com/coke?tag=coke-summer-media-20"); 
    // };   
  };

  nameSpace.initAnimation = function () {

    // Animation Varaibles Set Through Dynamic Feed
    var backgroundEndLocationX = "-71px";
    var backgroundEndLocationY = "-104px";
    var backgroundAnimateSpeed = "9";
    var backgroundEase = "Sine.easeOut";
    var backgroundStartDelay = ".5";

    // Icons during Animation Set Through Dynamic Feed
    var frame1FadeDelay = 2.2;
    var frame2FadeDelay = 2.2;
    var frame3FadeDelay = 2.2;


    bg = new TimelineMax();
    tl = new TimelineMax({
      // onStart: tl_bg.play(),
      onComplete: nameSpace.onAnimationComplete
    });
    tl.pause();

      tl.set([f1_copy1, f2_copy1, f3_copy1, cta, video], { autoAlpha: 0 })
        .to([f1_copy1], .4, { autoAlpha: 1 })
        .to(f1_copy1, .1, { autoAlpha: 0, delay: frame1FadeDelay })
        .to(f2_copy1, .4, { autoAlpha: 1 })
        .to(f2_copy1, .1, { autoAlpha: 0, delay: frame2FadeDelay })
        .to(f3_copy1, .4, { autoAlpha: 1 })
        .to(f3_copy1, .1, { autoAlpha: 0, delay: frame3FadeDelay })
        .to([f1_copy1, cta], .3, { autoAlpha: 1});

      bg.pause();
      bg.to(background, backgroundAnimateSpeed, 
        { x: backgroundEndLocationX, 
          y: backgroundEndLocationY, 
          ease: backgroundEase, 
          delay: backgroundStartDelay,
          scale: .8,
          rotate: "10deg"
        })

  };


  nameSpace.startAnimation = function () {
    tl.play();   // Play Icon Animation
    bg.play();   // Play Background Animation
  };

  nameSpace.onAnimationComplete = function () {
    // Log duration of timeline
    // console.log( 'Animation Duration: ' + timeline.time() + 's' );
  };
} ) ();
