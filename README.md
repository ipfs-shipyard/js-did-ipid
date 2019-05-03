# did-ipid

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][codecov-image]][codecov-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

[npm-url]:https://npmjs.org/package/did-ipid
[downloads-image]:http://img.shields.io/npm/dm/did-ipid.svg
[npm-image]:http://img.shields.io/npm/v/did-ipid.svg
[travis-url]:https://travis-ci.org/ipfs-shipyard/js-did-ipid
[travis-image]:http://img.shields.io/travis/ipfs-shipyard/js-did-ipid/master.svg
[codecov-url]:https://codecov.io/gh/ipfs-shipyard/js-did-ipid
[codecov-image]:https://img.shields.io/codecov/c/github/ipfs-shipyard/js-did-ipid/master.svg
[david-dm-url]:https://david-dm.org/ipfs-shipyard/js-did-ipid
[david-dm-image]:https://img.shields.io/david/ipfs-shipyard/js-did-ipid.svg
[david-dm-dev-url]:https://david-dm.org/ipfs-shipyard/js-did-ipid?type=dev
[david-dm-dev-image]:https://img.shields.io/david/dev/ipfs-shipyard/js-did-ipid.svg

The [IPID DID method](https://github.com/jonnycrunch/ipid) implementation in JavaScript.


## Installation

```sh
$ npm install did-ipid
```

This library is written in modern JavaScript and is published in both CommonJS and ES module transpiled variants.
If you target older browsers please make sure to transpile accordingly. 


## Usage

```js
import createIpid, { getDid } from 'did-ipid';

const did = await getDid(pem);
//=> Returns the DID associated to a private key in PEM format.

const ipid = await createIpid(ipfs);

const didDocument = await ipid.resolve('did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG');
//=> Resolves a DID and returns the respective DID Document.

const didDocument = await ipid.create(pem, (document) => {
	const publicKey = document.addPublicKey({
    	type: 'RsaVerificationKey2018',
        publicKeyHex: '02b97c30de767f084ce3080168ee293053ba33b235d7116a3263d29f1450936b71',
    });
    
    const authentication = document.addAuthentication(publicKey.id);
    
    const service = document.addService({
    	id: 'hub',
    	type: 'HubService',
    	serviceEndpoint: 'https://hub.example.com/',
  	});
});
//=> Creates a new DID and the corresponding DID Document based on the provided private key pem.
//=> The DID Document is published with the added publicKey, authentication and service.

const didDocument = await ipid.update(pem, (document) => {
	document.removeService('hub');
 
    document.addService({
    	id: 'messages',
    	type: 'MessagingService',
    	serviceEndpoint: 'https://example.com/messages/8377464',
  	});
});
//=> Updates a DID Document based on the DID associated to the provided private key pem.
//=> The DID Document is published without the `hub` service and with a new one called `messages`. 

```

## API

### getDid(pem)

Returns the DID associated to a private key in PEM format.

#### pem

Type: `String`

A private key in PEM format.

Supported formats: `pkcs1-pem` or `pkcs8-pem`.

Example:
```js
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCQZyRCPMcBPL2J2SuI2TduR7sy28wmcRzfj8fXQTbj1zJURku
...
-----END RSA PRIVATE KEY-----
```

### IPID

An IPFS node is required to create an IPID instance. Please be sure to check [js-ipfs](https://github.com/ipfs/js-ipfs), the JavaScript implementation of the IPFS protocol, to learn how to create one.

There is currently only one option available during the creation of an IPID instance. The `lifetime` option defines the duration of the DID document availability.

Example:
```js
import createIpid from 'did-ipid';

const ipid = await createIpid(ipfs, { lifetime: '24h' });
```

Notes:
- Please make sure that the IPFS node is `ready` to use.
- This package uses the Key Management provided by IPFS. So during the creation of the node a password must be defined, as an option, to encrypt/decrypt your keys. 

#### resolve(did)

Resolves a DID and provides the respective DID Document.

Returns a Promise that resolves to the DID Document.

##### did

Type: `String`

The DID to resolve.

Example:
```
did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG
```

#### create(privateKeyPem, operations)

Creates a new DID and respective DID Document by applying all the specified operations.

Returns a Promise that resolves to the DID Document.

##### privateKeyPem

Type: `String`

A private key in PEM format.

Example:
```js
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCQZyRCPMcBPL2J2SuI2TduR7sy28wmcRzfj8fXQTbj1zJURku
...
-----END RSA PRIVATE KEY-----
```

##### operations

Type: `Function`

A function that receives a Document instance that provides methods to modify its content.


#### update(privateKeyPem, operations)

Updates an existing DID Document by applying all the specified operations.

Returns a Promise that resolves to the DID Document.

##### privateKeyPem

Type: `String`

A private key in PEM format.

Example:
```js
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCQZyRCPMcBPL2J2SuI2TduR7sy28wmcRzfj8fXQTbj1zJURku
...
-----END RSA PRIVATE KEY-----
```

##### operations

Type: `Function`

A function that receives a Document instance that provides methods to modify its content.


### Document

#### getContent()

Returns the current state of the documents content.

#### addPublicKey(publicKey)

Adds a new Public Key to the document.

Returns the added public key.

##### publicKey

Type: `Object`

An object with all the Public Key required properties as defined in the [DID Public Keys spec](https://w3c-ccg.github.io/did-spec/#public-keys).

- `id` should be provided without a prefixed did.
- If no `id` is provided, one will be generated.
- If no `controller` is provided, it is assumed that it is its own DID. 

#### revokePublicKey(id)

Revokes a Public Key from the document.

Also revokes an authentication that references this public key.

##### id

Type: `String` 

The id of the public key.

#### addAuthentication(authentication)

Adds a new Authentication to the document.

Returns the added authentication.

##### authentication

Type: `String`

The id of the public key that is being referenced.

#### removeAuthentication(id)

Revokes an Authentication from the document.

##### id

Type: `String` 

The id authentication.

#### addService(service)

Adds a new Service Endpoint to the document.

Returns the added service.

##### service

Type: `Object`

An object with all the Service Endpoint required properties as defined in the [DID Service Endpoints spec](https://w3c-ccg.github.io/did-spec/#service-endpoints).

- `id` should be provided without a prefixed did.
- If no `id` is provided, one will be generated.

#### removeService(id)

Revokes a Service Endpoint from the document.

##### id

Type: `String` 

The id of the service endpoint.


## Tests

```sh
$ npm test
$ npm test -- --watch # during development
```

## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
