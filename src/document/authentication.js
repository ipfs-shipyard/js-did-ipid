import { isString, isPlainObject } from 'lodash';
import { DuplicateAuthentication, InvalidAuthentication } from '../utils/errors';

const parseId = (authentication) =>
    isPlainObject(authentication) ? authentication.id : authentication;

const assertId = (id, authentications) => {
    const collision = authentications.some((auth) => parseId(auth) === id);

    if (collision) {
        throw new DuplicateAuthentication(id);
    }
};

const assertType = (authentication) => {
    if (!isString(authentication)) {
        throw new InvalidAuthentication();
    }
};

const assert = (authentication, authentications) => {
    assertType(authentication);
    assertId(parseId(authentication), authentications);
};

export default {
    assert,
    parseId,
};
