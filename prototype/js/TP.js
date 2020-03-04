$(document).ready(function(){
    "use strict"; 
	
    	$('#hamburger').on("click", function(){ //https://www.w3schools.com/howto/howto_js_mobile_navbar.asp
            $(this).toggleClass('open');
        });
    
        $('a[href*=\\#]:not([href=\\#]):not(.control-right, .control-left)').on('click', function() {
            if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                  scrollTop: target.offset().top - 100
                }, 1000);
            return false;
          }
        }
      }); 
    
    var bLazy = new Blazy();
    
    $(".js-video-button").modalVideo();
    
    var $animation_elements = $('.animation-element');
    var $window = $(window);

    function check_if_in_view() {
        var window_height = $window.height();
        var window_top_position = $window.scrollTop();
        var window_bottom_position = (window_top_position + window_height);

        $.each($animation_elements, function() {
            var $element = $(this);
            var element_height = $element.outerHeight();
            var element_top_position = $element.offset().top + 150;
            var element_bottom_position = (element_top_position + element_height);

            if ((element_bottom_position >= window_top_position) &&
            (element_top_position <= window_bottom_position)) {
                $element.addClass('in-view');
            }
      });
    }
    $window.on('scroll resize', check_if_in_view);
    $window.trigger('scroll');
    
     lightbox.option({
        'resizeDuration': 300,
        'imageFadeDuration': 300,
        'wrapAround': true
});
            
    var date = new Date().getFullYear();
    document.getElementById("year").innerHTML = date;
    
});