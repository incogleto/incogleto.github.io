//Animate banner-text
$("#banner-text").addClass("load");

//mobile nav
$("#menuIcon").click(function(){
	$(".small-nav").toggleClass("dropOpen");
})

//scrollspy
$('a[href*=\\#]').on('click', function(event){
    event.preventDefault();
    $('html,body').animate({scrollTop:$(this.hash).offset().top-70}, 500);
});

//resize nav on scroll
function collapseNavbar() {
    if ($(".main-nav").offset().top > 100) {
        $(".main-nav").addClass('scroll-nav');
				highlight.style.height = `52px`;
				highlight.style.borderRadius = `0%`;
				bottomBounds = 52;
    } else {
        $(".main-nav").removeClass('scroll-nav');
				highlight.style.height = `70px`;
				highlight.style.borderRadius = `0 0 30% 30%`;
				bottomBounds = 72;
    }
}

$(window).scroll(collapseNavbar);


//nav highlight
const menuItems = document.querySelectorAll('.menuItems');
const highlight = document.createElement('span');
var leftBounds = menuItems.item(menuItems.length-1).getBoundingClientRect().left-10;
var bottomBounds = 100;
highlight.classList.add('hl');
highlight.classList.add('hidden');
highlight.style.transform = `translateX(${leftBounds}px)`;
document.body.append(highlight);

function highlightNav(){
	highlight.classList.remove('hidden');
	highlight.style.opacity = `100`;
	const coords = this.getBoundingClientRect();
	const normalizedCoords = {
		width: coords.width,
		height: coords.height + 2,
		top: 0,
		left: coords.left + window.scrollX - 10
	};

	highlight.style.width = `${normalizedCoords.width}px`;
	highlight.style.height = `${normalizedCoords.height}px`;
	highlight.style.transform = `translate(${normalizedCoords.left}px, ${normalizedCoords.top}px)`;
}

function hideHighlight(e){
	e = e || window.event;
	if(e.clientY > bottomBounds || e.clientX < leftBounds)
		highlight.style.opacity = `0`;
	else
		highlight.style.opacity = `100`;
}

menuItems.forEach(a => a.addEventListener('mouseenter', highlightNav));
document.addEventListener('mousemove', hideHighlight);

//banner particles
particles = {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": "#ffffff"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 128.27296486924183,
      "color": "#ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 1,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "grab"
      },
      "onclick": {
        "enable": false,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
}

particlesJS('particle-js', particles, function() {
  console.log('callback - particles.js config loaded');
});

var options = [
	{
		selector: '#banner',
		vh: 100
	}
]

//mobile vh fix
var vhFix = new VHChromeFix(options)
