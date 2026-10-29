"""
The shop and secret shop have a lot of repetitive and duplicate code.
This script aims to automate that to reduce workload and reduce mistakes.

TODO:
- Make the cooldowns and prices in the code update to reflect this automatically.
"""

ItemDict={}


class Item:
	def __init__(
		self,
		Name="Peepo2X",
		Description="This item has no description",
		Cost=35,
		CooldownMinutes=10,
		ItemType="Weapon"
		):
		# Initialization
		self.CooldownMinutes=CooldownMinutes
		self.Name=Name
		self.Type=ItemType
		self.Cost=Cost
		self.Description=Description
		ItemDict[self.Name]=self
	def GetMobaDiv(self):
		return f"""
			<div class="moba-item">
				<img draggable=false class="Item: {self.Name}" onclick="buyMobaItem('{self.Name}')" src="assets/img/Items2/{self.Name}.png" style="width:128px;height:128px;">
				<p>{self.Cost*10}</p>
				<span class="tooltiptext">
					<img draggable=false src="assets/img/Items2/{self.Name}.png" style="width:256px;height:256px;">
					<h1> {self.Name} </h1>
					<p> - <i>{self.CooldownMinutes} minute cooldown</i> - </p>
					<p> {self.Description} </p>
				</span>
			</div>
		"""
	def GetNormalDiv(self):
		return f"""
			<div class="{self.Type.lower()}-item">
				<img draggable=false class="Item: {self.Name}" onclick="buyItem('{self.Name}')" src="assets/img/Items/{self.Name}.png" style="width:15vh;height:15vh;">
				<span class="tooltiptext">
					<h1> (${self.Cost}) {self.Name} </h1>
					<p> - <i>{self.CooldownMinutes} minute cooldown</i> - </p>
					<p> {self.Description} </p>
				</span>
			</div>
		"""

WeaponItems=["Autoslots","AutoslotsEX","Heartbreak","Peepo2X"]
SpiritItems=["Soul","Eye of the Prophet","Bad Time"]
VitalityItems=["Speed Jungler","Burn"]
SecretItems=["Diamond Sword","Lovey Dovey","Autoslots","AutoslotsEX","Peepo2X","Heartbreak","Eye of the Prophet","Bad Time"]

Item(
	Name="Autoslots",
	CooldownMinutes=5,
	ItemType="Weapon",
	Cost=5,
	Description="Keep the slots rolling for 5 minutes.",
	)
Item(
	Name="AutoslotsEX",
	CooldownMinutes=30,
	ItemType="Weapon",
	Cost=35,
	Description="Keep the slots rolling for half an hour.",
	)
Item(
	Name="Burn",
	CooldownMinutes=10,
	ItemType="Vitality",
	Cost=100,
	Description="This item does nothing.",
	)
Item(
	Name="Peepo2X",
	CooldownMinutes=10,
	ItemType="Weapon",
	Cost=80,
	Description="Double the number of Peepos in the slot machine.",
	)
Item(
	Name="Soul",
	CooldownMinutes=10,
	ItemType="Spirit",
	Cost=25,
	Description="A fragment of a soul nearly lost. Who knows where it's going?",
	)
Item(
	Name="Speed Jungler",
	CooldownMinutes=60,
	ItemType="Vitality",
	Cost=40,
	Description="Decreases jungle respawn time from 5 minutes to 3 minutes. Lasts 1 hour.",
	)
Item(
	Name="Heartbreak",
	CooldownMinutes=10,
	ItemType="Weapon",
	Cost=50,
	Description="Removes all hearts from the slot machine for 10 minutes.",
	)
Item(
	Name="Eye of the Prophet",
	CooldownMinutes=2,
	ItemType="Spirit",
	Cost=100,
	Description="See the future for a moment.",
	)
Item(
	Name="Bad Time",
	CooldownMinutes=10,
	ItemType="Spirit",
	Cost=20,
	Description="Changes the slot machine music for 10 minutes.",
	)
Item(
	Name="Lovey Dovey",
	CooldownMinutes=5,
	ItemType="Vitality",
	Cost=35,
	Description="All minions have double health for 5 minutes.",
	)
Item(
	Name="Diamond Sword",
	CooldownMinutes=2,
	ItemType="Weapon",
	Cost=25,
	Description="This item doesn't do anything.",
	)

open("shop.html","w").write(f"""---
---
<!DOCTYPE html>
{{% include head.html %}}
<body class="slotsfull">
	{{% include navbar.html active="shop" %}}
	<div class="open-shop-button">
		<button class="slotbutton" onclick="openShop()">Enter Shop</button>
	</div>
	<div class="shop-content" hidden=true>
		<h1> Item Shop </h1>
		<div id="error-message"></div>
		<h2> Weapon </h2>
		<div class="shopbox">
			{''.join(ItemDict[i].GetNormalDiv() for i in WeaponItems)}
		</div>
		<h2> Spirit </h2>
		<div class="shopbox">
			{''.join(ItemDict[i].GetNormalDiv() for i in SpiritItems)}
		</div>
		<h2> Vitality </h2>
		<div class="shopbox">
			{''.join(ItemDict[i].GetNormalDiv() for i in VitalityItems)}
		</div>
		<a href="secretshop" style="color:var(--white);">Secret</a>
	</div>
</body>
<script>var Music = new Audio("assets/audio/Welcome to the Shop.mp3");</script>
<script src="button.js"></script>
<script>
updateShop()
</script>
<script src="music.js"></script>
""")

open("secretshop.html","w").write(f"""---
---
<!DOCTYPE html>
{{% include head.html %}}
<body class="hexfull">
	{{% include navbar.html active="shop" %}}
	<div class="open-shop-button">
		<button class="open-shop-button2" onclick="openShop()">Open Shop</button>
	</div>
	<div class="shop-content" hidden=true>
		<h1> Secret Shop </h1>
		<div id="error-message"></div>
		<h2> Legendary Items </h2>
		<div class="shopbox2">
			{''.join(ItemDict[i].GetMobaDiv() for i in SecretItems)}
		</div>
</body>
<script>var Music = new Audio("assets/audio/Secret Shop.mp3");</script>
<script src="button.js"></script>
<script>
updateShop2()
</script>
<script src="music.js"></script>
""")