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
		let phase = await sweste.phase();
		var pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			0,
			"phase should be Gather (0)"
		);
		for (var i = 1; i < 6; i++)
			await sweste.submitBracket(brax[i], { from: accounts[i] });
		let numBrax = await sweste.numBrackets();
		var num = numBrax.toNumber();
		console.log("brax:", num);
		assert.equal(
			num,
			i,
			"brax counted wrong!"
		);
	});
	it("should shift to active phase", async () => {
		let sweste = await SweepSteaks.deployed();
		let phase = await sweste.phase();
		var pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			0,
			"phase should be Gather (0)"
		);
		await sweste.setActive({ from: accounts[0] });
		let phase2 = await sweste.phase();
		pnum = phase2.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			1,
			"phase should be Active (1)"
		);
	});
	it("should accept results submission", async () => {
		let sweste = await SweepSteaks.deployed();
		let phase = await sweste.phase();
		var pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			1,
			"phase should be Active (1)"
		);
		await sweste.submitResults([1, 3, 3], { from: accounts[0] });
		let phase2 = await sweste.phase();
		pnum = phase2.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			2,
			"phase should be Ended (2)"
		);
	});
	it("should find winning brackets", async () => {
		let sweste = await SweepSteaks.deployed();
		let phase = await sweste.phase();
		var pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			2,
			"phase should be Ended (2)"
		);
		let winnerCount = await sweste.findWinningBrackets({ from: accounts[0] });
		if (winnerCount == 2)
			console.log("great! it counted right.");
		else
			console.log("great! it didn't work.");
	});
});