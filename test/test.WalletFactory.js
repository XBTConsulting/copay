'use strict';

var chai = chai || require('chai');
var should = chai.should();

var FakeStorage = require('./mocks/FakeLocalStorage');
var copay = copay || require('../copay');
var sinon = require('sinon');
var FakeNetwork = require('./mocks/FakeNetwork');
var FakeBlockchain = require('./mocks/FakeBlockchain');
var FakeStorage = require('./mocks/FakeStorage');
var WalletFactory = require('../js/models/core/WalletFactory');

var o = '{"opts":{"id":"dbfe10c3fae71cea","spendUnconfirmed":1,"requiredCopayers":3,"totalCopayers":5,"version":"0.0.5"},"networkNonce":"0000000000000001","networkNonces":[],"publicKeyRing":{"walletId":"dbfe10c3fae71cea","networkName":"testnet","requiredCopayers":3,"totalCopayers":5,"indexes":[{"cosigner":2,"changeIndex":0,"receiveIndex":0}],"copayersBackup":[],"copayersExtPubKeys":["tpubD6NzVbkrYhZ4YGK8ZhZ8WVeBXNAAoTYjjpw9twCPiNGrGQYFktP3iVQkKmZNiFnUcAFMJRxJVJF6Nq9MDv2kiRceExJaHFbxUCGUiRhmy97","tpubD6NzVbkrYhZ4YKGDJkzWdQsQV3AcFemaQKiwNhV4RL8FHnBFvinidGdQtP8RKj3h34E65RkdtxjrggZYqsEwJ8RhhN2zz9VrjLnrnwbXYNc","tpubD6NzVbkrYhZ4YkDiewjb32Pp3Sz9WK2jpp37KnL7RCrHAyPpnLfgdfRnTdpn6DTWmPS7niywfgWiT42aJb1J6CjWVNmkgsMCxuw7j9DaGKB","tpubD6NzVbkrYhZ4XEtUAz4UUTWbprewbLTaMhR8NUvSJUEAh4Sidxr6rRPFdqqVRR73btKf13wUjds2i8vVCNo8sbKrAnyoTr3o5Y6QSbboQjk","tpubD6NzVbkrYhZ4Yj9AAt6xUVuGPVd8jXCrEE6V2wp7U3PFh8jYYvVad31b4VUXEYXzSnkco4fktu8r4icBsB2t3pCR3WnhVLedY2hxGcPFLKD"],"nicknameFor":{},"publicKeysCache":{"m/0/1/0":["0314368b8efa07e8c7dad30498d0a7e3aa575db1fef833347c6d381c1a33a17b17","02cfd95f89ab46bd3bd86954dd9f83dbab0cd2e4466dee587e8e4d8d733fc0d748","02568969eb6212fe946450be6c5b3353fc754a40b2cdc4aed501a8976fec371da8","0360f870a088ae0ef1c37035a9b6a462ca8dcdd5da275f4e2dcd19f44b81d3e7e4","0300ad8f1bded838b02e127bb25961fbcee718db2df81f680f889692acdcbdd73d"],"m/0/1/1":["024f97a9adb2fa9306c4e3d9244f5e5355c7e2c6b3dd4122ba804e17dc9729df5d","0214834a5adcbc4ad0f3bbbc1c280b8ac480387fcc9a1fd988c1526ed496d923c4","024e72338bd5e976375d076bd71a9649e9141b4cbfc9e16cb7109b354b3e913a05","0322045ea35c3118aa7ab9f2c9f182b0120956b0aa65cc72b9d093f145327a4b17","030dc2450c72df366c1960739c577a2efd4451070bd78effcb6f71d1bcd7dfc7a8"],"m/0/1/2":["0247de59deb66783b8f9b0c326234a9569d00866c2a73f599e77a4d0cab5cbce8f","0376e49f0ac3647404034aae0dc8dd927c34a634ef24ea36f56a272f75fce9539b","032fbaa2593bd1eea4a46e7ac15f15802cdd1eb65a7d5bc4364ddd9d52f0838234","03a81f2a7e1f7191aa0b0c6e0a4ccefc71edd3564e86014972fe338045f68d5a5a","02eb8a012ea9a709392502cacda6ef5115d6d2319ab470d546d9068ab941621a99"],"m/0/0/0":["036dcbd378b4352120d6b720b6294dd2d0dd02801fcf010bb69dadbec1f3999279","022089eedb85dc45d1efa418e1ea226588deedebc1d85acca15ff72783e33636c0","0388aa5fd432b74c56427396f350d236c3ca8f7b2f62da513ce4c2e6ff04a67e9c","02fc4caa7449db7483d2e1fccdacac6fa2f736278c758af9966402589b5632f13e","02e4a15b885d8b2d586f82fa85d16179644e60a154674bde0ec3004810b1bdab99"],"m/0/0/1":["039afa26b2f341c76c7b3c3d0672438f35ac6ebb67b1ddfefac9cd79b7b24418c1","021acaaf500d431ebc396f50630767b01c91ce98ae48e968775ceaad932b7e3b8e","022a947259c4a9f76d5e95c0849df31d01233df41d0d75d631b89317a48d8cddce","03d38d9f94217da780303d9a8987c86d737ef39683febc0cd6632cddbfa62186fd","0394d2581b307fe2af19721888d922aab58ab198ef88cedf9506177e30d807811e"],"m/0/0/2":["037825ffce15d34f9bd6c02bcda7701826706471a4d6ab5004eb965f98811c2098","023768dd6d3c71b7df5733ccda5b2d8b454d5b4c4179d91a6fda74db8b869a2406","021a79e91f003f308764d43039e9b5d56bc8f33ca2f4d30ec6cc5a37c0d09dc273","02437f1e388b273936319f79a5d22958ef5ebff9c8cd7b6f6f72518445b1e30867","0373b0881cb4fd02baa62589023fdfe9739c6148cf104d907549f2528eb80146f5"]}},"txProposals":{"txps":[],"walletId":"dbfe10c3fae71cea","networkName":"testnet"},"privateKey":{"extendedPrivateKeyString":"tprv8ZgxMBicQKsPeoHLg3tY75z4xLeEe8MqAXLNcRA6J6UTRvHV8VZTXznt9eoTmSk1fwSrwZtMhY3XkNsceJ14h6sCXHSWinRqMSSbY8tfhHi","networkName":"testnet","privateKeyCache":{}},"addressBook":{}}';

