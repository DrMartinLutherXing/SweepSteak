// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './priced.sol';
import './Investor.sol';

/**
 * @title
 * @dev Implements voting process along with vote delegation
 */
contract SweepSteaks is priced {

    struct Contestant {

        // that person already voted
        bool submitted;
        bool claimed;

        // id of submitted bracket
        uint256 bracket_id;

    }


    // Gather: Contestants can submit brackets
    // Active: The Tournament is taking place
    //  Ended: The Tournament has completed and scoring begins
    //  Claim: Scoring has completed; Contests can claim interest
    enum Phase { Gather, Active, Ended, Claim }
    Phase public phase;

    error InvalidPhase();
    modifier inPhase(Phase _phase) {
        if (phase != _phase)
            revert InvalidPhase();
        _;
    }

    address public chairperson;
    error OnlyChair();
    error NotChair();
    modifier onlyChair() {
        if (msg.sender != chairperson)
            revert OnlyChair();
        _;
    }
    modifier notChair() {
        if (msg.sender == chairperson)
            revert NotChair();
        _;
    }

    mapping(address => Contestant) public contestants;
    error ContestantSubmitted();
    modifier notSubmitted() {
        // Will this be undefined (error?)
        if (contestants[msg.sender].submitted)
            revert ContestantSubmitted();
        _;
    }
    error ContestantHasNotSubmitted();
    modifier hasSubmitted() {
        // Will this be undefined (error?)
        if (!contestants[msg.sender].submitted)
            revert ContestantHasNotSubmitted();
        _;
    }
    error ContestantClaimed();
    modifier notClaimed() {
        // Will this be undefined (error?)
        if (contestants[msg.sender].claimed)
            revert ContestantClaimed();
        _;
    }

//    bytes32[] Teams;

    // PUBLIC CONTRACT VARIABLES
    uint public submissionPrice;
    uint public totalWinnings;
    uint public totalAnte;

    uint256 public totalGames      = 3;
    uint256 public numBrackets     = 0;
    uint256 public totalWinners    = 0;

    error GamesLength();
    error GamesValue();

    struct Bracket {
        uint8[] games;
    }
    Bracket bracket;

    Bracket[] brackets;

    Investor public investor; /* ONLY PUBLIC FOR TEST!!!! */

    modifier validGamesLength(uint8[] memory games) {
        if (games.length != totalGames)
            revert GamesLength();
        _;
    }

    modifier validGamesValues(uint8[] memory games) {
        for (uint i = 0; i < games.length; i++)
            if (games[i] > totalGames)
                revert GamesValue();
        _;
    }

    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    constructor(uint price, uint games) {

        totalGames = games;
        submissionPrice = price;

        chairperson = msg.sender;
        phase = Phase.Gather;

    }


    receive()
        payable external
    {

        if (msg.sender == address(investor)) {

            phase = Phase.Claim;

            totalWinnings = address(this).balance - totalAnte;

            uint chairCut = totalWinnings / 10;

            totalWinnings -= chairCut;

            payable(chairperson).transfer(chairCut);

        }

    }


    function claim()
        public
        notClaimed
        hasSubmitted
    {

        Contestant storage claimee = contestants[msg.sender];
        claimee.claimed = true;

        uint winnings = submissionPrice;

        if (isWinningBracket(claimee.bracket_id)) {

            winnings += totalWinnings / totalWinners;

        }

        payable(msg.sender).transfer(winnings);

    }


    function invest()
        private
    {

        /*
        TODO (after some tests):
        - make sure balance = totalAnte
        - else (and probs in other error cases) return everyone's money
        */

        investor = (new Investor){value: address(this).balance}();

    }


    function deliver() /* only for testing! */
        public
        onlyChair
    {

        investor.deliver();

    }


    function setActive()
        public
        inPhase(Phase.Gather)
        onlyChair
    {

        phase = Phase.Active;

        invest();

    }

    function newContestant()
        private
    {

        Contestant storage submitee = contestants[msg.sender];

        submitee.bracket_id = numBrackets;
        submitee.submitted = true;

    }

    function getBracket()
        public
        view
        hasSubmitted
        returns (uint8[] memory games)
    {

        Contestant memory submitter = contestants[msg.sender];

        games = brackets[submitter.bracket_id].games;

    }

    // Contestants Call
    function submitBracket(uint8[] memory games)
        public
        payable
        inPhase(Phase.Gather)
        notChair
        notSubmitted
        costs(submissionPrice)
    {

        totalAnte += submissionPrice;

        newContestant();

        newBracket(games);

    }

    function submitResults(uint8[] memory results)
        public
        inPhase(Phase.Active)
        onlyChair
    {

        newBracket(results);

        phase = Phase.Ended;

        findWinningBrackets();

    }


    /**
     */
    function newBracket(uint8[] memory games)
        private
        validGamesLength(games)
        //validGamesValues(games)
    {

        Bracket storage _bracket = bracket;
        _bracket.games = games;

        // set contestants bracket
        numBrackets++;
        brackets.push(_bracket);

    }

    function isWinningBracket(uint bracketIndex)
        private view
        returns (bool isWinner)
    {

        uint8[] memory Results = brackets[numBrackets-1].games;

        // compare results and bracket values
        Bracket memory _bracket = brackets[bracketIndex];
        isWinner = true;

        for (uint r = 0; r < Results.length; r++) {

            if (_bracket.games[r] != Results[r]) {
                isWinner = false;
                break;
            }

        }

    }


    /**
     */
    function findWinningBrackets()
        private
        inPhase(Phase.Ended)
    {

        uint256 winningBracketCount = 0;

        for (uint b = 0; b < brackets.length-1; b++) {

            // increment total count
            if (isWinningBracket(b))
                winningBracketCount++;

        }

        totalWinners = winningBracketCount;

    }

}

