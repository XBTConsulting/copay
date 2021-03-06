'use strict';

var imports = require('soop').imports();
var EventEmitter = imports.EventEmitter || require('events').EventEmitter;
var bitcore = require('bitcore');
var util = bitcore.util;
var extend = require('util')._extend;
var Message = require('../core/Message');
/*
 * Emits
 *  'connect'
 *    when network layout has change (new/lost peers, etc)
 *
 *  'data'
 *    when an unknown data type arrives
 *
 * Provides
 *  send(toPeerIds, {data}, cb?)
 *
 */

function Network(opts) {
  var self = this;
  opts = opts || {};
  this.apiKey = opts.apiKey || 'lwjd5qra8257b9';
  this.debug = opts.debug || 3;
  this.maxPeers = opts.maxPeers || 10;
  this.reconnectAttempts = opts.reconnectAttempts || 3;
  this.sjclParams = opts.sjclParams || {
    salt: 'f28bfb49ef70573c',
    iter: 500,
    mode: 'ccm',
    ts: parseInt(64),
  };
  this.opts = {};
  ['config', 'port', 'host', 'path', 'debug', 'key', 'secure'].forEach(function(k) {
    if (opts.hasOwnProperty(k)) self.opts[k] = opts[k];
  });
  this.cleanUp();
}

Network.parent = EventEmitter;

Network.prototype.cleanUp = function() {
  this.started = false;
  this.connectedPeers = [];
  this.peerId = null;
  this.privkey = null; //TODO: hide privkey in a closure
  this.key = null;
  this.copayerId = null;
  this.allowedCopayerIds = null;
  this.isInboundPeerAuth = [];
  this.copayerForPeer = {};
  this.connections = {};
  this.criticalErr = '';
  if (this.peer) {
    this.peer.disconnect();
    this.peer.destroy();
    this.peer.removeAllListeners();
    this.peer = null;
  }
  this.closing = 0;
  this.tries = 0;
  this.removeAllListeners();
};

Network.parent = EventEmitter;

// Array helpers
Network._arrayDiff = function(a, b) {
  var seen = [];
  var diff = [];

  for (var i = 0; i < b.length; i++)
    seen[b[i]] = true;

  for (var j = 0; j < a.length; j++)
    if (!seen[a[j]])
      diff.push(a[j]);

  return diff;
};

Network._inArray = function(el, array) {
  return array.indexOf(el) > -1;
};

Network._arrayPushOnce = function(el, array) {
  var ret = false;
  if (!Network._inArray(el, array)) {
    array.push(el);
    ret = true;
  }
  return ret;
};

Network._arrayRemove = function(el, array) {
  var pos = array.indexOf(el);
  if (pos >= 0) array.splice(pos, 1);
  return array;
};

Network.prototype.connectedCopayers = function() {
  var ret = [];
  for (var i in this.connectedPeers) {
    var copayerId = this.copayerForPeer[this.connectedPeers[i]];
    if (copayerId) ret.push(copayerId);
  }
  return ret;
};

Network.prototype._deletePeer = function(peerId) {

  delete this.isInboundPeerAuth[peerId];
  delete this.copayerForPeer[peerId];

  if (this.connections[peerId]) {
    this.connections[peerId].close();
  }
  delete this.connections[peerId];
  this.connectedPeers = Network._arrayRemove(peerId, this.connectedPeers);
};

Network.prototype._onClose = function(peerID) {
  this._deletePeer(peerID);
  this.emit('disconnect', peerID);
};

Network.prototype.connectToCopayers = function(copayerIds) {
  var self = this;
  var arrayDiff = Network._arrayDiff(copayerIds, self.connectedCopayers());

  arrayDiff.forEach(function(copayerId) {
    if (self.allowedCopayerIds && !self.allowedCopayerIds[copayerId]) {
      self._deletePeer(self.peerFromCopayer(copayerId));
    } else {
      self.connectTo(copayerId);
    }
  });
};

