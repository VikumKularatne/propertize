//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    //Interface for the transfer of ERC-721 tokens from one address to another
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    //Declaring state variables of the Escrow contract.
    //adress here is the datatype of a blockchain adress. 
    // Eg. Metamask and lender, inspector, etc. are the static variable name. 
    address public nftAddress; //Address of the ERC-721 token
    address payable public seller; //Address of the seller
    address public inspector; //Address of the inspector
    address public lender; //Address of the lender

    //Modifiers to restrict function access based on the address
    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    //Mappings to keep track of the status of the transaction and the involved parties
    mapping(uint256 => bool) public isListed; //Whether an NFT is listed for sale or not
    mapping(uint256 => uint256) public purchasePrice; //Purchase price of the NFT
    mapping(uint256 => uint256) public escrowAmount; //Escrow amount to be deposited by the buyer
    mapping(uint256 => address) public buyer; //Address of the buyer
    mapping(uint256 => bool) public inspectionPassed; //Whether the NFT has passed inspection or not
    mapping(uint256 => mapping(address => bool)) public approval; //Approval of the sale by the involved parties

    //Constructor to initialize the Escrow contract
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //Function to list an NFT for sale
    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract address to hold it during the transaction
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        //Update the status and details of the transaction in the mappings
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    //Function for the buyer to deposit earnest money into escrow
    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        //The amount deposited should be equal to or more than the escrow amount
        require(msg.value >= escrowAmount[_nftID]);
    }

    //Function for the inspector to update the inspection status of the NFT
    // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    //Function to Approve the Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorized
    // -> Require funds to be correct amount
    // -> Transfer NFT ownership from this contract to buyer
    // -> Transfer Funds to Seller
    function finalizeSale(uint256 _nftID) public {
        // Check if NFT has passed inspection
        require(inspectionPassed[_nftID]);

        // check if buyer, seller, and lender have all approved the sale
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);

        // Check if enough funds have been deposited by buyer
        require(address(this).balance >= purchasePrice[_nftID]);

        // Mark the NFT as no longer listed for sale
        isListed[_nftID] = false;

        // Transfer sale funds to the seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        // Transfer NFT ownership to the buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        // If NFT has not passed inspection
        if (inspectionPassed[_nftID] == false) { 
            // Refund the buyer
            payable(buyer[_nftID]).transfer(address(this).balance);
        // If NFT has passed inspection
        } else {
            // Send sale funds to the seller
            payable(seller).transfer(address(this).balance);
        }
    }

    // Receive function to accept incoming ether payments
    receive() external payable {}

    // Get the current balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

