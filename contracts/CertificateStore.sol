// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IIssuerRegistry{
    function isRegisteredIssuer(address _issuerAddress) external view returns (bool);
    function incrementCertificateCount(address _issuerAddress) external;
    function getIssuerName(address _issuerAddress) external view returns (string memory);

}

contract CertificateStore is ReentrancyGuard{
    using Counters for Counters.Counter;

    struct Certificate {
        bytes32 certificateHash;
        address issuer;
        address recipient;
        uint256 issuanceTime;
        bool isRevoked;
        uint256 revocationTime;
    }

    IIssuerRegistry public issuerRegistry;
    Counters.Counter private certificateCounter;

    mapping(bytes32 => Certificate) private certificates;
    mapping(bytes32 => bool) private certificateExists;
    mapping(address => bytes32[]) private recipientCertificates;
    mapping(address => bytes32[]) private issuerCertificates;
    mapping(address => mapping(bytes32 => uint256)) private recipientCertificateIndex;

    event CertificateIssued(
        bytes32 indexed certificateHash,
        address indexed issuer,
        address indexed recipient,
        uint256 timestamp
    );

    event CertificateRevoked(
        bytes32 indexed certificateHash,
        address indexed issuer,
        uint256 timestamp
    );

    event BatchCertificatesIssued(
        address indexed issuer,
        uint256 count,
        uint256 timestamp
    );

    modifier onlyRegisteredIssuer(){
        require(issuerRegistry.isRegisteredIssuer(msg.sender),
        "CertificateStore: Caller is not registered");
        _;
    }

    modifier certificateMustExist(bytes32 _certificateHash){
        require(certificateExists[_certificateHash],
        "CertificateStore: Certificate does not exist");
        _;
    }

    modifier certificateMustNotExist(bytes32 _certificateHash){
        require(!certificateExists[_certificateHash],
        "CertificateStore: Certificate already exists");
        _;
    }

    modifier onlyIssuerOfCertificate(bytes32 _certificateHash){
        require(certificates[_certificateHash].issuer == msg.sender,
        "CertificateStore: Caller is not the issuer of this certificate");
        _;
    }

    modifier validAddress(address _address){
        require(_address != address(0), "Certificate: Invalid address");
        _;
    }

    modifier validHash(bytes32 _hash){
        require(_hash != bytes32(0), "CertificateStore: Invalid hash");
        _;
    }

    constructor(address _issuerRegistryAddress){
        require(_issuerRegistryAddress != address(0),
        "CertificateStore: Invalid IssuerRegistry address");
        issuerRegistry = IIssuerRegistry(_issuerRegistryAddress);
    }

    function issueCertificate(bytes32 _certificateHash, address _recipientAddress)
        external
        onlyRegisteredIssuer
        validHash(_certificateHash)
        validAddress(_recipientAddress)
        certificateMustNotExist(_certificateHash)
        nonReentrant{
        
        certificates[_certificateHash] = Certificate({
            certificateHash: _certificateHash,
            issuer: msg.sender,
            recipient: _recipientAddress,
            issuanceTime: block.timestamp,
            isRevoked: false,
            revocationTime: 0
        });

        certificateExists[_certificateHash] = true;
        recipientCertificates[_recipientAddress].push(_certificateHash);
        issuerCertificates[msg.sender].push(_certificateHash);

        recipientCertificateIndex[_recipientAddress][_certificateHash] = recipientCertificates[_recipientAddress].length - 1;
        certificateCounter.increment();
        issuerRegistry.incrementCertificateCount(msg.sender);
        
        emit CertificateIssued(_certificateHash, msg.sender, _recipientAddress, block.timestamp);    
    }

    function batchIssueCertificates(bytes32[] calldata _certificateHashes, address[] calldata _recipientAddresses)
        external
        onlyRegisteredIssuer
        nonReentrant{
        
        require(_certificateHashes.length == _recipientAddresses.length, "CertificateStore: Array length mismatch");
        require(_certificateHashes.length >0, "CertificateStore: Empty arrays");
        require(_certificateHashes.length <= 100, "CertificateStore: Batch too large (max 100)");

        for(uint256 i = 0;i < _certificateHashes.length; i++){
            bytes32 certHash = _certificateHashes[i];
            address recipient = _recipientAddresses[i];

            require(certHash != bytes32(0), "CertificateStore: Invalid hash in batch");
            require(recipient != address(0), "CertificateStore: Invalid address in batch");
            require(!certificateExists[certHash],"CertificateStore: Duplicate certification in batch");

            certificates[certHash] = Certificate({
                certificateHash: certHash,
                issuer: msg.sender,
                recipient: recipient,
                issuanceTime: block.timestamp,
                isRevoked: false,
                revocationTime: 0
            });
            certificateExists[certHash] = true;
            recipientCertificates[recipient].push(certHash);
            issuerCertificates[msg.sender].push(certHash);
            recipientCertificateIndex[recipient][certHash] = recipientCertificates[recipient].length-1;

            certificateCounter.increment();

            emit CertificateIssued(certHash, msg.sender, recipient, block.timestamp);
        }
        for(uint256 i = 0; i < _certificateHashes.length; i++){
            issuerRegistry.incrementCertificateCount(msg.sender);
        }
        emit BatchCertificatesIssued(msg.sender, _certificateHashes.length, block.timestamp);

    }

    function verifyCertificate(bytes32 _certificateHash)
        external
        view
        validHash(_certificateHash)
        returns(bool isValid, address issuer, address recipient, uint256 issuanceTime, bool isRevoked, string memory issuerName){

        if(!certificateExists[_certificateHash]){
            return(false, address(0), address(0), 0, false, "");
        }
        Certificate memory cert = certificates[_certificateHash];
        string memory name = "";
        try issuerRegistry.getIssuerName(cert.issuer) returns (string memory _name){
            name = _name;
        }catch{
            name = "Unknown Issuer";
        }

        return(true, cert.issuer, cert.recipient, cert.issuanceTime, cert.isRevoked, name);
    }

    function isCertificateValid(bytes32 _certificateHash)
        external
        view
        returns (bool){

        if(!certificateExists[_certificateHash]){
            return false;
        }
        return !certificates[_certificateHash].isRevoked;
    }

    function revokeCertificate(bytes32 _certificateHash, string calldata _reason)
        external
        onlyRegisteredIssuer
        certificateMustExist(_certificateHash)
        onlyIssuerOfCertificate(_certificateHash)
        nonReentrant{

        Certificate storage cert = certificates[_certificateHash];
        require(!cert.isRevoked, "CertificateStore: Certificate already revoked");
        cert.isRevoked = true;
        cert.revocationTime = block.timestamp;

        emit CertificateRevoked(_certificateHash, msg.sender, block.timestamp);
    }

    function getCertificateDetails(bytes32 _certificateHash)
        external
        view
        certificateMustExist(_certificateHash)
        returns (
            bytes32 certificateHash,
            address issuer,
            address recipient,
            uint256 issuanceTime,
            bool isRevoked,
            uint256 revocationTime
        ){
        
        Certificate memory cert = certificates[_certificateHash];
        return (
            cert.certificateHash,
            cert.issuer,
            cert.recipient,
            cert.issuanceTime,
            cert.isRevoked,
            cert.revocationTime
        );
    }

    function getCertificatesForRecipient(address _recipientAddress, uint256 _start, uint256 _limit)
    external
    view
    validAddress(_recipientAddress)
    returns (bytes32[] memory hashes, bool hasMore) {
        bytes32[] storage recipientCerts = recipientCertificates[_recipientAddress];
        require(_start < recipientCerts.length || recipientCerts.length == 0, "CertifiateStore: Start index out of bounds");
        uint256 end = _start + _limit;
        if(end > recipientCerts.length){
            end = recipientCerts.length;
        }

        hashes = new bytes32[](end - _start);
        for(uint256 i = _start; i < end; i++){
            hashes[i - _start] = recipientCerts[i];
        }
        hasMore = end < recipientCerts.length;
    }

    // function getCertificatesIssuedBy(){}

    function getTotalCertificates() external view returns (uint256){
        return certificateCounter.current();
    }

    // function getRecipientCertificateCount(){}

    function getContractStats() external view returns(
        uint256 totalCertificates, uint256 totalRevoked
    ){
        totalCertificates = certificateCounter.current();
        totalRevoked = 0;
    }
}