Network.prototype._sendHello = function(copayerId) {
  this.send(copayerId, {
    type: 'hello',
    copayerId: this.copayerId,
  });
};

Network.prototype._addConnectedCopayer = function(copayerId, isInbound) {
  var peerId = this.peerFromCopayer(copayerId);
  this._addCopayerMap(peerId, copayerId);
  Network._arrayPushOnce(peerId, this.connectedPeers);
  this.emit('connect', copayerId);
};

Network.prototype.getKey = function() {
  if (!this.key) {
    var key = new bitcore.Key();
    key.private = new Buffer(this.privkey, 'hex');
    key.regenerateSync();
    this.key = key;
  }
  return this.key;
};

//hex version of one's own nonce
Network.prototype.setHexNonce = function(networkNonce) {
  if (networkNonce) {
    if (networkNonce.length !== 16)
      throw new Error('incorrect length of hex nonce');
    this.networkNonce = new Buffer(networkNonce, 'hex');
  }
  else
    this.iterateNonce();
};

//hex version of copayers' nonces
Network.prototype.setHexNonces = function(networkNonces) {
  for (var i in networkNonces) {
    if (!this.networkNonces)
      this.networkNonces = {};
    if (networkNonces[i].length === 16)
      this.networkNonces[i] = new Buffer(networkNonces[i], 'hex');
  }
};

//for oneself
Network.prototype.getHexNonce = function() {
  return this.networkNonce.toString('hex');
};

//for copayers
Network.prototype.getHexNonces = function() {
  var networkNoncesHex = [];
  for (var i in this.networkNonces) {
    networkNoncesHex[i] = this.networkNonces[i].toString('hex');
  }
  return networkNoncesHex;
};

Network.prototype.iterateNonce = function() {
  if (!this.networkNonce || this.networkNonce.length !== 8) {
    this.networkNonce = new Buffer(8);
    this.networkNonce.fill(0);
  }
  //the first 4 bytes of a nonce is a unix timestamp in seconds
  //the second 4 bytes is just an iterated "sub" nonce
  //the whole thing is interpreted as one big endian number
  var noncep1 = this.networkNonce.slice(0, 4);
  noncep1.writeUInt32BE(Math.floor(Date.now()/1000), 0);
  var noncep2uint = this.networkNonce.slice(4, 8).readUInt32BE(0);
  var noncep2 = this.networkNonce.slice(4, 8);
  noncep2.writeUInt32BE(noncep2uint + 1, 0);
  return this.networkNonce;
};

Network.prototype._onData = function(enc, isInbound, peerId) {
  var encUint8Array = new Uint8Array(enc);
  var encbuf = new Buffer(encUint8Array);
  var encstr = encbuf.toString();

  var privkey = this.privkey;
  var key = this.getKey();

  try {
    var encoded = JSON.parse(encstr);
    var prevnonce = this.networkNonces ? this.networkNonces[peerId] : undefined;
    var opts = {prevnonce: prevnonce};
    var decoded = this._decode(key, encoded, opts);

    //if no error thrown in the last step, we can set the copayer's nonce
    if (!this.networkNonces)
      this.networkNonces = {};
    this.networkNonces[peerId] = decoded.nonce;

    var databuf = decoded.payload;
    var datastr = databuf.toString();
    var payload = JSON.parse(datastr);
  } catch (e) {
    this._deletePeer(peerId);
    return;
  }

  if (isInbound && payload.type === 'hello') {
    var payloadStr = JSON.stringify(payload);

    //ensure claimed public key is actually the public key of the peer
    //e.g., their public key should hash to be their peerId
    if (peerId.toString() !== this.peerFromCopayer(payload.copayerId) || peerId.toString() !== this.peerFromCopayer(encoded.pubkey)) {
      this._deletePeer(peerId, 'incorrect pubkey for peerId');
      return;
    }

    if (this.allowedCopayerIds && !this.allowedCopayerIds[payload.copayerId]) {
      this._deletePeer(peerId);
      return;
    }

    this._addConnectedCopayer(payload.copayerId, isInbound);
    this._setInboundPeerAuth(peerId, true);
    return;
  }

  if (!this.copayerForPeer[peerId] || (isInbound && !this.isInboundPeerAuth[peerId])) {
    this._deletePeer(peerId);
    return;
  }

  var self = this;
  switch (payload.type) {
    case 'disconnect':
      this._onClose(peerId);
      break;
    default:
      this.emit('data', self.copayerForPeer[peerId], payload, isInbound);
  }
};