describe('WalletFactory model', function() {
  var config = {
    Network: FakeNetwork,
    Blockchain: FakeBlockchain,
    Storage: FakeStorage,
    wallet: {
      requiredCopayers: 3,
      totalCopayers: 5,
      spendUnconfirmed: 1,
      reconnectDelay: 100,

    },
    blockchain: {
      host: 'test.insight.is',
      port: 80
    },
    networkName: 'testnet',
    passphrase: 'test',
    storageObj: new FakeStorage(),
    networkObj: new FakeNetwork(),
    blockchainObj: new FakeBlockchain(),
  };

  beforeEach(function() {
    config.storageObj.reset();
  });

  it('should create the factory', function() {
    var wf = new WalletFactory(config, '0.0.1');
    should.exist(wf);
    wf.networkName.should.equal(config.networkName);
    wf.walletDefaults.should.deep.equal(config.wallet);
    wf.version.should.equal('0.0.1');
  });

  it('should log', function() {
    var c2 = JSON.parse(JSON.stringify(config));
    c2.verbose = 1;
    c2.Storage= FakeStorage;
    var wf = new WalletFactory(c2, '0.0.1');
    var save_console_log = console.log;
    console.log = function() {};
    var spy = sinon.spy(console, 'log');
    wf.log('ok');
    sinon.assert.callCount(spy, 1);
    spy.getCall(0).args[0].should.equal('ok');
    console.log = save_console_log;
  });


  it('#_checkRead should return false', function() {
    var wf = new WalletFactory(config);
    wf._checkRead('dummy').should.equal(false);
    wf.read('dummy').should.equal(false);
  });

  it('should be able to create wallets', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var w = wf.create();
    should.exist(w);
  });
  it('should be able to get wallets', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var w = wf.create();

    var w2 = wf.read(w.id);
    should.exist(w2);
    w2.id.should.equal(w.id);
  });

  it('#fromObj #toObj round trip', function() {
    var wf = new WalletFactory(config, '0.0.5');
    var w = wf.fromObj(JSON.parse(o));

    should.exist(w);
    w.id.should.equal("dbfe10c3fae71cea");
    should.exist(w.publicKeyRing.getCopayerId);
    should.exist(w.txProposals.toObj);
    should.exist(w.privateKey.toObj);

    JSON.stringify(w.toObj()).should.equal(o);
  });

  it('support old index schema: #fromObj #toObj round trip', function() {
    var o = '{"opts":{"id":"dbfe10c3fae71cea","spendUnconfirmed":1,"requiredCopayers":3,"totalCopayers":5,"version":"0.0.5"},"networkNonce":"0000000000000001","networkNonces":[],"publicKeyRing":{"walletId":"dbfe10c3fae71cea","networkName":"testnet","requiredCopayers":3,"totalCopayers":5,"indexes":{"changeIndex":0,"receiveIndex":0},"copayersBackup":[],"copayersExtPubKeys":["tpubD6NzVbkrYhZ4YGK8ZhZ8WVeBXNAAoTYjjpw9twCPiNGrGQYFktP3iVQkKmZNiFnUcAFMJRxJVJF6Nq9MDv2kiRceExJaHFbxUCGUiRhmy97","tpubD6NzVbkrYhZ4YKGDJkzWdQsQV3AcFemaQKiwNhV4RL8FHnBFvinidGdQtP8RKj3h34E65RkdtxjrggZYqsEwJ8RhhN2zz9VrjLnrnwbXYNc","tpubD6NzVbkrYhZ4YkDiewjb32Pp3Sz9WK2jpp37KnL7RCrHAyPpnLfgdfRnTdpn6DTWmPS7niywfgWiT42aJb1J6CjWVNmkgsMCxuw7j9DaGKB","tpubD6NzVbkrYhZ4XEtUAz4UUTWbprewbLTaMhR8NUvSJUEAh4Sidxr6rRPFdqqVRR73btKf13wUjds2i8vVCNo8sbKrAnyoTr3o5Y6QSbboQjk","tpubD6NzVbkrYhZ4Yj9AAt6xUVuGPVd8jXCrEE6V2wp7U3PFh8jYYvVad31b4VUXEYXzSnkco4fktu8r4icBsB2t3pCR3WnhVLedY2hxGcPFLKD"],"nicknameFor":{},"publicKeysCache":{"m/0/1/0":["0314368b8efa07e8c7dad30498d0a7e3aa575db1fef833347c6d381c1a33a17b17","02cfd95f89ab46bd3bd86954dd9f83dbab0cd2e4466dee587e8e4d8d733fc0d748","02568969eb6212fe946450be6c5b3353fc754a40b2cdc4aed501a8976fec371da8","0360f870a088ae0ef1c37035a9b6a462ca8dcdd5da275f4e2dcd19f44b81d3e7e4","0300ad8f1bded838b02e127bb25961fbcee718db2df81f680f889692acdcbdd73d"],"m/0/1/1":["024f97a9adb2fa9306c4e3d9244f5e5355c7e2c6b3dd4122ba804e17dc9729df5d","0214834a5adcbc4ad0f3bbbc1c280b8ac480387fcc9a1fd988c1526ed496d923c4","024e72338bd5e976375d076bd71a9649e9141b4cbfc9e16cb7109b354b3e913a05","0322045ea35c3118aa7ab9f2c9f182b0120956b0aa65cc72b9d093f145327a4b17","030dc2450c72df366c1960739c577a2efd4451070bd78effcb6f71d1bcd7dfc7a8"],"m/0/1/2":["0247de59deb66783b8f9b0c326234a9569d00866c2a73f599e77a4d0cab5cbce8f","0376e49f0ac3647404034aae0dc8dd927c34a634ef24ea36f56a272f75fce9539b","032fbaa2593bd1eea4a46e7ac15f15802cdd1eb65a7d5bc4364ddd9d52f0838234","03a81f2a7e1f7191aa0b0c6e0a4ccefc71edd3564e86014972fe338045f68d5a5a","02eb8a012ea9a709392502cacda6ef5115d6d2319ab470d546d9068ab941621a99"],"m/0/0/0":["036dcbd378b4352120d6b720b6294dd2d0dd02801fcf010bb69dadbec1f3999279","022089eedb85dc45d1efa418e1ea226588deedebc1d85acca15ff72783e33636c0","0388aa5fd432b74c56427396f350d236c3ca8f7b2f62da513ce4c2e6ff04a67e9c","02fc4caa7449db7483d2e1fccdacac6fa2f736278c758af9966402589b5632f13e","02e4a15b885d8b2d586f82fa85d16179644e60a154674bde0ec3004810b1bdab99"],"m/0/0/1":["039afa26b2f341c76c7b3c3d0672438f35ac6ebb67b1ddfefac9cd79b7b24418c1","021acaaf500d431ebc396f50630767b01c91ce98ae48e968775ceaad932b7e3b8e","022a947259c4a9f76d5e95c0849df31d01233df41d0d75d631b89317a48d8cddce","03d38d9f94217da780303d9a8987c86d737ef39683febc0cd6632cddbfa62186fd","0394d2581b307fe2af19721888d922aab58ab198ef88cedf9506177e30d807811e"],"m/0/0/2":["037825ffce15d34f9bd6c02bcda7701826706471a4d6ab5004eb965f98811c2098","023768dd6d3c71b7df5733ccda5b2d8b454d5b4c4179d91a6fda74db8b869a2406","021a79e91f003f308764d43039e9b5d56bc8f33ca2f4d30ec6cc5a37c0d09dc273","02437f1e388b273936319f79a5d22958ef5ebff9c8cd7b6f6f72518445b1e30867","0373b0881cb4fd02baa62589023fdfe9739c6148cf104d907549f2528eb80146f5"]}},"txProposals":{"txps":[],"walletId":"dbfe10c3fae71cea","networkName":"testnet"},"privateKey":{"extendedPrivateKeyString":"tprv8ZgxMBicQKsPeoHLg3tY75z4xLeEe8MqAXLNcRA6J6UTRvHV8VZTXznt9eoTmSk1fwSrwZtMhY3XkNsceJ14h6sCXHSWinRqMSSbY8tfhHi","networkName":"testnet","privateKeyCache":{}},"addressBook":{}}';
    var o2 = '{"opts":{"id":"dbfe10c3fae71cea","spendUnconfirmed":1,"requiredCopayers":3,"totalCopayers":5,"version":"0.0.5"},"networkNonce":"0000000000000001","networkNonces":[],"publicKeyRing":{"walletId":"dbfe10c3fae71cea","networkName":"testnet","requiredCopayers":3,"totalCopayers":5,"indexes":[{"cosigner":2147483647,"changeIndex":0,"receiveIndex":0},{"cosigner":0,"changeIndex":0,"receiveIndex":0},{"cosigner":1,"changeIndex":0,"receiveIndex":0},{"cosigner":2,"changeIndex":0,"receiveIndex":0},{"cosigner":3,"changeIndex":0,"receiveIndex":0},{"cosigner":4,"changeIndex":0,"receiveIndex":0}],"copayersBackup":[],"copayersExtPubKeys":["tpubD6NzVbkrYhZ4YGK8ZhZ8WVeBXNAAoTYjjpw9twCPiNGrGQYFktP3iVQkKmZNiFnUcAFMJRxJVJF6Nq9MDv2kiRceExJaHFbxUCGUiRhmy97","tpubD6NzVbkrYhZ4YKGDJkzWdQsQV3AcFemaQKiwNhV4RL8FHnBFvinidGdQtP8RKj3h34E65RkdtxjrggZYqsEwJ8RhhN2zz9VrjLnrnwbXYNc","tpubD6NzVbkrYhZ4YkDiewjb32Pp3Sz9WK2jpp37KnL7RCrHAyPpnLfgdfRnTdpn6DTWmPS7niywfgWiT42aJb1J6CjWVNmkgsMCxuw7j9DaGKB","tpubD6NzVbkrYhZ4XEtUAz4UUTWbprewbLTaMhR8NUvSJUEAh4Sidxr6rRPFdqqVRR73btKf13wUjds2i8vVCNo8sbKrAnyoTr3o5Y6QSbboQjk","tpubD6NzVbkrYhZ4Yj9AAt6xUVuGPVd8jXCrEE6V2wp7U3PFh8jYYvVad31b4VUXEYXzSnkco4fktu8r4icBsB2t3pCR3WnhVLedY2hxGcPFLKD"],"nicknameFor":{},"publicKeysCache":{"m/0/1/0":["0314368b8efa07e8c7dad30498d0a7e3aa575db1fef833347c6d381c1a33a17b17","02cfd95f89ab46bd3bd86954dd9f83dbab0cd2e4466dee587e8e4d8d733fc0d748","02568969eb6212fe946450be6c5b3353fc754a40b2cdc4aed501a8976fec371da8","0360f870a088ae0ef1c37035a9b6a462ca8dcdd5da275f4e2dcd19f44b81d3e7e4","0300ad8f1bded838b02e127bb25961fbcee718db2df81f680f889692acdcbdd73d"],"m/0/1/1":["024f97a9adb2fa9306c4e3d9244f5e5355c7e2c6b3dd4122ba804e17dc9729df5d","0214834a5adcbc4ad0f3bbbc1c280b8ac480387fcc9a1fd988c1526ed496d923c4","024e72338bd5e976375d076bd71a9649e9141b4cbfc9e16cb7109b354b3e913a05","0322045ea35c3118aa7ab9f2c9f182b0120956b0aa65cc72b9d093f145327a4b17","030dc2450c72df366c1960739c577a2efd4451070bd78effcb6f71d1bcd7dfc7a8"],"m/0/1/2":["0247de59deb66783b8f9b0c326234a9569d00866c2a73f599e77a4d0cab5cbce8f","0376e49f0ac3647404034aae0dc8dd927c34a634ef24ea36f56a272f75fce9539b","032fbaa2593bd1eea4a46e7ac15f15802cdd1eb65a7d5bc4364ddd9d52f0838234","03a81f2a7e1f7191aa0b0c6e0a4ccefc71edd3564e86014972fe338045f68d5a5a","02eb8a012ea9a709392502cacda6ef5115d6d2319ab470d546d9068ab941621a99"],"m/0/0/0":["036dcbd378b4352120d6b720b6294dd2d0dd02801fcf010bb69dadbec1f3999279","022089eedb85dc45d1efa418e1ea226588deedebc1d85acca15ff72783e33636c0","0388aa5fd432b74c56427396f350d236c3ca8f7b2f62da513ce4c2e6ff04a67e9c","02fc4caa7449db7483d2e1fccdacac6fa2f736278c758af9966402589b5632f13e","02e4a15b885d8b2d586f82fa85d16179644e60a154674bde0ec3004810b1bdab99"],"m/0/0/1":["039afa26b2f341c76c7b3c3d0672438f35ac6ebb67b1ddfefac9cd79b7b24418c1","021acaaf500d431ebc396f50630767b01c91ce98ae48e968775ceaad932b7e3b8e","022a947259c4a9f76d5e95c0849df31d01233df41d0d75d631b89317a48d8cddce","03d38d9f94217da780303d9a8987c86d737ef39683febc0cd6632cddbfa62186fd","0394d2581b307fe2af19721888d922aab58ab198ef88cedf9506177e30d807811e"],"m/0/0/2":["037825ffce15d34f9bd6c02bcda7701826706471a4d6ab5004eb965f98811c2098","023768dd6d3c71b7df5733ccda5b2d8b454d5b4c4179d91a6fda74db8b869a2406","021a79e91f003f308764d43039e9b5d56bc8f33ca2f4d30ec6cc5a37c0d09dc273","02437f1e388b273936319f79a5d22958ef5ebff9c8cd7b6f6f72518445b1e30867","0373b0881cb4fd02baa62589023fdfe9739c6148cf104d907549f2528eb80146f5"]}},"txProposals":{"txps":[],"walletId":"dbfe10c3fae71cea","networkName":"testnet"},"privateKey":{"extendedPrivateKeyString":"tprv8ZgxMBicQKsPeoHLg3tY75z4xLeEe8MqAXLNcRA6J6UTRvHV8VZTXznt9eoTmSk1fwSrwZtMhY3XkNsceJ14h6sCXHSWinRqMSSbY8tfhHi","networkName":"testnet","privateKeyCache":{}},"addressBook":{}}';

    var wf = new WalletFactory(config, '0.0.5');
    var w = wf.fromObj(JSON.parse(o));

    should.exist(w);
    w.id.should.equal("dbfe10c3fae71cea");
    should.exist(w.publicKeyRing.getCopayerId);
    should.exist(w.txProposals.toObj);
    should.exist(w.privateKey.toObj);

    JSON.stringify(w.toObj()).should.equal(o2);
  });

  it('should create wallet from encrypted object', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var walletObj = JSON.parse(o);
    wf.storage._setPassphrase = sinon.spy();
    wf.storage.import = sinon.stub().withArgs("encrypted object").returns(walletObj);
    wf.fromObj = sinon.stub().withArgs(walletObj).returns(walletObj);

    var w = wf.fromEncryptedObj("encrypted object", "password");
    should.exist(w);
    wf.storage._setPassphrase.called.should.be.true;
    wf.storage.import.called.should.be.true;
    wf.fromObj.calledWith(walletObj).should.be.true;
  });

  it('should return false if decrypted object is wrong', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var walletObj = JSON.parse(o);
    wf.storage._setPassphrase = sinon.spy();
    wf.storage.import = sinon.spy();
    wf.fromObj = sinon.stub().withArgs(walletObj).returns(walletObj);

    var w = wf.fromEncryptedObj("encrypted object", "password");
    should.exist(w);
    wf.storage._setPassphrase.called.should.be.true;
    wf.storage.import.called.should.be.true;
    wf.fromObj.calledWith(walletObj).should.be.false;
  });

  it('should import and update indexes', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var wallet = {
      id: "fake wallet",
      updateIndexes: function(cb) {
        cb();
      }
    };
    wf.fromEncryptedObj = sinon.stub().returns(wallet);

    var w = wf.import("encrypted", "password");

    should.exist(w);
    wallet.should.equal(w);

    wf.fromEncryptedObj = sinon.stub().returns(null);
    (function() {
      wf.import("encrypted", "password")
    }).should.throw();
  });

  it('BIP32 length problem', function() {
    var sconfig = {
      Network: FakeNetwork,
      Blockchain: FakeBlockchain,
      Storage: FakeStorage,
      "networkName": "testnet",
      "network": {
        "key": "g23ihfh82h35rf",
        "host": "162.242.219.26",
        "port": 10009,
        "path": "/",
        "maxPeers": 15,
        "debug": 3
      },
      "limits": {
        "totalCopayers": 10,
        "mPlusN": 15
      },
      "wallet": {
        "requiredCopayers": 2,
        "totalCopayers": 3,
        "reconnectDelay": 100,
        "spendUnconfirmed": 1,
        "verbose": 0
      },
      "blockchain": {
        "host": "test.insight.is",
        "port": 3001
      },
      "socket": {
        "host": "test.insight.is",
        "port": 3001
      },
      "verbose": 0,
      "themes": ["default"],
      storageObj: new FakeStorage(),
      networkObj: new FakeNetwork(),
      blockchainObj: new FakeBlockchain(),
    };
    var wf = new WalletFactory(sconfig, '0.0.1');
    var opts = {
      'requiredCopayers': 2,
      'totalCopayers': 3
    };
    var w = wf.create(opts);

  });

  it('should be able to get current wallets', function() {
    var wf = new WalletFactory(config, '0.0.1');
    var ws = wf.getWallets();

    var w = wf.create({
      name: 'test wallet'
    });
    var ws = wf.getWallets();
    ws.length.should.equal(1);
    ws[0].name.should.equal('test wallet');
  });

  it('should be able to delete wallet', function(done) {
    var wf = new WalletFactory(config, '0.0.1');
    var w = wf.create({
      name: 'test wallet'
    });
    var ws = wf.getWallets();
    ws.length.should.equal(1);
    wf.delete(ws[0].id, function() {
      ws = wf.getWallets();
      ws.length.should.equal(0);
      done();
    });
  });

  it('should return false if wallet does not exist', function() {
    var opts = {
      'requiredCopayers': 2,
      'totalCopayers': 3
    };
    var wf = new WalletFactory(config, '0.0.1');

    var w = wf.open('dummy', opts);
    should.exist(w);
  });

  it('should open a wallet', function() {
    var opts = {
      'requiredCopayers': 2,
      'totalCopayers': 3
    };
    var wf = new WalletFactory(config, '0.0.1');
    var w = wf.create(opts);
    var walletId = w.id;

    wf.read = sinon.stub().withArgs(walletId).returns(w);
    var wo = wf.open(walletId, opts);
    should.exist(wo);
    wf.read.calledWith(walletId).should.be.true;
  });

  it('should return error if network are differents', function() {
    var opts = {
      'requiredCopayers': 2,
      'totalCopayers': 3
    };
    var wf = new WalletFactory(config, '0.0.1');
    var w = wf.create(opts);
    (function() {
      wf._checkNetwork('livenet');
    }).should.throw();
  });

  describe('#joinCreateSession', function() {
    it('should call network.start', function() {
      var wf = new WalletFactory(config, '0.0.1');
      wf.network.cleanUp = sinon.spy();
      wf.network.start = sinon.spy();
      wf.joinCreateSession('8WtTuiFTkhP5ao7AF2QErSwV39Cbur6pdMebKzQXFqL59RscXM', 'test', null, undefined);
      wf.network.start.calledOnce.should.equal(true);
    });
    it('should call network.start with private key', function() {
      var wf = new WalletFactory(config, '0.0.1');
      wf.network.cleanUp = sinon.spy();
      wf.network.start = sinon.spy();
      wf.joinCreateSession('8WtTuiFTkhP5ao7AF2QErSwV39Cbur6pdMebKzQXFqL59RscXM', 'test', null, undefined);
      wf.network.start.getCall(0).args[0].privkey.length.should.equal(64); //privkey is hex of private key buffer
    });
  });

});
