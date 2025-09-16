// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract IssuerRegistry is Ownable, ReentrancyGuard{
    using Strings for uint256;

    struct Issuer{
        string name;
        string location;
        uint256 registrationTime;
        bool isActive;
        uint256 totalCertificatesIssued;
    }

    mapping(address => Issuer) private issuers;
    address[] private issuerAddresses;
    mapping(address => bool) private isRegistered;
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
                isActive: true,
                totalCertificatesIssued: 0
            });

            isRegistered[_issuerAddress] = true;
            issuerAddresses.push(_issuerAddress);
            totalIssuers++;

            emit IssuerRegistered(_issuerAddress, _name, _location, block.timestamp);
        }

    function updateIssuer(address _issuerAddress, string memory _name, string memory _location)
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

    function incrementCertificateCount(address _issuerAddress) external validAddress(_issuerAddress){
        require(isRegistered[_issuerAddress], "IssuerRegistry: Issuer not registered");
        issuers[_issuerAddress].totalCertificatesIssued++;
        emit CertificateCountUpdated(_issuerAddress, issuers[_issuerAddress].totalCertificatesIssued);
    }


    function isRegisteredIssuer(address _issuerAddress) external view  returns (bool){
        return isRegistered[_issuerAddress] && issuers[_issuerAddress].isActive;
    }

    function isAddressRegistered(address _issuerAddress)external view  returns (bool){
        return isRegistered[_issuerAddress];
    }

    function getIssuerInfo(address _issuerAddress) external view validAddress(_issuerAddress)
        returns (string memory name, string memory location, uint256 registrationTime, bool isActive, uint256 totalCertificatesIssued){
        require(isRegistered[_issuerAddress], "IssuerRegistry: Address not registered");
        Issuer memory issuer = issuers[_issuerAddress];
        return (
            issuer.name,
            issuer.location,
            issuer.registrationTime,
            issuer.isActive,
            issuer.totalCertificatesIssued
        );
    }

    function getIssuerName(address _issuerAddress) external view validAddress(_issuerAddress) returns (string memory){
        require(isRegistered[_issuerAddress],"IssuerRegistry: Issuer not registered");
        return issuers[_issuerAddress].name;
    }

    function getTotalIssuers() external view returns (uint256){
        return totalIssuers;
    }

    function getAllIssuers(uint256 _start, uint256 _limit)external view returns (address[] memory addresses, book h){}

    // function getActivateIssuers(){}

    function getContractStats() external view returns (uint256 totalRegistered, uint256 totalActive, uint256 totalCertificates){
        totalRegistered = totalIssuers;
        uint256 activeCount = 0;
        uint256 certificatesCount = 0;

        for(uint256 i=0; i<issuerAddresses.length;i++){
            address issuerAdd = issuerAddresses[i];
            if(issuers[issuerAdd].isActive){
                activeCount++;
            }
            certificatesCount += issuers[issuerAdd].totalCertificatesIssued;
        }
        totalActive = activeCount;
        totalCertificates = certificatesCount;

    }
}