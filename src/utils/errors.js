class BaseError extends Error {
    constructor(message, code) {
        super(message);

        Error.captureStackTrace(this, this.constructor);

        Object.assign(this, { code });
    }
}

// Authentication Based -------------------------------------

export class DuplicateAuthentication extends BaseError {
    constructor(id) {
        super(`Authentication with same ${id} already exists.`, 'DUPLICATE_AUTHENTICATION');
    }
}

export class InvalidAuthentication extends BaseError {
    constructor(message) {
        message = message || 'Invalid authentication.';

        super(message, 'INVALID_AUTHENTICATION');
    }
}

// ----------------------------------------------------------

// Public Key Based -----------------------------------------

export class DuplicatePublicKey extends BaseError {
    constructor(id) {
        super(`PublicKey with same ${id} already exists.`, 'DUPLICATE_PUBLICKEY');
    }
}

export class InvalidPublicKey extends BaseError {
    constructor(message) {
        message = message || 'Invalid public key.';

        super(message, 'INVALID_PUBLICKEY');
    }
}

// ----------------------------------------------------------

// Service Endpoint Based -----------------------------------

export class DuplicateService extends BaseError {
    constructor(id) {
        super(`Service with same ${id} already exists.`, 'DUPLICATE_SERVICE');
    }
}

export class InvalidService extends BaseError {
    constructor(message) {
        message = message || 'Invalid service.';

        super(message, 'INVALID_SERVICE');
    }
}

// ----------------------------------------------------------

// IPFS/IPNS Based ------------------------------------------

export class InvalidDid extends BaseError {
    constructor(did) {
        super(`Invalid DID: ${did}`, 'INVALID_DID');
    }
}

export class IllegalCreate extends BaseError {
    constructor(message) {
        message = message || 'Document already exists.';

        super(message, 'ILLEGAL_CREATE');
    }
}

export class UnavailableIpfs extends BaseError {
    constructor(message) {
        message = message || 'IPFS node is unavailable.';

        super(message, 'IPFS_UNAVAILABLE');
    }
}

// ----------------------------------------------------------
