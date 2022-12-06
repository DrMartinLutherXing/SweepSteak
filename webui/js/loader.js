CT.require("CT.all");
CT.require("core");
CT.scriptImport("https://cdn.ethers.io/lib/ethers-5.2.umd.min.js");

let cfg = core.config.brakker;

let brakker = {
	_: {},
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
	build: function() {
		CT.dom.setMain(brakker.brak(cfg.teams));
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