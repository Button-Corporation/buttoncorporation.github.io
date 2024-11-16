const Spin = new Audio("assets/audio/Expand 2.mp3");
const Click = new Audio("assets/audio/Click 1.mp3");
const Click2 = new Audio("assets/audio/Click 1.mp3");
const UnclickSound = new Audio("assets/audio/Big Click 1.mp3");
const Win = new Audio("assets/audio/Win.wav");
const CashSound = new Audio("assets/audio/Cash.mp3");
const ErrorSound = new Audio("assets/audio/Error.wav");
const JungleSound = new Audio("assets/audio/Jungle.wav");
const OpenShopSound = new Audio("assets/audio/Open Shop.wav");
Spin.volume = getSFXVolume();
Click.volume = getSFXVolume();
Click2.volume = getSFXVolume();
UnclickSound.volume = getSFXVolume();
Win.volume = getSFXVolume();
CashSound.volume = getSFXVolume();
Error.volume = getSFXVolume();
OpenShopSound.volume = getSFXVolume();
JungleSound.volume = getSFXVolume();
const Items=[
	"Autoslots",
	"AutoslotsEX",
	"Burn",
	"Peepo",
	"Soul",
	"Speed Jungler",
	"Heartbreak",
	"Eye of the Prophet",
	"Bad Time",
	]
const ItemPrices = {
	"Autoslots":5,
	"AutoslotsEX":35,
	"Burn":100,
	"Peepo":80,
	"Soul":25,
	"Speed Jungler":40,
	"Heartbreak":50,
	"Eye of the Prophet":100,
	"Bad Time":20,
};
const ItemCooldowns = {
	"Autoslots":5*60, // 5 minutes
	"AutoslotsEX":30*60, // 30 minutes
	"Burn":10*60, // 10 minutes
	"Peepo":10*60, // 10 minutes
	"Soul":10*60, // 10 minutes
	"Speed Jungler":60*60, // 1 hour
	"Heartbreak":10*60, // 10 minutes
	"Eye of the Prophet":2*60, // 2 minutes
	"Bad Time":10*60, // 10 minutes
};

let NumberOfWins = 0
let musicSlider;
let sfxSlider;
let ExpectedButtonBucks = "";
let activeErrorTimeout;
let buttonBucksChangeTimeout;
let typedLetters = "";
let smots = false;
let smotsCount = 0;


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

	if (hasItem("Heartbreak")) {
		// Removes hearts
		// - Owen
		SlotPattern = [0,1,1,1,2,2,2]
	}

	if (hasItem("Peepo")) {
		// Not technically doubled chance, but it's easier to just say "double"
		// - Owen
		SlotPattern = [0,0,1,1,1,2,2,2,3,3,3]
	}

	if (hasItem("Peepo") && hasItem("Heartbreak")) {
		// Not technically worth it
		// but players should at least feel like they haven't been scammed
		// - Owen
		SlotPattern = [0,0,2,2,2,2,1,1,1,1]
	}

	// Picks a random number from the slot pattern
	// - Owen
	let slotImage1 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	let slotImage2 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	let slotImage3 = SlotPattern[Math.floor((Math.random() * SlotPattern.length))];
	

	// This sets all the slot images to the rolling gif
	// - Owen
	document.getElementById('SlotImage1').src = "assets/img/Mystery.gif";
	document.getElementById('SlotImage2').src = "assets/img/Mystery.gif";
	document.getElementById('SlotImage3').src = "assets/img/Mystery.gif";
	Spin.play()

	if (smots) {
		smotsCount++;
		if (smotsCount >= 3) {
			slotImage1 = slotImage2 = slotImage3 = "smots";
			setTimeout(function () {
				Music.pause();
			}, 1500);
			setTimeout(function () {
				Music.pause();
				let box = document.getElementById("slots").children[1];
				let pos = box.children[0].getBoundingClientRect();
				let holder = box.cloneNode(true);
				holder.style.visibility = "hidden";
				box.before(holder);


				box.children[0].remove();
				let video = document.getElementById("slots8Video");
				box.appendChild(video);
				video.hidden = false;
				video.play();

				let style = box.style;
				style.position = "absolute";
				box.classList.add("fullscreen");
				document.body.appendChild(box)
				style.left = `${pos.x}px`;
				style.top = `${pos.y}px`;
				box.animate({
					"top": 0,
					"left": 0,
					"height": "100%",
					"width": "100%"
				}, 2000).onfinish = () => {
					let style = box.style;
					style.left = `0px`;
					style.top = `0px`;
					style.height = "100%"
					style.width = "100%"
				}
			}, 3333);
		}
	}

	setTimeout(function () {
		// Sets the first slot to reveal after 500 ms
		// - Owen
		document.getElementById('SlotImage1').src = `assets/img/slots/${slotImage1}.png`;
		Click.play()
	}, 500);
	setTimeout(function () {
		// Sets the second slot to reveal after 1000 ms
		// - Owen
		document.getElementById('SlotImage2').src = `assets/img/slots/${slotImage2}.png`;
		Click2.play()
	}, 1000);
	setTimeout(function () {
		// Sets the third slot to reveal after 1500 ms
		// - Owen
		document.getElementById('SlotImage3').src = `assets/img/slots/${slotImage3}.png`;
		Click.play()
		CheckWinner(slotImage1, slotImage2, slotImage3);
	}, 1500);
	if (smotsCount < 3) {
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
		if(Win.paused) {
			Win.play();
		} else {
			Win.currentTime = 0;
		}
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
	document.getElementsByClassName("button")[0].style.visibility="visible"

	// mister owen do not touch this below
	document.getElementsByClassName("button")[0].disabled = true;
}

