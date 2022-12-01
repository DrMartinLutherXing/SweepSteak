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

	it("should be in phase 0", async () => {
		const sweste = await SweepSteaks.deployed();
		const phase = await sweste.phase();
		const pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			0,
			"phase should be Gather (0)"
		);
    });

	it("should have 0 bracket submissions", async () => {
		const sweste = await SweepSteaks.deployed();
		const numBrax = await sweste.numBrackets();
		const num = numBrax.toNumber();
		console.log("brax:", num);
		assert.equal(
			num,
            0,
			"brax counted wrong!"
		);
    });

	it("should accept bracket submissions", async () => {
		const sweste = await SweepSteaks.deployed();
        const meta = sweste;
        for (let b = 0; b < brax.length; b++)
		    await meta.submitBracket(brax[b], { from: accounts[b+1], value: 1 });
		const numBrax = await meta.numBrackets();
		const num = numBrax.toNumber();
		console.log("brax:", num);
		assert.equal(
			num,
			brax.length,
			"brax counted wrong!"
		);
	});

	it("should shift to active phase", async () => {
		const sweste = await SweepSteaks.deployed();
		await sweste.setActive({ from: accounts[0] });
		const phase = await sweste.phase();
		const pnum = phase.toNumber();
		console.log("phase:", pnum);
		assert.equal(
			pnum,
			1,
			"phase should be Active (1)"
		);
	});

	it("should accept the result submission", async () => {
		const sweste = await SweepSteaks.deployed();
		await sweste.submitResults([1, 3, 3], { from: accounts[0] });
		const phase = await sweste.phase();
		const pnum = phase.toNumber();
		console.log("phase:", pnum);

		assert.equal(
			pnum,
			2,
			"phase should be Ended (2)"
		);

	});

	it("should find winning brackets", async () => {
		const sweste = await SweepSteaks.deployed();
		const phase = await sweste.phase();
		const pnum = phase.toNumber();
		const winnerCount = await sweste.totalWinners();
		const wnum = winnerCount.toNumber();

		console.log("winnerCount:", wnum, "phase:", pnum);

		assert.equal(
			wnum,
			2,
			"winner count should be 2"
		);

	});

	it("should deliver", async () => {
		const sweste = await SweepSteaks.deployed();
		await sweste.deliver();
		const phase = await sweste.phase();
		const pnum = phase.toNumber();

		console.log("phase:", pnum);

		assert.equal(
			pnum,
			3,
			"phase should be Claim (3)"
		);

	});

});
