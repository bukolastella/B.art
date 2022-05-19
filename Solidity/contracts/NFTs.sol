//SPDX-License-Identifier:Unlicense
pragma solidity ^0.8.0;
 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



interface IWhitelist {
  function WhiteListedAddresses(address) external view returns(bool);
}

contract NFTs is ERC721Enumerable, Ownable {

    bool public hasPresaleStarted;
    uint256 public endPresaleTime;
    IWhitelist Whitelist;
    uint256 public maxTokenIds = 10;
    uint256 public numTokenIds;
    uint256 presaleNFTsPrice = 0.005 ether;
    uint256 publicNFTsPrice = 0.01 ether;
    string baseTokenURI;
    bool public paused;
    
    constructor( string memory baseURI, address whitelistContract) ERC721("B.art", "BART") {
        Whitelist = IWhitelist(whitelistContract);
        baseTokenURI = baseURI;
    }

modifier onlyWhenNotPaused {
    require(!paused,"Contract has been paused");
    _;
}

    //owner starts the sale
    function startPresale () public onlyOwner {
        hasPresaleStarted = true;
        endPresaleTime = block.timestamp + 10 minutes;
    }
    
    //only whitelised addresses
    function presaleMint (uint256 tokenId ) public payable onlyWhenNotPaused{
        require(hasPresaleStarted && block.timestamp < endPresaleTime  ,"Presale Currently Unavaliable");
        require(Whitelist.WhiteListedAddresses(msg.sender), 'you are not yet whitelisted');
        require(numTokenIds < maxTokenIds, 'Limit reached');
        require(msg.value >= presaleNFTsPrice, 'Not enough funds');
        numTokenIds += 1;

        _safeMint(msg.sender, tokenId);
    }


    function publicMint () public payable onlyWhenNotPaused{
        require(hasPresaleStarted && block.timestamp >= endPresaleTime,'Public mint currently unavailable');
        require(numTokenIds < maxTokenIds, 'Limit reached' );
        require(msg.value >= publicNFTsPrice, 'Not enough funds');
        numTokenIds += 1;

        _safeMint(msg.sender, numTokenIds);
    }


     function _baseURI() internal view virtual override returns (string memory) {
          return baseTokenURI;
      }

      function setPaused (bool val) public onlyOwner {
          paused = val;
      }

function withdraw() public onlyOwner  {
          address owner = owner();
          uint256 amount = address(this).balance;
          (bool sent,) = owner.call{value:amount}("");
          require(sent,"Failure in sending ether");
      }

      receive () external payable {}
      fallback() external payable {}
}