function formatBreak() {
	document.getElementsByClassName("button")[0].style.visibility="hidden"

	// mister owen do not touch this below
	document.getElementsByClassName("button")[0].disabled = true;
}

function futureChange() {
	document.getElementsByClassName("button")[0].classList.toggle("pressed")
	document.getElementsByClassName("button")[0].textContent = "?"
	document.getElementsByClassName("button")[0].style.visibility="visible"

	// mister owen do not touch this below
	document.getElementsByClassName("button")[0].disabled = true;
}

function buttonClick() {
	let timestamp = getTimestamp();
	addButtonBucks(500)
	Click.play()
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


let VoicelineIndex = Math.floor(Math.random() * 20)
function playMerchantVoiceline(Type,MaxLines) {
	Voiceline = new Audio("assets/audio/merchant/" + Type + VoicelineIndex%MaxLines + ".mp3");
	VoicelineIndex+=1
	Voiceline.volume=getSFXVolume();
	Voiceline.play()
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
	playMerchantVoiceline("buy",6)
	setCookie("Item: "+Name, "true", ItemCooldowns[Name]);
	addButtonBucks(-ItemPrices[Name]);
	updateShop();
}

function updateShop() {
	for (var i = Items.length - 1; i >= 0; i--) {
		if (hasItem(Items[i])) {
			document.getElementsByClassName("Item: "+Items[i])[0].src="assets/img/Items/Purchased.png";
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

function getSFXVolume() {
	let Volume=getCookie("sfxSlider")
	if (Volume=="") {
		return 0.5
	}
	else {
		return Number(Volume)
	}
}
function getMusicVolume() {
	let Volume=getCookie("musicSlider")
	if (Volume=="") {
		return 0.5
	}
	else {
		return Number(Volume)
	}
}

function addButtonBucks(number) {
	let ButtonBucks = getButtonBucks();

	// Verifying button bucks
	if (ExpectedButtonBucks=="") {
		ExpectedButtonBucks=ButtonBucks;
	}
	if (ExpectedButtonBucks!=ButtonBucks) {
		ButtonBucks=Math.min(ButtonBucks,ExpectedButtonBucks);
	}
	ButtonBucks+=number;

	// Button Bucks will expire after 1 year of inactivity I guess
	setCookie("ButtonBucks",String(ButtonBucks),365*60*60*24)
	ExpectedButtonBucks=ButtonBucks;

	document.getElementById("button-bucks").innerText = ButtonBucks.toString();

	let buttonBucksChangeElement = document.getElementById("button-bucks-change");

	let isPositive = number >= 0;
	let symbol = isPositive ? "+" : "";
	buttonBucksChangeElement.innerText = ` (${symbol}${number})`;
	buttonBucksChangeElement.style.color = isPositive ? "#62A583" : "#FF0035";

	if (buttonBucksChangeTimeout) {
		clearTimeout(buttonBucksChangeTimeout);
	}
	buttonBucksChangeTimeout = setTimeout(() => {
		document.getElementById("button-bucks-change").innerText = ""
	},2000);
}

document.getElementById("button-bucks").innerText = getButtonBucks().toString();
ExpectedButtonBucks = getButtonBucks();

function evalCookie() {
	let uuid = getCookie("uuid");
	if (uuid == "") {
		const id = window.crypto.randomUUID();
		setCookie("uuid", id, 365*60*60*24);
	}

	let cookie = getCookie(getTimestamp());
	if (hasItem("Eye of the Prophet")) {
		futureChange();
	} else if (getCookie("Button Broken")!="") {
		formatBreak();
	} else if (cookie == "true") {
		formatChange();
	} else if (cookie == "false") {
		document.getElementsByClassName("button")[0].style.visibility="visible"
		console.log("Changing your mind?");
	} else {
		document.getElementsByClassName("button")[0].style.visibility="visible"
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
	OpenShopSound.play()
	playMerchantVoiceline("enter",5)
	document.getElementsByClassName("open-shop-button")[0].hidden = true
	document.getElementsByClassName("shop-content")[0].hidden = false
}
function farmCamp() {
	JungleSound.play();
	if (hasItem("Speed Jungler")) {
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
	document.getElementsByClassName("button")[0].style.visibility="visible"

}

function registerSmots() {
	let video = document.getElementById("slots8Video");
	video.load()
	video.pause()

	document.onkeydown = function (e) {
		typedLetters = typedLetters.concat(e.key)
		if (!"smots".startsWith(typedLetters)) {
			typedLetters = "";
			return;
		}
		if (typedLetters === "smots") {
			smots = true;
			console.warn("smots gaming")
		}
	}
}


function getTimestamp() {
	return 1731683588;
}

function getTodayButton() {
	return ["You get 500 button bucks.",""]
}

function getTomorrowButton() {
	return ["Your appearance changes into whoever you want, but...","that person dies and nobody remembers what they looked like when they were alive."]
}