Network.prototype._checkAnyPeer = function(msg) {
  if (this.connectedPeers.length === 1) {
    this.emit('onlyYou');
  }
};

Network.prototype._setupConnectionHandlers = function(dataConn, toCopayerId) {
  var self = this;

  var isInbound = toCopayerId ? false : true;

  dataConn.on('open', function() {
    if (!Network._inArray(dataConn.peer, self.connectedPeers) &&
      !self.connections[dataConn.peer]) {

      self.connections[dataConn.peer] = dataConn;

      // The connecting peer send hello 
      if (toCopayerId) {
        self.emit('connected');
        self._sendHello(toCopayerId);
        self._addConnectedCopayer(toCopayerId);
      }
    }
  });

  dataConn.on('data', function(data) {
    self._onData(data, isInbound, dataConn.peer);
  });

  dataConn.on('error', function(e) {
    self._onClose(dataConn.peer);
    self._checkAnyPeer();
    self.emit('dataError');
  });

  dataConn.on('close', function() {
    if (self.closing) return;

    self._onClose(dataConn.peer);
    self._checkAnyPeer();
  });
};

Network.prototype._handlePeerOpen = function(openCallback) {
  this.connectedPeers = [this.peerId];
  this.copayerForPeer[this.peerId] = this.copayerId;
  return openCallback();
};

Network.prototype._handlePeerError = function(err) {
  console.log('RECV ERROR: ', err);
  if (err.message.match(/Could\snot\sconnect\sto peer/)) {
    this._checkAnyPeer();
  } else {
    this.criticalError = err.message;
  }
};

Network.prototype._handlePeerConnection = function(dataConn) {
  if (this.connectedPeers.length >= self.maxPeers) {
    dataConn.on('open', function() {
      dataConn.close();
    });
  } else {
    this._setInboundPeerAuth(dataConn.peer, false);
    this._setupConnectionHandlers(dataConn);
  }
};

Network.prototype._setupPeerHandlers = function(openCallback) {
  var p = this.peer;
  p.on('open', this._handlePeerOpen.bind(this, openCallback));
  p.on('error', this._handlePeerError.bind(this));
  p.on('connection', this._handlePeerConnection.bind(this));
};

Network.prototype._addCopayerMap = function(peerId, copayerId) {
  if (!this.copayerForPeer[peerId]) {
    if (Object.keys(this.copayerForPeer).length < this.maxPeers) {
      this.copayerForPeer[peerId] = copayerId;
    } else {}
  }
};

Network.prototype._setInboundPeerAuth = function(peerId, isAuthenticated) {
  this.isInboundPeerAuth[peerId] = isAuthenticated;
};

Network.prototype.setCopayerId = function(copayerId) {
  if (this.started) {
    throw new Error('network already started: can not change peerId')
  }
  this.copayerId = copayerId;
  this.copayerIdBuf = new Buffer(copayerId, 'hex');
  this.peerId = this.peerFromCopayer(this.copayerId);
  this._addCopayerMap(this.peerId, copayerId);
};


// TODO cache this.
Network.prototype.peerFromCopayer = function(hex) {
  var SIN = bitcore.SIN;
  return new SIN(new Buffer(hex, 'hex')).toString();
};

