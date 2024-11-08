var Spin = new Audio("Expand 2.mp3");
var Click = new Audio("Click 1.mp3");
var UnclickSound = new Audio("Big Click 1.mp3");
var Music = new Audio("Slots.wav");
var Win = new Audio("Win.wav");
var NumberOfWins = 0
Music.loop = true
Music.volume = 0.5;
var musicSlider;
var sfxSlider;

function DoSpin() {
    Music.play()
    document.getElementsByClassName("slotbutton")[0].disabled = true;
    document.getElementsByClassName("slotbutton")[0].classList.toggle("pressed")
    document.getElementsByClassName("slotbutton")[0].textContent = "Pressed"

    var slotImages = ["1.png", "2.png", "3.png", "4.png"];
    var r1 = Math.floor((Math.random() * 10));
    var r2 = Math.floor((Math.random() * 10));
    var r3 = Math.floor((Math.random() * 10));
    if (r1 === 0 && r2 === 0 && r3 === 0) {/*do something special*/}; 
    var slotImage1 = (r1 == 0) ? 3 : (r1 % 3 == 0) ? 0 : (r1 % 3 == 1) ? 1 : 2;
    var slotImage2 = (r2 == 0) ? 3 : (r2 % 3 == 0) ? 0 : (r2 % 3 == 1) ? 1 : 2;
    var slotImage3 = (r3 == 0) ? 3 : (r3 % 3 == 0) ? 0 : (r3 % 3 == 1) ? 1 : 2;
    document.getElementById('SlotImage1').src = "Mystery.gif";
    document.getElementById('SlotImage2').src = "Mystery.gif";
    document.getElementById('SlotImage3').src = "Mystery.gif";
    Spin.play()

    setTimeout(function () {
        document.getElementById('SlotImage1').src = slotImages[slotImage1];
        Click.play()
    }, 500);
    setTimeout(function () {
        document.getElementById('SlotImage2').src = slotImages[slotImage2];
        Click.play()
    }, 1000);
    setTimeout(function () {
        document.getElementById('SlotImage3').src = slotImages[slotImage3];
        Click.play()
        CheckWinner(slotImage1, slotImage2, slotImage3);
    }, 1500);
    setTimeout(function () {
        Unclick(slotImage1, slotImage2, slotImage3);
        UnclickSound.play()
    }, 2000);

}

function CheckWinner(x, y, z) {
    if (x == y && x == z) {
        // alert('YOU WIN!');
        Win.play()
        NumberOfWins = NumberOfWins + 1
        document.getElementsByClassName("wintext")[0].textContent = "Wins: " + NumberOfWins
    } else {}
}

function Unclick() {
    document.getElementsByClassName("slotbutton")[0].disabled = false;
    document.getElementsByClassName("slotbutton")[0].classList.toggle("pressed")
    document.getElementsByClassName("slotbutton")[0].textContent = "Button"
}

window.addEventListener('load', function () {
    musicSlider = document.getElementById('musicSlider');
    musicSlider.addEventListener('input', function() {
        Music.volume = this.value;
    });

    sfxSlider = document.getElementById('sfxSlider');
    sfxSlider.addEventListener('input', function() {
        Spin.volume = this.value;
        Click.volume = this.value;
        UnclickSound.volume = this.value;
        Win.volume = this.value;
    });

    document.body.onkeyup = function (e) {
        if (e.key == " " ||
            e.code == "Space" ||
            e.keyCode == 32
        ) {
            if (document.getElementsByClassName("slotbutton")[0].disabled == false) {
                DoSpin()
            }
        }
    }
})





