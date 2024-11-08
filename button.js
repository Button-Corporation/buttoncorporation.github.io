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
		// Unpresses the button after 1750 ms
		// - Owen
		Unclick();
		UnclickSound.play()
	}, 1750);

}

function CheckWinner(x, y, z) {
	// Checks for 3 Peepos
	// - Owen
	if (x === 0 && y === 0 && z === 0) {
		addButtonBucks(99)
	}; 

	// Checks if you win at all
	// - Owen
	if (x == y && x == z) {
		Win.play()
		NumberOfWins = NumberOfWins + 1
		addButtonBucks(1)
		document.getElementsByClassName("wintext")[0].textContent = "Session Wins: " + NumberOfWins
	}
}

function Unclick() {
	// Unclicks the button
	// - Owen
	document.getElementsByClassName("slotbutton")[0].disabled = false;
	document.getElementsByClassName("slotbutton")[0].classList.toggle("pressed")
	document.getElementsByClassName("slotbutton")[0].textContent = "Button"
}

function formatChange() {
	document.getElementsByClassName("button")[0].classList.toggle("pressed")
	document.getElementsByClassName("button")[0].textContent = "Pressed"

	// mister owen do not touch this below
	document.getElementsByClassName("button")[0].disabled = true;
}

function buttonClick() {
	let timestamp = getTimestamp();
	formatChange();
	setCookie(timestamp, "true", 7);
	fetch("https://api.buttoncorp.org/press/" + getCookie("uuid") + "/" + timestamp);
	console.log("A new player has played.");

}
function setCookie(cname, cvalue, cdays) {
	const d = new Date();
	d.setTime(d.getTime() + (cdays * 24 * 60 * 60 * 1000));
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for (let i = 0; i < ca.length; i++) {
	let c = ca[i];
	while (c.charAt(0) == ' ') {
		c = c.substring(1);
	}
	if (c.indexOf(name) == 0) {
		return c.substring(name.length, c.length);
	}
	}
	return "";
}

function getButtonBucks() {
	let ButtonBucks=getCookie("ButtonBucks")
	console.log(ButtonBucks)
	if (ButtonBucks=="") {
		return 0
	}
	else {
		return Number(ButtonBucks)
	}
}

function addButtonBucks(number) {
	ButtonBucks=getButtonBucks()
	// console.log(ButtonBucks)
	ButtonBucks+=number

	// Button Bucks will expire after 1 year of inactivity I guess
	setCookie("ButtonBucks",String(ButtonBucks),365)

	document.getElementsByClassName("bucky")[0].textContent = "Button Bucks: " + ButtonBucks
}

addButtonBucks(0)

function getTimestamp() {
	return 1731041837;
}

function evalCookie() {
	let uuid = getCookie("uuid");
	if (uuid == "") {
		const id = window.crypto.randomUUID();
		setCookie("uuid", id, 365);
	}

	let cookie = getCookie(getTimestamp());
	if (cookie == "true") {
		formatChange();
	} else if (cookie == "false") {
		console.log("Changing your mind?");
	} else {
		notifyLoad(getTimestamp());
	}
}
function notifyLoad(timestamp) {
	setCookie(timestamp, false, 365);
	fetch("https://api.buttoncorp.org/open/" + getCookie("uuid") + "/" + timestamp);
	console.log("A new player has entered.");
}