Network.prototype.start = function(opts, openCallback) {
  opts = opts || {};

  if (this.started) return openCallback();

  if (!this.privkey)
    this.privkey = opts.privkey;

  this.maxPeers = opts.maxPeers || this.maxPeers;

  if (opts.token)
    this.opts.token = opts.token;

  if (!this.copayerId)
    this.setCopayerId(opts.copayerId);

  var self = this;
  var setupPeer = function() {
    if (self.connectedPeers.length > 0) return; // Already connected!
    if (self.peer) {
      self.peer.destroy();
      self.peer.removeAllListeners();
    }

    if (!self.criticalError && self.tries < self.reconnectAttempts) {
      self.tries++;
      self.opts.token = util.sha256(self.peerId).toString('hex');
      self.peer = new Peer(self.peerId, self.opts);
      self.started = true;
      self._setupPeerHandlers(openCallback);

      setTimeout(setupPeer, 3000); // Schedule retry
      return;
    }
    if (self.criticalError && self.criticalError.match(/taken/)) {
      self.criticalError = ' Looks like you are already connected to this wallet please close all other Copay Wallets '
    }

    self.emit('serverError', self.criticalError);
    self.cleanUp();
  }

  this.tries = 0;
  setupPeer();
};

Network.prototype.getOnlinePeerIDs = function() {
  return this.connectedPeers;
};

Network.prototype.getPeer = function() {
  return this.peer;
};

Network.prototype._encode = function(topubkey, fromkey, payload, opts) {
  var encoded = Message.encode(topubkey, fromkey, payload, opts);
  return encoded;
};


Network.prototype._decode = function(key, encoded, opts) {
  var decoded = Message.decode(key, encoded, opts);
  return decoded;
};

Network.prototype._sendToOne = function(copayerId, payload, cb) {
  if (!Buffer.isBuffer(payload))
    throw new Error('payload must be a buffer');

  var peerId = this.peerFromCopayer(copayerId);
  if (peerId !== this.peerId) {
    var dataConn = this.connections[peerId];
    if (dataConn) {
      dataConn.send(payload);
    }
  }
  if (typeof cb === 'function') cb();
};

Network.prototype.send = function(copayerIds, payload, cb) {
  if (!payload) return cb();

  var self = this;
  if (!copayerIds) {
    copayerIds = this.connectedCopayers();
    payload.isBroadcast = 1;
  }

  if (typeof copayerIds === 'string')
    copayerIds = [copayerIds];

  var payloadStr = JSON.stringify(payload);
  var payloadBuf = new Buffer(payloadStr);

  var l = copayerIds.length;
  var i = 0;
  copayerIds.forEach(function(copayerId) {
    self.iterateNonce();
    var opts = {nonce: self.networkNonce};
    var copayerIdBuf = new Buffer(copayerId, 'hex');
    var encPayload = self._encode(copayerIdBuf, self.getKey(), payloadBuf, opts);
    var enc = new Buffer(JSON.stringify(encPayload));
    self._sendToOne(copayerId, enc, function() {
      if (++i === l && typeof cb === 'function') cb();
    });
  });
};


Network.prototype.isOnline = function() {
  return !!this.peer;
};

Network.prototype.connectTo = function(copayerId) {
  var self = this;

  var peerId = this.peerFromCopayer(copayerId);
  var dataConn = this.peer.connect(peerId, {
    serialization: 'none',
    reliable: true,
  });
  self._setupConnectionHandlers(dataConn, copayerId);
};

Network.prototype.lockIncommingConnections = function(allowedCopayerIdsArray) {
  this.allowedCopayerIds = {};
  for (var i in allowedCopayerIdsArray) {
    this.allowedCopayerIds[allowedCopayerIdsArray[i]] = true;
  }
};

Network.prototype.disconnect = function(cb, forced) {
  var self = this;
  self.closing = 1;
  self.send(null, {
    type: 'disconnect'
  }, function() {
    self.cleanUp();
    if (typeof cb === 'function') cb();
  });
};

module.exports = require('soop')(Network);
