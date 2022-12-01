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

    uint submissionPrice;

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

    uint256 totalGames = 3;

    error GamesLength();
    error GamesValue();

    struct Bracket {
        uint8[] games;
    }
    Bracket bracket;

    uint256 public numBrackets;
    Bracket[] brackets;
    Bracket ResultBracket;

    Investor investor;

    modifier validGamesLength(uint8[] memory games) {
        if (games.length != totalGames)
            revert GamesLength();
        _;
    }

    modifier validGamesValues(uint8[] memory games) {
        for (uint i = 0; i < games.length; i++)
            if (games[i] >= totalGames)
                revert GamesValue();
        _;
    }

    uint[] public winningBrackets;

    modifier condition(bool _condition) {
        require(_condition);
        _;
    }

    /**
     */
//    constructor(bytes32[] memory _teams) {
//    constructor(uint price) {
    constructor() {

        //ASSUME Team.length == 2 ^ y;
//        Teams = _teams;
  //      totalGames = Teams.length - 1;

        submissionPrice = 1;//price;

        chairperson = msg.sender;
        phase = Phase.Gather;

    }


    receive()
        payable external
    {

        if (msg.sender == investor) {
            phase = Phase.Claim;
        }

    }


    function claim()
        public
        notClaimed
        hasSubmitted
    {

        // TODO: return ante + (for winners) interest

    }


    function invest()
        private
    {

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

    // Contestants Call
    function submitBracket(uint8[] memory games)
        public
        payable
        inPhase(Phase.Gather)
        notChair
        notSubmitted
        costs(submissionPrice)
    {

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

    /**
     */
    function findWinningBrackets() public view
        inPhase(Phase.Ended)
        returns (uint winningBracketCount)
    {

        uint8[] memory Results = brackets[numBrackets-1].games;

        for (uint b = 0; b < brackets.length-1; b++) {

            // compare results and bracket values
            Bracket memory _bracket = brackets[b];
            bool isWinner = true;

            for (uint r = 0; r < Results.length; r++) {

                if (_bracket.games[r] != Results[r]) {
                    isWinner = false;
                    break;
                }

            }

            //add bracket index to winners array;
            if (isWinner)
                winningBracketCount++;

        }

    }

}

