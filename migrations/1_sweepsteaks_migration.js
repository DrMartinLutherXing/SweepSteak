const SweepSteaks = artifacts.require("SweepSteaks");

module.exports = function(deployer) {

	deployer.deploy(SweepSteaks, "1000000000000000000", 3);

};

