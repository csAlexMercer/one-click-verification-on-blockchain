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
}
