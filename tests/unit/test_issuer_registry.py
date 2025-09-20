import pytest
from brownie import IssuerRegistry, accounts, reverts, ZERO_ADDRESS
from scripts.help_scripts import create_sample_institution_data

@pytest.fixture
def issuer_registry():
    return accounts[0].deploy(IssuerRegistry)

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
    assert event["issuerAddress"] == issuer_address
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

    with reverts("IssuerRegistry: Issuer already registered."):
        issuer_registry.registerIssuer(accounts[1], "Another Name", "Another City", {'from': accounts[0]})

def test_update_issuer_success(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    new_name = "Updated Name"
    new_location = "Updated City"
    tx = registered_issuer_registry.updateIssuer(issuer_address, new_name, new_location, {'from':accounts[0]})

    assert len(tx.events["IssuerUpdated"]) == 1
    event = tx.events["IssuerUpdated"][0]
    assert event["IssuerAddress"] == issuer_address
    assert event["name"] == new_name
    assert event["location"] == new_location

    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[0] == new_name
    assert info[1] == new_location

def test_update_nonexistent_issuer(issuer_registry):
    with reverts("IssuerRegistry: Issuer not registered."):
        issuer_registry.updateIssuer(accounts[5], "New Name", "New Location", {'from': accounts[0]})

def test_update_issuer_only_owner(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    with reverts("Ownable: caller is not the owner"):
        registered_issuer_registry.updateIssuer(
            issuer_address, "New Name", "New location", {'from': accounts[1]}
        )

def test_deactivate_issuer_success(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    assert registered_issuer_registry.isRegisteredIssuer(issuer_address) == True
    tx = registered_issuer_registry.deactivateIssuer(issuer_address, {'from': accounts[0]})
    assert len(tx.events["IssuerDeactivated"]) == 1
    assert tx.events["IssuerDeactivated"][0]["issuerAddress"] == issuer_address
    assert registered_issuer_registry.isRegisteredIssuer(issuer_address) == False
    assert registered_issuer_registry.isAddressRegistered(issuer_address) ==  True
    info =  registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[3] == False

def test_reactivate_issuer_success(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    registered_issuer_registry.deactivateIssuer(issuer_address, {'from': accounts[0]})
    assert registered_issuer_registry.isRegisteredIssuer(issuer_address) == False
    tx = registered_issuer_registry.reactivateIssuer(issuer_address, {'from': accounts[0]})

    assert len(tx.events["IssuerReactivated"]) == 1
    assert tx.events["IssuerReactivated"][0]["issuerAddress"] == issuer_address

    assert registered_issuer_registry.isRegisteredIssuer(issuer_address) == True
    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[3] == True

def test_deactivated_already_inactive(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    registered_issuer_registry.deactivateIssuer(issuer_address, {'from': accounts[0]})
    with reverts("IssuerRegistry: Issuer is already inactive."):
        registered_issuer_registry.deactivateIssuer(issuer_address, {'from': accounts[0]})

def test_reactivate_already_active(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    with reverts("IssuerRegistry: Issuer is already active"):
        registered_issuer_registry.reactivateIssuer(issuer_address, {'from': accounts[0]})

def test_increment_certificate_count(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[4] == 0
    tx = registered_issuer_registry.incrementCertificateCount(issuer_address, {'from': accounts[0]})
    assert len(tx.events["CertificateCountUpdated"]) == 1
    event = tx.events["CertificateCountUpdated"][0]
    assert event["issuerAddress"] == issuer_address
    assert event["newCount"] == 1
    
    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[4] == 1
    registered_issuer_registry.incrementCertificateCount(issuer_address, {'from': accounts[0]})
    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[4] == 2

# def test_get_issuer_name(registered_issuer_registry, sample_institutions):
#     issuer_address = sample_institutions[0]["address"]
#     expected_name = sample_institutions[0]["name"]
#     name = registered_issuer_registry.getIssuerName(issuer_address)
#     assert name == expected_name

# def test_get_all_issuers_pagination(registered_issuer_registry):
#     addresses, has_more = registered_issuer_registry.getAllIssuers(0,2)
#     assert len(addresses) == 2
#     assert has_more == True
#     addresses, has_more = registered_issuer_registry.getAllIssuers(2,2)
#     assert len(addresses) == 1
#     assert has_more == False

# def test_get_all_issuers_out_of_bounds(registered_issuer_registry):
#     with reverts("IssuerRegistry: Start index out of bounds"):
#         registered_issuer_registry.getAllIssuers(10,5)

# def test_get_all_issuers_zero_limit(registered_issuer_registry):
#     with reverts("IssuerRegistry: Limit must be greater than 0"):
#         registered_issuer_registry.getAllIssuers(0,0)
# def test_get_active_issuers(registered_issuer_registry, sample_institutions):
#     addresses, names, has_more = registered_issuer_registry.getActiveIssuers(0,10)
#     assert len(addresses) == 3
#     assert len(names) == 3
#     assert has_more == False
#     registered_issuer_registry.deactivateIssuer(sample_institutions[0]["address"], {'from': accounts[0]})

#     addresses, names, has_more =registered_issuer_registry.getActiveIssuers(0,10)
#     assert len(addresses) == 2
#     assert len(names) == 2
#     assert sample_institutions[0]["address"] not in addresses

def test_get_contract_stats_comprehensive(registered_issuer_registry, sample_institutions):
    registered_issuer_registry.incrementCertificateCount(sample_institutions[0]["address"], {'from': accounts[0]})
    registered_issuer_registry.incrementCertificateCount(sample_institutions[0]["address"], {'from': accounts[0]})
    registered_issuer_registry.incrementCertificateCount(sample_institutions[1]["address"],{'from':accounts[0]})
    registered_issuer_registry.deactivateIssuer(sample_institutions[2]["address"], {'from': accounts[0]})
    stats = registered_issuer_registry.getContractStats()
    assert stats[0] == 3
    assert stats[1] == 2
    assert stats[2] == 3

def test_intregration_ready_state(registered_issuer_registry, sample_institutions):
    issuer_address = sample_institutions[0]["address"]
    assert registered_issuer_registry.isRegisteredIssuer(issuer_address) == True
    name = registered_issuer_registry.getIssuerName(issuer_address)
    assert len(name) > 0
    registered_issuer_registry.incrementCertificateCount(issuer_address, {'from': accounts[0]})
    info = registered_issuer_registry.getIssuerInfo(issuer_address)
    assert info[3] == True
    assert info[4] == 1

def test_event_emission_for_frontend(issuer_registry):
    issuer_address = accounts[1]
    tx1 = issuer_registry.registerIssuer(issuer_address, "Test Uni", "Test City", {'from': accounts[0]})
    assert "IssuerRegistered" in tx1.events

    tx2 = issuer_registry.updateIssuer(issuer_address, "Updated Uni", "Updated City", {'from': accounts[0]})
    assert "IssuerUpdated" in tx2.events

    tx3 = issuer_registry.incrementCertificateCount(issuer_address, {'from': accounts[0]})
    assert "CertificateCountUpdated" in tx3.events

    tx4 = issuer_registry.deactivateIssuer(issuer_address, {'from': accounts[0]})
    assert "IssuerDeactivated" in tx4.events

    tx5 = issuer_registry.reactivateIssuer(issuer_address, {'from': accounts[0]})
    assert "IssuerReactivated" in tx5.events