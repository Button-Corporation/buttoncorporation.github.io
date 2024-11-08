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
    // Plays the music
    // This does nothing if the music is already playing
    // - Owen
    Music.play()

    // This disables the button
    // - Owen
    document.getElementsByClassName("slotbutton")[0].disabled = true;
    document.getElementsByClassName("slotbutton")[0].classList.toggle("pressed")
    document.getElementsByClassName("slotbutton")[0].textContent = "Pressed"

    // The actual pattern that the slot machine uses to decide odds
    // Something appearing twice means it's twice as likely
    // Slot images are named by their number (0 is Peepo)
    // - Owen
    var SlotPattern = [0,1,1,1,2,2,2,3,3,3]

    // Picks a random number from the slot pattern
    // - Owen
    var slotImage1 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
    var slotImage2 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
    var slotImage3 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
    

    // This sets all the slot images to the rolling gif
    // - Owen
    document.getElementById('SlotImage1').src = "Mystery.gif";
    document.getElementById('SlotImage2').src = "Mystery.gif";
    document.getElementById('SlotImage3').src = "Mystery.gif";
    Spin.play()

    setTimeout(function () {
        // Sets the first slot to reveal after 500 ms
        // - Owen
        document.getElementById('SlotImage1').src = slotImage1+".png";
        Click.play()
    }, 500);
    setTimeout(function () {
        // Sets the second slot to reveal after 1000 ms
        // - Owen
        document.getElementById('SlotImage2').src = slotImage2+".png";
        Click.play()
    }, 1000);
    setTimeout(function () {
        // Sets the third slot to reveal after 1500 ms
        // - Owen
        document.getElementById('SlotImage3').src = slotImage3+".png";
        Click.play()
        CheckWinner(slotImage1, slotImage2, slotImage3);
    }, 1500);
    setTimeout(function () {
        // Unpresses the button after 2000 ms
        // - Owen
        Unclick();
        UnclickSound.play()
    }, 2000);

}

function CheckWinner(x, y, z) {
    // Checks for 3 Peepos
    // - Owen
    if (slotImage1 === 0 && slotImage2 === 0 && slotImage3 === 0) {/*do something special*/}; 

    // Checks if you win at all
    // - Owen
    if (x == y && x == z) {
        Win.play()
        NumberOfWins = NumberOfWins + 1
        document.getElementsByClassName("wintext")[0].textContent = "Wins: " + NumberOfWins
    }
}

function Unclick() {
    // Unclicks the button
    // - Owen
    document.getElementsByClassName("slotbutton")[0].disabled = false;
    document.getElementsByClassName("slotbutton")[0].classList.toggle("pressed")
    document.getElementsByClassName("slotbutton")[0].textContent = "Button"
}

window.addEventListener('load', function () {
    // Does the music and sound sliders
    // - Owen
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
        // Makes the space button also roll the slots
        // - Owen
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




