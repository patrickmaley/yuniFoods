<!-- Creates a modal when a picture is clicked-->

 $('.pop').on('click', function() {
        $('.imagepreview').attr('src', $(this).find('img').attr('src'));
        $('#imagemodal').modal('show');   
});
$(document).ready(function () {

var menu = $('.menu');
var origOffsetY = menu.offset().top;

function scroll() {
    if ($(window).scrollTop() >= origOffsetY) {
        $('.menu').addClass('navbar-fixed-top');
        $('.content').addClass('menu-padding');
    } else {
        $('.menu').removeClass('navbar-fixed-top');
        $('.content').removeClass('menu-padding');
    }


   }

  document.onscroll = scroll;

});

