// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract IssuerRegistry is Ownable, ReentrancyGuard{
    usings Strings for uint256;

    struct Issuer{
        string name;
        string location;
        uint256 registrationTime;
        bool isActive;
        uint256 totalCertificatesIssues;
    }

    mapping(address => Issuer) privare issuers;
    address[] private issuerAddresses;
    mapping(address => bool) privare isRegistered;
    uint256 private totalIssuers;

    event IssuerRegistered(address indexed issuerAddress, string name, string location, uint256 timestamp);
    event IssuerUpdated(address indexed IssuerAddress, string name, string location, uint256 timestamp);
    event IssuerDeactivated(address indexed issuerAddress, uint256 timestamp);
    event IssuerReactivated(address indexed issuerAddress, uint256 timestamp);
    event CertificateCountUpdated(address indexed issuerAddress, uint256 newCount);

    modifier onlyRegisteredIssuer(){
        require(isRegistered[msg.sender], "IssuerRegistry: Caller is not a registered");
        require(issuers[msg.sender].isActive, "IssuerRegistry: Issuer is not active");
        _;
    }
    modifier validAddress(address _address){
        require(_address != address(0), "IssuerRegistry: Invalid address");
        _;
    }
    modifier validString(string memory _str){
        require(bytes(_str).length > 0, "IssuerRegistry: String cannot be empty");
        require(bytes(_str).length <= 200, "IssuerRegistry: String too long");
        _;
    }

    constructor(){}

    function registerIssuer(address _issuerAddress, string memory _name, string memory _location)
        external onlyOwner
        validAddress(_issuerAddress)
        validString(_name)
        validString(_location)
        nonReentrant{
            require(!isRegistered[_issuerAddress], "IssuerRegistry: Issuer already registered.");
            issuers[_issuerAddress] = Issuer({
                name: _name,
                location: _location,
                registrationTime: block.timestamp,
                isActive: true;
                totalCertificatesIssued: 0
            });

            isRegistered[_issuerAddress] = true;
            issuerAddresses.push(_issuerAddress);
            totalIssuers++;

            emit IssuerRegistered(_issuerAddress, _name, _location, block.timestamp);
        }

    function updateIssuer(address _issuerAddress, string _name, string _location)
        external onlyOwner
        validAddress(_issuerAddress)
        validString(_name)
        validString(_location)
        nonReentrant{
        require(isRegistered[_issuerAddress], "IssuerRegistry: Issuer not registered.");

        issuers[_issuerAddress].name = _name;
        issuers[_issuerAddress].location = _location;

        emit IssuerUpdated(_issuerAddress, _name, _location, block.timestamp);
    }

    function deactivateIssuer(address _issuerAddress)
        external onlyOwner validAddress(_issuerAddress) nonReentrant{
        require(isRegistered[_issuerAddress], "IssuerRegistry: Issuer not registered.");
        require(issuers[_issuerAddress].isActive, "IssuerRegistry: Issuer is already deactivated");

        issuers[_issuerAddress].isActive = false;
        emit IssuerDeactivated(_issuerAddress, block.timestamp);
    }


    function reactivateIssuer(address _issuerAddress)
        external onlyOwner validAddress(_issuerAddress) nonReentrant{
        require(isRegistered[_issuerAddress], "IssuerRegistry: Issuer not registered.");
        require(!issuers[_issuerAddress].isActive, "IssuerRegistry: Issuer is already activated");

        issuers[_issuerAddress].isActive = true;
        emit IssuerReactivated(_issuerAddress, block.timestamp);
    }

    function incrementCertificateCount(){}

    function isRegisteredIssuer(){}

    function isAddressRegistered(address _issuerAddress){}

    function getIssuerInfo(){}

    function getIssuerName(){}

    function getTotalIssuers(){}

    function getAllIssuers(){}

    function getActivateIssuers(){}

    function getContractStats(){}


}