const Spin = new Audio("Expand 2.mp3");
const Click = new Audio("Click 1.mp3");
const UnclickSound = new Audio("Big Click 1.mp3");
const Win = new Audio("Win.wav");
const CashSound = new Audio("Cash.wav");
const ErrorSound = new Audio("notenough.wav");
const Items=[
	"Autoslots",
	"AutoslotsEX",
	"Burn",
	"Peepo",
	"Soul",
	"Jungler",
	]
const ItemPrices = {
	"Autoslots":5,
	"AutoslotsEX":35,
	"Burn":100,
	"Peepo":80,
	"Soul":1,
	"Jungler":40,
};
const ItemCooldowns = {
	"Autoslots":5*60,
	"AutoslotsEX":30*60, // 30 minutes
	"Burn":10*60,
	"Peepo":10*60,
	"Soul":10*60,
	"Jungler":60*60, // 1 hour
};

let NumberOfWins = 0
let musicSlider;
let sfxSlider;
let ExpectedButtonBucks = "";
let activeErrorTimeout;


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
	let SlotPattern = [0,1,1,1,2,2,2,3,3,3]

	if (hasItem("Peepo")) {
		// Not technically doubled chance, but it's easier to just say "double"
		// - Owen
		SlotPattern = [0,0,1,1,1,2,2,2,3,3,3]
	}

	// Picks a random number from the slot pattern
	// - Owen
	let slotImage1 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	let slotImage2 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	let slotImage3 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	

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
	setTimeout(function () {
		// Tries the autospin if you have the "Autoslots" item
		// - Owen
		tryAutoSpin()
	}, 3333);
		// 2222 is a good number
		// - Lyra
	// No it's not
	// - Owen
}

function CheckWinner(x, y, z) {
	// Checks for 3 Peepos
	// - Owen
	if (x === 0 && y === 0 && z === 0) {
		addButtonBucks(99)
	}

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

function tryAutoSpin() {
	if ((hasItem("Autoslots")||hasItem("AutoslotsEX")) && document.getElementsByClassName("slotbutton")[0].disabled==false && ExpectedButtonBucks==getButtonBucks()) {
		DoSpin()
	}
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
	setCookie(timestamp, "true", 7 * 24 * 60 * 60);
	fetch("https://api.buttoncorp.org/press/" + getCookie("uuid") + "/" + timestamp);
	console.log("A new player has played.");

}
function setCookie(cname, cvalue, cseconds) {
	const d = new Date();
	d.setTime(d.getTime() + (cseconds * 1000));
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

function displayError(text) {
	if(ErrorSound.paused) {
		ErrorSound.play();
	} else {
		ErrorSound.currentTime = 0;
	}
	document.getElementById("error-message").innerText = text;
	if (activeErrorTimeout) {
		clearTimeout(activeErrorTimeout);
	}
	activeErrorTimeout = setTimeout(() => {
		document.getElementById("error-message").innerText = ""
	},2000);
}

function buyItem(Name) {
	if (hasItem(Name)) {
		displayError("You already own this item!");
		return;
	}
	if (getButtonBucks() < ItemPrices[Name]) {
		displayError("You don't have enough Button Bucks!");
		return;
	}

	CashSound.play();
	setCookie("Item: "+Name, "true", ItemCooldowns[Name]);
	addButtonBucks(-ItemPrices[Name]);
	updateShop();
}

function updateShop() {
	for (var i = Items.length - 1; i >= 0; i--) {
		if (hasItem(Items[i])) {
			document.getElementsByClassName("Item: "+Items[i])[0].src="Items/Purchased.png";
		}
	}
}

function hasItem(Name) {
	return getCookie("Item: "+Name)!=""
}

function getButtonBucks() {
	let ButtonBucks=getCookie("ButtonBucks")
	if (ButtonBucks=="") {
		return 0
	}
	else {
		return Number(ButtonBucks)
	}
}

function addButtonBucks(number) {
	ButtonBucks=getButtonBucks()

	// Verifying button bucks
	if (ExpectedButtonBucks=="") {
		ExpectedButtonBucks=ButtonBucks
	}
	if (ExpectedButtonBucks!=ButtonBucks) {
		ButtonBucks=ExpectedButtonBucks
	}
	ButtonBucks+=number

	// Button Bucks will expire after 1 year of inactivity I guess
	setCookie("ButtonBucks",String(ButtonBucks),365*60*60*24)
	ExpectedButtonBucks=ButtonBucks

	document.getElementsByClassName("bucky")[0].textContent = "Button Bucks: " + ButtonBucks
}

addButtonBucks(0)

function getTimestamp() {
	return 1731352448;
}

function evalCookie() {
	let uuid = getCookie("uuid");
	if (uuid == "") {
		const id = window.crypto.randomUUID();
		setCookie("uuid", id, 365*60*60*24);
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
	setCookie(timestamp, false, 365*60*60*24);
	fetch("https://api.buttoncorp.org/open/" + getCookie("uuid") + "/" + timestamp);
	console.log("A new player has entered.");
}
function openShop() {
	Music.play()
	document.getElementsByClassName("open-shop-button")[0].hidden = true
	document.getElementsByClassName("shop-content")[0].hidden = false
}
function farmCamp() {
	if (hasItem("Jungler")) {
		setCookie("Jungle","Farmed",60*3)
	}
	else {
		setCookie("Jungle","Farmed",60*5)
	}
	addButtonBucks(10)
	updateJungle()
}
function updateJungle() {
	if (getCookie("Jungle")=="Farmed") {
		document.getElementsByClassName("button")[0].classList.toggle("pressed")
		document.getElementsByClassName("button")[0].textContent = "Farmed"
		document.getElementsByClassName("button")[0].disabled = true;
	}
}
