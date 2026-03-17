let slideIndex = 1;
let alertIndex = 0;
displayImages();


// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("demo");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

function displayImages(){
  let i;
  const images = document.getElementsByClassName("mySlides");
  for (i = 0; i < images.length; i++) {
    images[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex> images.length) {
    slideIndex = 1;
  }
  images[slideIndex-1].style.display = "block";
  setTimeout(displayImages, 7000);
}

function showAlert() {
  alertIndex++;
  switch (alertIndex) {
    case 1:
      alert("Thank you for clicking the link, but we would prefer if you contact us directly");
      break;
    case 2:
      alert("It seems like you prefer using the link let me help you... Try again");
      break;
    case 3:
      alert("We are experiencing a higher than usual number of requests, please try again");
      play();
      break;
    case 4:
      alert("Seriously? I thought by this this attempt you would have given up");
      break;
    case 5:
      alert("Alright you win here hang on a moment...");
      break;
    case 6:
      alert("Okay I am just messing with you!");
      break;
    default:
      alert("This is your attempt #"+alertIndex.toString())
      if (alertIndex > 9) {
        alertIndex = 0;
        stop();
        alert("Okay let's start again");
      }
  }
}

function play(){
  let audio = document.getElementById("audio");
  audio.play();
}

function stop(){
  let audio = document.getElementById("audio");
  audio.pause();
  audio.currentTime = 0;
}
