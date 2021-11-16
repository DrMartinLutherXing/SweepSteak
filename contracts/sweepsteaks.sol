// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;



struct Contestant {
    
    // that person already voted
    bool submitted;
    bool claimed;
    
    // id of submitted bracket
    uint8 bracket_id;
    
}

/** 
 * @title 
 * @dev Implements voting process along with vote delegation
 */
contract Sweepstakes {
    
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
    error NotChar();
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
    
    /*struct Bracket {
        
        uint8 one_one;
        uint8 one_two;
        uint8 two_one;

    }*/
    
    bytes32[] Teams;

    uint numBrackets;

    uint8 totalGames;
    uint8[totalGames][] public brackets;

    uint[] public winningBrackets;

    modifier condition(bool _condition) {
        require(_condition);
        _;
    }
    
    /** 
     */
    constructor(bytes32[] Teams) {
        
        //ASSUME Team.length == 2 ^ y;
        totalGames = Teams.length - 1;

        chairperson = msg.sender;
        phase = Phase.Gather;
        

    }

    function newContestant() private {
        
        Contestant storage submitee = contestants[msg.sender];
        
        submitee.bracket_id = numBracket;
        submitee.submitted = true;
        
    }

    // Contestants Call
    function submitBracket(uint8[] bracket)
        public
        inPhase(Phase.Gather)
        notChair
        notSubmitted
    {
        
        newContestant();    

        newBracket(bracket);
        
    }
    
    function submitResults(uint8[] bracket)
        public
        inPhase(Phase.Active)
        onlyChair
    {
     
        newBracket(one_one, one_two, two_one);
        
        phase = Phase.Ended;
        
    }
    
    
    /**
     */
    function newBracket(uint8[] bracket)
        private
        condition(one_one && one_two && two_one)
    {
        
        // set contestants bracket
        brackets[numBracket++] = bracket;
        
    }
 
    /** 
     * @TODO convert to group of best scores
     */
    function winningBrackets() public view
        inPhase(Phase.Ended)
        returns (uint winningBracketCount)
    {
        
        uint8[] Results = brackets.pop();

        for (uint b = 0; b < brackets.length; b++) {
            
            // compare results and bracket values
            uint8 memory bracket = brackets[b];
            bool isWinner = true;
            
            for (uint r = 0; r < Results.length; r++) {

                if (bracket[r] != Results[r]) {
                    isWinner = false;
                    break;
                }
                
            }
            
            //add bracket index to winners array;
            if (isWinner)
                winningBrackets.push(b);

        }
        
        winningBracketCount = winningBrackets.length;
        
    }

}

