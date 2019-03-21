import { isEquivalentId, createId } from './utils';
import { DuplicateService, InvalidService } from '../utils/errors';

const SEPARATOR = ';';
const REQUIRED = ['type', 'serviceEndpoint'];

const assertId = (service, services) => {
    const collision = services.find((key) => isEquivalentId(key.id, service.id, SEPARATOR));

    if (collision) {
        throw new DuplicateService(service.id);
    }
};

const assertRequired = (publicKey) => {
    REQUIRED.forEach((key) => {
        if (!publicKey[key]) {
            throw new InvalidService(`Service requires \`${key}\` to be defined.`);
        }
    });
};

const assert = (service, services) => {
    assertId(service, services);
    assertRequired(service);
};

export default {
    assert,
    separator: SEPARATOR,
    createId: (did, fragment) => createId(did, fragment, SEPARATOR),
};
