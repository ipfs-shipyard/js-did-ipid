export class BaseError extends Error {
    constructor(message, code, props) {
        super(message);

        Object.assign(this, {
            ...props,
            code,
            name: this.constructor.name,
        });

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);

            return;
        }

        this.stack = (new Error(message)).stack;
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
    constructor(did, message, props) {
        message = message || `Invalid DID: ${did}`;

        super(message, 'INVALID_DID', props);
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

// Document Based -----------------------------------

export class InvalidDocument extends BaseError {
    constructor(message) {
        message = message || 'Document is invalid.';

        super(message, 'INVALID_DOCUMENT');
    }
}

export class InvalidIdPrefix extends BaseError {
    constructor() {
        super('Id prefix should be a string without reserved characters: ["#", ";"]', 'INVALID_ID_PREFIX');
    }
}

// ----------------------------------------------------------
