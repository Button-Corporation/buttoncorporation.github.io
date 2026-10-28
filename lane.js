(function () {
	'use strict';

	var Field = document.getElementById('Field');
	var Ctx = Field.getContext('2d');
	var Stage = document.getElementById('Stage');
	var GoldEl = document.getElementById('Gold');
	var StatsEl = document.getElementById('Stats');

	var Css = getComputedStyle(document.documentElement);
	function Pick(Name) { return Css.getPropertyValue(Name).trim(); }

	var Colors = {
		Ground: Pick('--black'),
		Lane: Pick('--black'),
		Line: Pick('--white'),
		Muted: Pick('--lavendar'),
		Ally: Pick('--lightgreen'),
		Enemy: Pick('--orange'),
		HpRed: Pick('--orange'),
		HpRedDark: Pick('--darkorange'),
		HpGreen: Pick('--lightgreen'),
		BarBack: Pick('--trueblack'),
		Gold: Pick('--orange'),
		FontDisplay: "'Montserrat', sans-serif"
	};

	var Config = {
		WaveSize: 7,
		WaveInterval: 30,
		SpawnGap: 0.7,
		Speed: 80,
		BaseRadius: 11,
		BigScale: 1.5,
		BaseHp: 100,
		BigHpScale: 2,
		AttackInterval: 1,
		DamageMin: 8,
		DamageMax: 14,
		ExecuteFraction: 0.35,
		GoldMin: 10,
		GoldMax: 25,
		EngageGap: 5,
		AvoidReach: 18,
		AvoidStrength: 1.6,
		CrowdPenalty: 26,
		LaneHalfMax: 110,
		LaneTopClear: 100
	};

	var W = 800;
	var H = 290;
	var Dpr = 1;
	var LaneY = 180;
	var LaneHalf = 90;

	var Minions = [];
	var Effects = [];
	var Pending = [];
	var GameTime = 0;
	var WaveClock = 0;
	var Shown = { Gold: -1, Stats: '', Timer: -1 };

	function RandInt(Min, Max) {
		return Min + Math.floor(Math.random() * (Max - Min + 1));
	}

	function Resize() {
		// I don't actually understand what the fuck any of this does I was just told to put this here and it would solve all my problems (and it more or less did)
		var Rect = Stage.getBoundingClientRect();
		W = Math.max(320, Math.floor(Rect.width));
		H = Math.round(Math.min(400, Math.max(320, W * 0.45)));
		Dpr = Math.min(window.devicePixelRatio || 1, 2);
		Field.width = Math.round(W * Dpr);
		Field.height = Math.round(H * Dpr);
		Field.style.height = H + 'px';
		Ctx.setTransform(Dpr, 0, 0, Dpr, 0, 0);
		var OldLaneY = LaneY;
		LaneHalf = Math.min(Config.LaneHalfMax, (H - Config.LaneTopClear) / 2 - 14);
		LaneY = Math.round(Config.LaneTopClear + (H - Config.LaneTopClear) / 2);
		for (var I = 0; I < Minions.length; I++) {
			Minions[I].Y += LaneY - OldLaneY;
			ClampY(Minions[I]);
		}
	}

	function MinY(M) { return LaneY - LaneHalf + M.R + 14; }
	function MaxY(M) { return LaneY + LaneHalf - M.R - 4; }
	function ClampY(M) { M.Y = Math.min(MaxY(M), Math.max(MinY(M), M.Y)); }
	function RandomLaneY(M) { return MinY(M) + Math.random() * (MaxY(M) - MinY(M)); }

	function DoMinionWave() {
		var Teams = ['Ally', 'Enemy'];
		for (var T = 0; T < Teams.length; T++) {
			for (var I = 0; I < Config.WaveSize; I++) {
				Pending.push({
					At: GameTime + I * Config.SpawnGap,
					Team: Teams[T],
					Big: I === Config.WaveSize - 1
				});
			}
		}
	}

	function SpawnMinion(Team, Big) {
		var R = Big ? Config.BaseRadius * Config.BigScale : Config.BaseRadius;
		var MaxHp = Big ? Config.BaseHp * Config.BigHpScale : Config.BaseHp;
		var Spawned = {
			Team: Team,
			Dir: Team === 'Ally' ? 1 : -1,
			X: Team === 'Ally' ? -R - 4 : W + R + 4,
			Y: LaneY,
			R: R,
			Side: Math.random() < 0.5 ? -1 : 1,
			Target: null,
			Attackers: 0,
			Big: Big,
			MaxHp: MaxHp,
			Hp: MaxHp,
			Cooldown: 0.3 + Math.random() * 0.7,
			Flash: 0,
			Dead: false
		};
		Spawned.Y = RandomLaneY(Spawned);
		Minions.push(Spawned);
	}

	function AddRing(M, Color) {
		Effects.push({ Kind: 'Ring', X: M.X, Y: M.Y, R: M.R, Color: Color, Age: 0, Life: 0.35 });
	}

	function AddText(X, Y, Text, Color, Size, Life) {
		Effects.push({ Kind: 'Text', X: X, Y: Y, Text: Text, Color: Color, Size: Size, Age: 0, Life: Life });
	}

	function Strike(Attacker, Target) {
		var Damage = RandInt(Config.DamageMin, Config.DamageMax);
		//Click2.currentTime=0
		//Click2.play()
		Target.Hp -= Damage;
		Target.Flash = 0.1;
		if (Target.Hp <= 0) {
			Target.Hp = 0;
			Target.Dead = true;
			AddRing(Target, Target.Team === 'Ally' ? Colors.Ally : Colors.Enemy);
			UnclickSound.play()
			if (Target.Team === 'Enemy') {
				AddText(Target.X, Target.Y - Target.R - 16, 'missed', Colors.Muted, 12, 0.9);
			}
		}
	}

	function ChooseTarget(M) {
		var Best = null;
		var BestScore = Infinity;
		var CurScore = Infinity;
		for (var I = 0; I < Minions.length; I++) {
			var O = Minions[I];
			if (O.Dead || O.Team === M.Team) continue;
			var Crowd = O.Attackers - (M.Target === O ? 1 : 0);
			var Score = Math.hypot(O.X - M.X, O.Y - M.Y) + Config.CrowdPenalty * Crowd;
			if (O === M.Target) CurScore = Score;
			if (Score < BestScore) { BestScore = Score; Best = O; }
		}
		if (CurScore !== Infinity && BestScore > CurScore * 0.7) return M.Target;
		return Best;
	}

	function Steer(M, DirX, DirY, Target, Dt) {
		var SteerX = 0;
		var SteerY = 0;
		for (var J = 0; J < Minions.length; J++) {
			var O = Minions[J];
			if (O === M || O === Target || O.Dead) continue;
			var Ox = O.X - M.X;
			var Oy = O.Y - M.Y;
			var D = Math.hypot(Ox, Oy) || 1;
			var Gap = D - M.R - O.R;
			if (Gap > Config.AvoidReach) continue;
			if ((Ox * DirX + Oy * DirY) / D < 0.2) continue;
			var Cross = DirX * Oy - DirY * Ox;
			var Sign = Math.abs(Cross) < 0.5 ? M.Side : (Cross > 0 ? -1 : 1);
			var Weight = (Config.AvoidReach - Gap) / Config.AvoidReach;
			SteerX += -DirY * Sign * Weight;
			SteerY += DirX * Sign * Weight;
		}
		var Vx = DirX + SteerX * Config.AvoidStrength;
		var Vy = DirY + SteerY * Config.AvoidStrength;
		var Len = Math.hypot(Vx, Vy) || 1;
		M.X += (Vx / Len) * Config.Speed * Dt;
		M.Y += (Vy / Len) * Config.Speed * Dt;
		ClampY(M);
	}

	function SeparateMinions() {
		for (var Pass = 0; Pass < 2; Pass++) {
			for (var I = 0; I < Minions.length; I++) {
				var P = Minions[I];
				if (P.Dead) continue;
				for (var J = I + 1; J < Minions.length; J++) {
					var Q = Minions[J];
					if (Q.Dead) continue;
					var Dx = Q.X - P.X;
					var Dy = Q.Y - P.Y;
					var D = Math.hypot(Dx, Dy);
					var Need = P.R + Q.R;
					if (D >= Need) continue;
					if (D < 0.001) { Dx = P.Dir; Dy = 0; D = 1; }
					var Push = (Need - D) / 2;
					var Nx = Dx / D;
					var Ny = Dy / D;
					P.X -= Nx * Push;
					P.Y -= Ny * Push;
					Q.X += Nx * Push;
					Q.Y += Ny * Push;
					ClampY(P);
					ClampY(Q);
				}
			}
		}
	}

	function Update(Dt) {
		GameTime += Dt;

		WaveClock -= Dt;
		if (WaveClock <= 0) {
			DoMinionWave();
			WaveClock += Config.WaveInterval;
		}

		for (var P = Pending.length - 1; P >= 0; P--) {
			if (Pending[P].At <= GameTime) {
				SpawnMinion(Pending[P].Team, Pending[P].Big);
				Pending.splice(P, 1);
			}
		}

		for (var A = 0; A < Minions.length; A++) Minions[A].Attackers = 0;
		for (var B = 0; B < Minions.length; B++) {
			var Aim = Minions[B].Target;
			if (Aim && !Aim.Dead) Aim.Attackers++;
		}

		for (var I = 0; I < Minions.length; I++) {
			var M = Minions[I];
			if (M.Dead) continue;
			if (M.Flash > 0) M.Flash -= Dt;

			var Target = ChooseTarget(M);
			M.Target = Target;
			if (Target) {
				var ToX = Target.X - M.X;
				var ToY = Target.Y - M.Y;
				var Dist = Math.hypot(ToX, ToY) || 1;
				if (Dist - M.R - Target.R <= Config.EngageGap) {
					M.Cooldown -= Dt;
					if (M.Cooldown <= 0) {
						Strike(M, Target);
						M.Cooldown += Config.AttackInterval;
					}
					continue;
				}
				Steer(M, ToX / Dist, ToY / Dist, Target, Dt);
			} else {
				Steer(M, M.Dir, 0, null, Dt);
			}
		}
		SeparateMinions();

		for (var K = 0; K < Minions.length; K++) {
			var Q = Minions[K];
			if (Q.Dead) continue;
			if (Q.Team === 'Ally' && Q.X - Q.R > W) Q.Dead = true;
			if (Q.Team === 'Enemy' && Q.X + Q.R < 0) Q.Dead = true;
		}
		Minions = Minions.filter(function (M2) { return !M2.Dead; });

		for (var E = Effects.length - 1; E >= 0; E--) {
			Effects[E].Age += Dt;
			if (Effects[E].Age >= Effects[E].Life) Effects.splice(E, 1);
		}
	}

	function CanvasPoint(Event) {
		var Rect = Field.getBoundingClientRect();
		return {
			X: (Event.clientX - Rect.left) * (W / Rect.width),
			Y: (Event.clientY - Rect.top) * (H / Rect.height)
		};
	}

	function FindExecutable(X, Y) {
		// Really funny name, but executable here means an enemy that can be executed, not a program
		var Best = null;
		var BestDist = Infinity;
		for (var I = 0; I < Minions.length; I++) {
			var M = Minions[I];
			if (M.Team !== 'Enemy' || M.Dead) continue;
			if (M.Hp > M.MaxHp * Config.ExecuteFraction) continue;
			var D = Math.hypot(M.X - X, M.Y - Y);
			if (D <= M.R + 10 && D < BestDist) { Best = M; BestDist = D; }
		}
		return Best;
	}

	Field.addEventListener('pointerdown', function (Event) {
		var Point = CanvasPoint(Event);
		var Target = FindExecutable(Point.X, Point.Y);
		if (!Target) return;
		var Reward = RandInt(Config.GoldMin, Config.GoldMax) * (Target.Big ? 2 : 1);
		addGold(Reward)
		CashSound.currentTime=0
		CashSound.play()
		Target.Dead = true;
		AddRing(Target, Colors.Gold);
		AddText(Target.X, Target.Y - Target.R - 16, '+' + Reward, Colors.Gold, Target.Big ? 20 : 16, 0.9);
		BumpGold();
	});

	Field.addEventListener('pointermove', function (Event) {
		var Point = CanvasPoint(Event);
		Field.style.cursor = FindExecutable(Point.X, Point.Y) ? 'pointer' : 'default';
	});

	function RenderField() {
		Ctx.clearRect(0, 0, W, H);

		var Top = LaneY - LaneHalf;
		var Height = LaneHalf * 2;
		var Radius = 16;
		var EdgeColorWidth=20;
		Ctx.beginPath();
		Ctx.moveTo(Radius, Top);
		Ctx.lineTo(W - Radius, Top);
		Ctx.arcTo(W, Top, W, Top + Radius, Radius);
		Ctx.lineTo(W, Top + Height - Radius);
		Ctx.arcTo(W, Top + Height, W - Radius, Top + Height, Radius);
		Ctx.lineTo(Radius, Top + Height);
		Ctx.arcTo(0, Top + Height, 0, Top + Height - Radius, Radius);
		Ctx.lineTo(0, Top + Radius);
		Ctx.arcTo(0, Top, Radius, Top, Radius);
		Ctx.closePath();
		Ctx.fillStyle = Colors.Lane;
		Ctx.fill();

		//Ctx.save();
		//Ctx.clip();
		//Ctx.fillStyle = Colors.Ally;
		//Ctx.fillRect(0, Top, EdgeColorWidth, Height);
		//Ctx.fillStyle = Colors.Enemy;
		//Ctx.fillRect(W - EdgeColorWidth, Top, EdgeColorWidth, Height);
		//Ctx.restore();

		//Ctx.globalAlpha = 0.2;
		//Ctx.strokeStyle = Colors.Line;
		//Ctx.lineWidth = 1;
		//Ctx.setLineDash([4, 6]);
		//Ctx.beginPath();
		//Ctx.moveTo(Math.round(W / 2) + 0.5, Top + 8);
		//Ctx.lineTo(Math.round(W / 2) + 0.5, Top + Height - 8);
		//Ctx.stroke();
		//Ctx.setLineDash([]);
		//Ctx.globalAlpha = 1;
	}

	function RenderMinion(M) {
		Ctx.beginPath();
		Ctx.arc(M.X, M.Y, M.R, 0, Math.PI * 2);
		Ctx.fillStyle = M.Team === 'Ally' ? Colors.Ally : Colors.Enemy;
		Ctx.fill();
		Ctx.lineWidth = 0;
		Ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
		Ctx.stroke();
		if (M.Flash > 0) {
			Ctx.globalAlpha = Math.min(1, M.Flash / 0.1) * 0.6;
			Ctx.beginPath();
			Ctx.arc(M.X, M.Y, M.R, 0, Math.PI * 2);
			Ctx.fillStyle = '#ffffff';
			Ctx.fill();
			Ctx.globalAlpha = 1;
		}
	}

	function RenderBar(M) {
		var BarW = M.Big ? 46 : 30;
		var BarH = 5;
		var X0 = Math.round(M.X - BarW / 2);
		var Y0 = Math.round(M.Y - M.R - 12);
		var Frac = Math.max(0, M.Hp / M.MaxHp);

		Ctx.fillStyle = Colors.BarBack;
		Ctx.fillRect(X0, Y0, BarW, BarH);

		if (M.Team === 'Ally') {
			Ctx.fillStyle = Colors.HpGreen;
			Ctx.fillRect(X0, Y0, Math.round(BarW * Frac), BarH);
			return;
		}

		var Zone = Config.ExecuteFraction;
		var ZoneW = Math.round(BarW * Math.min(Frac, Zone));
		Ctx.fillStyle = Colors.HpRedDark;
		Ctx.fillRect(X0, Y0, ZoneW, BarH);
		if (Frac > Zone) {
			var FullW = Math.round(BarW * Frac);
			var ZoneEdge = Math.round(BarW * Zone);
			Ctx.fillStyle = Colors.HpRed;
			Ctx.fillRect(X0 + ZoneEdge, Y0, FullW - ZoneEdge, BarH);
		}
	}

	function RenderEffects() {
		Ctx.textAlign = 'center';
		Ctx.textBaseline = 'middle';
		for (var I = 0; I < Effects.length; I++) {
			var F = Effects[I];
			var T = F.Age / F.Life;
			if (F.Kind === 'Ring') {
				Ctx.globalAlpha = 1 - T;
				Ctx.beginPath();
				Ctx.arc(F.X, F.Y, F.R + T * 14, 0, Math.PI * 2);
				Ctx.lineWidth = 5;
				Ctx.strokeStyle = F.Color;
				Ctx.stroke();
			} else {
				Ctx.globalAlpha = T < 0.6 ? 1 : 1 - (T - 0.6) / 0.4;
				Ctx.font = '500 ' + F.Size + 'px ' + Colors.FontDisplay;
				//Ctx.lineWidth = 4;
				//Ctx.lineJoin = 'round';
				//Ctx.strokeStyle = Colors.Ground;
				//Ctx.strokeText(F.Text, F.X, F.Y - T * 18);
				Ctx.fillStyle = F.Color;
				Ctx.fillText(F.Text, F.X, F.Y - T * 18);
			}
		}
		Ctx.globalAlpha = 1;
	}

	function Render() {
		RenderField();
		var Sorted = Minions.slice().sort(function (A, B) { return A.Y - B.Y; });
		for (var I = 0; I < Sorted.length; I++) RenderMinion(Sorted[I]);
		for (var J = 0; J < Sorted.length; J++) if (Sorted[J].Team === 'Ally') RenderBar(Sorted[J]);
		for (var K = 0; K < Sorted.length; K++) if (Sorted[K].Team === 'Enemy') RenderBar(Sorted[K]);
		RenderEffects();
	}

	function SyncHud() {
		if (Shown.Gold !== getGold()) {
			Shown.Gold = getGold();
			GoldEl.textContent = String(getGold());
		}
	}

	var LastStamp = performance.now();
	function Frame(Now) {
		var Dt = Math.min(0.05, Math.max(0, (Now - LastStamp) / 1000));
		LastStamp = Now;
		Update(Dt);
		Render();
		SyncHud();
		requestAnimationFrame(Frame);
	}

	Resize();
	if (window.ResizeObserver) {
		new ResizeObserver(Resize).observe(Stage);
	} else {
		window.addEventListener('resize', Resize);
	}
	requestAnimationFrame(Frame);
})();
