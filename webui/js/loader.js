CT.require("CT.all");
CT.require("core.config");

var teams = ["a", "b", "c", "d", "e", "f", "g", "h",
			 "i", "j", "k", "l", "m", "n", "o", "p"];

var brak = function(teams, outres) {
	var tlen = teams.length, t2 = tlen / 2,
		n, rcell, b1, b2;
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
};

CT.onload(function() {
	CT.initCore();
	CT.dom.setMain(brak(teams));
});