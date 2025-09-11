import pytest
from brownie import issuerRegistry, accounts, reverts, ZERO_ADDRESS
from scripts.help_scripts import create_sample_institution_data

@pytest.fixture
def issuer_registry():
    return accounts[0].deploy(issuerRegistry)

@pytest.fixture
def sample_institutions():
    return create_sample_institution_data()

@pytest.fixture
def registered_issuer_registry(issuer_registry, sample_institutions):
    for institution in sample_institutions[:3]:
        issuer_registry.registerIssuer(
            institution["address"],
            institution["name"],
            institution[location],
            {'from': accounts[0]}
        )
    return issuer_registry

def test_deployment(issuer_registry):
    assert issuer_registry.owner() == accounts[0]
    assert issuer_registry.getTotalIssuers() == 0

    stats = issuer_registry.getContractStats()
    assert stats[0] ==0
    assert stats[1] ==0
    assert stats[2] ==0

def test_register_issuer_success(issuer_registry):
    