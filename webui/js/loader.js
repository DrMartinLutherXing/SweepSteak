CT.require("CT.all");
CT.require("core.config");

var teams = ["a", "b", "c", "d", "e", "f", "g", "h"];

var brak = function(teams) {
	var tlen = teams.length, t2 = tlen / 2;
	if (tlen == 1) // pre-final (side final)
		return CT.dom.div(teams[0], "cell");
	return CT.dom.div([
		CT.dom.div("?", "result cell"),
		brak(teams.slice(0, t2)),
		brak(teams.slice(t2))
	], "cell");
};

CT.onload(function() {
	CT.initCore();
	CT.dom.setMain(brak(teams));
});