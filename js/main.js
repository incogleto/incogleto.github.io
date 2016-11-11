$("#banner-text").addClass("load");

$("#menuIcon").click(function(){
	$(".small-nav").toggleClass("dropOpen");
	console.log("click");
})

$('a[href*=\\#]').on('click', function(event){     
    event.preventDefault();
    $('html,body').animate({scrollTop:$(this.hash).offset().top-70}, 500);
});

function collapseNavbar() {
    if ($(".main-nav").offset().top > 100) {
        $(".main-nav").addClass('scroll-nav');
    } else {
        $(".main-nav").removeClass('scroll-nav');
    }
}

$(window).scroll(collapseNavbar);