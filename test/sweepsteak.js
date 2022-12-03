const SweepSteaks = artifacts.require("SweepSteaks");
const Investor = artifacts.require("Investor");

const E = 1000000000000000000;
const accrued = 10 * E;

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
		console.log("adding test winnings");
		sweste.sendTransaction({
			from: accounts[0],
			value: accrued
		});

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
        for (let b = 0; b < brax.length; b++)
		    await sweste.submitBracket(brax[b], { from: accounts[b+1], value: E });
		const numBrax = await sweste.numBrackets();
		const num = numBrax.toNumber();
		console.log("brax:", num);
		assert.equal(
			num,
			brax.length,
			"brax counted wrong!"
		);
	});

	it("should have correct balances", async () => {
		const sweste = await SweepSteaks.deployed();

        const expectedBalance = (brax.length * E) + accrued;
        const actualBalance = await web3.eth.getBalance(sweste.address);

		console.log({ actualBalance, expectedBalance });

		assert.equal(
            expectedBalance,
            actualBalance,
			"contract balance should equal expected"
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

	it("should create Investor", async () => {
		const sweste = await SweepSteaks.deployed();
		const investorAddress = await sweste.investor();

		console.log("investor address:", investorAddress);

		assert.ok(
            investorAddress,
			"investor address should exist"
		);

	});

	it("should have correct investor balance", async () => {
		const sweste = await SweepSteaks.deployed();
		const investorAddress = await sweste.investor();

        const expectedBalance = (brax.length * E) + accrued;
        const actualBalance = await web3.eth.getBalance(investorAddress);

		console.log({ actualBalance, expectedBalance });

		assert.equal(
            expectedBalance,
            actualBalance,
			"investor balance should equal expected"
		);

	});

	it("should have sweepsteak owner", async () => {
		const sweste = await SweepSteaks.deployed();
        const swesteAddress = sweste.address;
		const investorAddress = await sweste.investor();

		const investor = await Investor.at(investorAddress);
		const investorOwner = await investor.owner();

		console.log({ investorOwner, swesteAddress });

		assert.equal(
            swesteAddress,
            investorOwner,
			"investor should have sweepsteak contract as owner"
		);

	});


	it("should deliver", async () => {
		const sweste = await SweepSteaks.deployed();
		const investorAddress = await sweste.investor();
		const investor = await Investor.at(investorAddress);

		await investor.deliver({ from: accounts[0] });

		const phase = await sweste.phase();
		const pnum = phase.toNumber();

		console.log("phase:", pnum);

		assert.equal(
			pnum,
			3,
			"phase should be Claim (3)"
		);

	});


	it("should claim", async () => {
		const sweste = await SweepSteaks.deployed();
        for (let b = 0; b < brax.length; b++)
		    await sweste.claim({ from: accounts[b+1] });

/*		console.log("brax:", num);
		assert.equal(
			num,
			brax.length,
			"brax counted wrong!"
		);*/
	});

});
