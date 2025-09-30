// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IIssuerRegistry{
    function isRegisteredIssuer(address _issuerAddress) external view returns (bool);
    function incrementCertificateCount(address _issuerAddress) external;
    function getIssuerName(address _issuerAddress) external view returns (string memory);

}

contract CertificateStore is ReenrancyGuard{
    using Counters for Counters.Counter;

    struct Certificate {
        byte32 certificateHash;
        address issuer;
        address recipient;
        uint256 issuanceTime;
        bool isRevoked;
        uint256 revocationTime;
    }

    IIssuerRegistry public issuerRegistry;
    Counters.Counter private certificateCounter;

    mapping(byte32 => Certificate) private certificates;
    mapping(bute32 => bool) private certificatExists;
    mapping(address => byte32[]) private recipientCertificates;
    mapping(address => byte32[]) private issuerCertificates;
    mapping(address => mapping(byte32 => uint256)) private recipientCertificateIndex;

    event CertificateIssued(
        byte32 indexed certificateHash,
        address indexed issuer,
        address indexed recipient,
        uint256 timestamp
    );

    event CertificateRevoked(
        byte32 indexed certificateHash,
        address indexed issuer,
        uint256 timestamp,
    )

    event BatchCertificatesIssued(
        address indexed issuer,
        uint256 count,
        uint256 timestamp
    );

    modifier onlyRegisteredIssuer(){
        require(issuer.isRegisteredIssuer(msg.sender),
        "CertificateStore: Caller is not registered");
        _;
    }

    modifier certificateMustExist(byte32 _certificateHash){
        require(certificateExists[_certificateHash],
        "CertificateStore: Certificate does not exist");
        _;
    }

    modifier certificateMustNotExist(byte32 _certificateHash){
        require(!certificateExists[_certificateHash],
        "CertificateStore: Certificate already exists")
    }

    modifier onlyIssuerOfCertificate(byte32 _certificateHash){
        require(certificates[_certificateHash].issuer == msg.sender,
        "CertificateStore: Caller is not the issuer of this certificate");
        _;
    }

    modifier validAddress(address _address){
        require(_address != address(0), "Certificate: Invalid address");
        _;
    }

    modifier validHash(byte32 _hash){
        require(_hash != byte32(0), "CertificateStore: Invalid hash");
        _;
    }

    constructor(address _issuerRegistryAddress){
        require(_issuerRegistryAddress != address(0),
        "CertificateStore: Invalid IssuerRegistry address");
        issuerRegistry = IIssuerRegistry(_issuerRegistryAddress);
    }

    function issueCertificate(byte32 _certificateHash, address _recipientAddress)
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
            revocationTime: 0,
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
        require(_CertificateHashes.length >0, "CertificateStore: Empty arrays");
        require(_certificateHashes.length <= 100, "CertificateStore: Batch too large (max 100)");

        for(uint256 i = 0;i < _certificateHashes.length; i++){
            byte32 certHash = _certificateHashes[i];
            address recipient = _recipientAddresses[i];

            require(certHash != byte32(0), "CertificateStore: Invalid hash in batch");
            require(recipient != address(0), "CertificateStore: Invalid address in batch");
            require(!certificateExists[certHash],"CertificateStore: Duplicate certification in batch");

            certificates[certHash] = Certificate({
                certificateHash: certHash,
                issuer: msg.sender,
                recipient: recipient,
                issuanceTime: block.timestamp,
                isRevoked: false,
                revocationTime: 0,
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

    function verifyCertificate(byte32 _certificateHash)
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

    function isCertificateValid(byte32 _certificateHash)
        external
        view
        returns (bool){

        if(!certificateExists[_certificateHash]){
            return false;
        }
        return !certificate[_certificateHash].isRevoked;
    }

    function revokeCertificate(byte32 _certificateHash, string calldata _reason)
        external
        onlyRegisteredIssuer
        certificateMustExist(_certificateHash)
        onlyIssuerOfCertificate(_CertificateHash)
        nonReentrant{

        Certificate storage cert = certificates[_certificateHash];
        require(!cert.isRevoked, "CertificateStore: Certificate already revoked");
        cert.isRevoked = true;
        cert.revocationTime = block.timestamp;
        cert.revocationTime = _reason;

        emit CertificateRevoked(_certificateHash, msg.sender, block.timestamp);
    }
}
