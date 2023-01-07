CT.require("CT.all");
CT.require("core");
CT.scriptImport("https://cdn.ethers.io/lib/ethers-5.2.umd.min.js");

const cfg = core.config.brakker;

const brakker = {
	_: {
		stats: {
			submissionPrice: null,
			totalWinnings: null,
			totalAnte: null,
			totalGames: null,
			totalWinners: null,
			numBrackets: null,
			phase: null
		},
		phases: ["Gather", "Active", "Ended", "Claim"],
		get: async function(name) {
			const con = brakker._.contract, rval = "(not connected)";
			if (con) 
				rval = await con[name]();
			return rval;
		},
		loadStats: function(cb) {
			const _ = brakker._, stats = _.stats;
			let s;
			if (_.contract) {
				for (s in stats)
					stats[s] = _.get(s);
				stats.phase = _.phases[stats.phase];
			}
			else
				for (s in stats)
					stats[s] = "(not connected)";
			cb(stats);
		},
		checkSubmission: async function() {
			const _ = brakker._, con = _.contract;
			if (!con)
				return console.log("checkSubmittion: not connected");
			const bracket = await con.getBracket();
			bracket && brakker.show(bracket);
		},
		dosubmit: async function() {
			const _ = brakker._, res = brakker.result(),
				con = _.contract, phase = _.stats.phase;
			console.log(res);
			if (!con)
				return alert("dosubmit: not connected");
			if (phase == "Gather") {
				await con.submitBracket(res, {
					value: _.stats.submissionPrice
				});
			} else if (phase == "Active")
				await con.submitResults(res);
			else if (phase == "Claim")
				await con.claim();
			else
				alert("wrong phase: " + phase);
		},
		submit: function() {
			const _ = brakker._;
			CT.dom.modal(CT.dom.button((_.stats.phase == "Claim") ?
				"claim winnings?" : "submit bracket?", _.dosubmit, "gigantic"));
		}
	},
	brak: function(teams, outres) {
		const tlen = teams.length, t2 = tlen / 2, brak = brakker.brak;
		let n, rcell, b1, b2;
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
				else {
					brakker._.submit();
					alert(rcell.innerText + " wins!");
				}
				e.stopPropagation();
			};
		}
		n.value = function() {
			return (rcell || n).innerText;
		};
		return n;
	},
	result: function() {
		return CT.dom.className("result").map(r=>cfg.teams.indexOf(r.innerHTML));
	},
	show: function(arr) {
		CT.dom.className("result").forEach(function(r, i) {
			CT.dom.setContent(r, cfg.teams[arr[i]]);
		});
	},
	stats: function() {
		const n = CT.dom.div();
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
		brakker._.checkSubmission();
	},
	load: function(abi) {
		const _ = brakker._;
		_.contract = new ethers.Contract(cfg.contract, abi, _.provider);
		brakker.build();
	},
	init: function() {
		const _ = brakker._;
		_.provider = new ethers.providers.Web3Provider(window.ethereum);
		cfg.abi ? fetch(cfg.abi).then(resp => resp.json()).then(brakker.load) : brakker.build();
	}
};

CT.onload(function() {
	CT.initCore();
	brakker.init();
});