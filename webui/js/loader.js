CT.require("CT.all");
CT.require("core");
CT.scriptImport("https://cdn.ethers.io/lib/ethers-5.2.umd.min.js");

let cfg = core.config.brakker;

let brakker = {
	_: {
		stats: {
			submissionPrice: null,
			totalWinnings: null,
			totalAnte: null,
			totalGames: null,
			totalWinners: null,
			numBrackets: null
		},
		phases: ["Gather", "Active", "Ended", "Claim"],
		get: async function(name) {
			let con = brakker._.contract;
			if (!con) return "(not connected)";
			return await con[name]();
		},
		loadStats: async function(cb) {
			let _ = brakker._, stats = _.stats, s;
			if (!_.contract) {
				for (s in stats)
					stats[s] = "(not connected)";
				stats.phase = "(not connected)";
			}
			else {
				for (s in stats)
					stats[s] = await _.get(s);
				stats.phase = _.phases[await _.get("phase")];
			}
			cb(stats);
		}
	},
	brak: function(teams, outres) {
		let tlen = teams.length, t2 = tlen / 2,
			n, rcell, b1, b2, brak = brakker.brak;
		if (tlen == 1) // pre-final (side final)
			n = CT.dom.div(teams[0], "cell");
		else {
			rcell = CT.dom.div("?", "result cell");
			b1 = brak(teams.slice(0, t2), rcell);
			b2 = brak(teams.slice(t2), rcell);
			n = CT.dom.div([rcell, b1, b2], "cell");
			outres || n.classList.add("outer");
			outres || b2.classList.add("rightbrak");
			b1.onclick = function(e) {
				rcell.innerText = b1.innerText;
				e.stopPropagation();
			};
			b2.onclick = function(e) {
				rcell.innerText = b2.innerText;
				e.stopPropagation();
			};
			rcell.onclick = function(e) {
				if (outres)
					outres.innerText = rcell.innerText;
				else
					alert(rcell.innerText + " wins!");
				e.stopPropagation();
			};
		}
		n.value = function() {
			return (rcell || n).innerText;
		};
		return n;
	},
	stats: function() {
		let n = CT.dom.div();
		brakker._.loadStats(function(stats) {
			CT.dom.setContent(n,
				Object.keys(stats).map(n => n + ": " + stats[n]));
		});
		return n;
	},
	build: function() {
		CT.dom.setMain([
			brakker.brak(cfg.teams),
			brakker.stats()
		]);
	},
	load: function(abi) {
		let _ = brakker._;
		_.contract = new ethers.Contract(cfg.contract, abi, _.provider);
		brakker.build();
	},
	init: function() {
		let _ = brakker._;
		_.provider = new ethers.providers.Web3Provider(window.ethereum);
		cfg.abi ? fetch(cfg.abi).then(resp => resp.json()).then(brakker.load) : brakker.build();
	}
};

CT.onload(function() {
	CT.initCore();
	brakker.init();
});