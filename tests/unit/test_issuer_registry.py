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
            institution["location"],
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
    issuer_address = accounts[1]
    name = "Test University"
    location = "Kanpur, India"
    tx = issuer_registry.registerIssuer(issuer_address, name, location, {'from': accounts[0]})
    assert len(tx.events["IssuerRegistered"]) == 1
    event = tx.events["IssuerRegistered"][0]
    assert event["IssuerAddress"] == issuer_address
    assert event["name"] == name
    assert event["location"] == location

    assert issuer_registry.getTotalIssuers() == 1
    assert issuer_registry.isRegisteredIssuer(issuer_address) == True
    assert issuer_registry.isAddressRegistered(issuer_address) == True

    info = issuer_registry.getIssuerInfo(issuer_address)
    assert info[0] == name
    assert info[1] == location
    assert info[3] == True
    assert info[4] == 0

def test_register_issuer_only_owner(issuer_registry):
    with reverts("Ownable: caller is not the owner"):
        issuer_registry.registerIssuer(
            accounts[2], "Test University", "Test City", {'from': accounts[1]}
        )

def test_register_issuer_invalid_address(issuer_registry):
    with reverts("IssuerRegistry: Invalid address"):
        issuer_registry.registerIssuer(
            ZERO_ADDRESS, "Test University", "test City",
            {'from': accounts[0]}
        )
def test_register_issuer_empty_name(issuer_registry):
    with reverts("IssuerRegistry: String cannot be empty"):
        issuer_registry.registerIssuer(
            accounts[1], "", "Test City",{'from': accounts[0]}
        )

def test_register_duplicte_issuer(issuer_registry):
    issuer_registry.registerIssuer(accounts[1], "Test Uni", "Test City", {'from': accounts[0]})

    with reverts("IssuerRegistry: Issuer already registered"):
        issuer_registry.registerIssuer(accounts[1], "Another Name", "Another City", {'from': accounts[0]})

def test_update_issuer_success(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    new_name = "Updated Name"
    new_location = "Updated City"
    tx = registered_issuer_registry.updateIssuer(issuer_address, new_name, new_location, {'from':accounts[0]})

    assert len(tx.events["IssuerUpdated"]) == 1
    event = tx.events["IssuerUpdated"][0]
    assert event["issuerAddress"] == issuer_address
    assert event["name"] == new_name
    assert event["location"] == new_location

    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[0] == new_name
    assert info[1] == new_location

def test_update_nonexistent_issuer(issuer_registry):
    with reverts("IssuerRegistry: Issuer not registered"):
        issuer_registry.updateIssuer(accounts[5], "New Name", "New Location", {'from': accounts[0]})

def test_update_issuer_only_owner(registered_issuer_registry, sample_institutions):
    issuer_address = sample_

