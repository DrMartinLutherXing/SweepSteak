const SweepSteaks = artifacts.require("SweepSteaks");

const brax = [
	[0, 1, 0],
	[0, 2, 2],
	[1, 3, 3],
	[3, 2, 3],
	[1, 3, 3],
	[2, 3, 1]
]

contract("SweepSteaks", async accounts => {
	it("should accept bracket submissions", async () => {
		let sweste = await SweepSteaks.deployed();
		for (var i = 1; i < 7; i++)
			sweste.submitBracket(brax[i], { from: accounts[i] });
	});
	it("should accept results submission", async () => {
		let sweste = await SweepSteaks.deployed();
		sweste.submitResults([1, 3, 3], { from: accounts[0] });
	});
	it("should find winning brackets", async () => {
		let sweste = await SweepSteaks.deployed();
		let winnerCount = await sweste.findWinningBrackets({ from: accounts[0] });
		if (winnerCount == 2)
			console.log("great! it counted right.");
		else
			console.log("great! it didn't work.");
	});
});