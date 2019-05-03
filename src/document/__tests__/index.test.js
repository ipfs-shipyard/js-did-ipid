import createDocument from '../';
import { mockDid, mockContent, mockPublickKey1, mockPublickKey2, mockService1, mockService2 } from './mocks';

global.Date = class Date {
    constructor() {
        this.toISOString = () => '2019-03-18T15:55:38.636Z';
    }
};

jest.mock('../../utils', () => ({
    ...jest.requireActual('../../utils'),
    generateRandomString: jest.fn(() => 'randomString'),
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('createDocument', () => {
    it('should create document from scratch', async () => {
        const document = await createDocument(mockDid);

        expect(document.getContent()).toEqual(mockContent);
    });

    it('should create document from provided content', async () => {
        const content = { ...mockContent, created: '2019-01-01' };
        const document = await createDocument(mockDid, content);

        expect(document.getContent()).toEqual(content);
    });
});

describe('getContent', () => {
    it('should remove unnecessary properties', async () => {
        const content = { ...mockContent, publicKey: [], service: undefined };
        const document = await createDocument(mockDid, content);

        expect(document.getContent()).toEqual(mockContent);
    });
});

describe('addPublicKey', () => {
    it('should add public key successfully', async () => {
        const document = await createDocument(mockDid);
        const pk = document.addPublicKey({
            type: 'myType',
            publicKeyHex: '1A2B3C',
        });

        const expectedResult = {
            id: 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#randomString',
            controller: 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG',
            type: 'myType',
            publicKeyHex: '1A2B3C',
        };

        expect(pk).toEqual(expectedResult);
        expect(document.getContent()).toEqual({
            ...mockContent,
            publicKey: [expectedResult],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should not accept duplicate ids', async () => {
        const document = await createDocument(mockDid);

        expect(() => {
            document.addPublicKey({
                id: 'myId1',
                type: 'myType',
                controller: 'myController',
                publicKeyHex: '1A2B3C',
            });
            document.addPublicKey({
                id: 'myId1',
                type: 'myType2',
                controller: 'myController2',
                publicKeyHex: '4D5E6F',
            });
        }).toThrow('PublicKey with same did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#myId1 already exists.');
    });

    it('should not accept publicKey without type', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addPublicKey({
                controller: 'myController',
                publicKeyHex: '1A2B3C',
            })
        ).toThrow('PublicKey requires `type` to be defined.');
    });

    it('should not accept publicKey without a `publicKey` prefixed property', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addPublicKey({
                type: 'myType1',
                controller: 'myController',
            })
        ).toThrow('Property prefixed by `publicKey` is required and must be unique');
    });

    it('should not accept publicKey with multiple properties prefixed with `publicKey`', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addPublicKey({
                type: 'myType1',
                controller: 'myController',
                publicKeyHex: '1A2B3C',
                publicKeyFoo: 'bar',
            })
        ).toThrow('Property prefixed by `publicKey` is required and must be unique');
    });

    it('should not accept publicKey with an invalid value encoding', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addPublicKey({
                type: 'myType1',
                controller: 'myController',
                publicKeyFoo: 'bar',
            })
        ).toThrow('Encoding `publicKeyFoo` is invalid');
    });
});

describe('revokePublicKey', () => {
    it('should revoke publicKey with full id successfully', async () => {
        const document = await createDocument(mockDid, mockContent);

        document.revokePublicKey('did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1');
        expect(document.getContent()).toEqual({ ...mockContent });

        document.addPublicKey({ ...mockPublickKey1, id: 'PK1' });
        document.addPublicKey({ ...mockPublickKey2, id: 'PK2' });
        document.revokePublicKey('did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1');
        expect(document.getContent()).toEqual({
            ...mockContent,
            publicKey: [mockPublickKey2],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should revoke publicKey with short id successfully', async () => {
        const content = { ...mockContent, publicKey: [mockPublickKey1, mockPublickKey2] };
        const document = await createDocument(mockDid, content);

        document.revokePublicKey('PK1');

        expect(document.getContent()).toEqual({
            ...mockContent,
            publicKey: [mockPublickKey2],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should revoke publicKey and revoke associated authentication', async () => {
        const content = {
            ...mockContent,
            publicKey: [mockPublickKey1, mockPublickKey2],
            authentication: ['did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1'],
        };
        const document = await createDocument(mockDid, content);

        document.revokePublicKey('PK1');

        expect(document.getContent()).toEqual({
            ...mockContent,
            publicKey: [mockPublickKey2],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });
});

describe('addAuthentication', () => {
    it('should add authentication successfully', async () => {
        const id = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const content = { ...mockContent, publicKey: [mockPublickKey1] };
        const document = await createDocument(mockDid, content);

        const auth = document.addAuthentication(id);

        expect(auth).toEqual(id);
        expect(document.getContent()).toEqual({
            ...content,
            authentication: [id],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should add authentication with short id successfully', async () => {
        const id = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const content = { ...mockContent, publicKey: [mockPublickKey1] };
        const document = await createDocument(mockDid, content);

        const auth = document.addAuthentication('PK1');

        expect(auth).toEqual(id);
        expect(document.getContent()).toEqual({
            ...mockContent,
            publicKey: [mockPublickKey1],
            authentication: [id],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should fail if same id already exists', async () => {
        const id = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const content = { ...mockContent, publicKey: [mockPublickKey1], authentication: [id] };
        const document = await createDocument(mockDid, content);

        expect(() => document.addAuthentication(id)).toThrow('Authentication with same did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1 already exists.');
    });

    it('should fail if no publicKey with same id', async () => {
        const id = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const content = { ...mockContent };
        const document = await createDocument(mockDid, content);

        expect(() => document.addAuthentication(id)).toThrow('Invalid authentication');
    });

    it('should fail auth is not a string', async () => {
        const content = { ...mockContent, publicKey: [mockPublickKey1] };
        const document = await createDocument(mockDid, content);

        expect(() => document.addAuthentication({ id: 'PK1' })).toThrow('Invalid authentication');
    });
});

describe('removeAuthentication', () => {
    it('should remove authentication successfully', async () => {
        const id = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const content = { ...mockContent, authentication: [id] };
        const document = await createDocument(mockDid, content);

        document.removeAuthentication(id);

        expect(document.getContent()).toEqual({ ...mockContent, updated: '2019-03-18T15:55:38.636Z' });
    });

    it('should not update if no id found', async () => {
        const id1 = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK1';
        const id2 = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG#PK2';
        const content = { ...mockContent, publicKey: [mockPublickKey1, mockPublickKey2] };
        const document = await createDocument(mockDid, content);

        document.removeAuthentication(id1);
        expect(document.getContent()).toEqual(content);

        document.addAuthentication('PK2');
        document.removeAuthentication(id1);

        expect(document.getContent()).toEqual({
            ...content,
            authentication: [id2],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });
});

describe('addService', () => {
    it('should add service successfully', async () => {
        const document = await createDocument(mockDid);
        const srvc = document.addService({
            type: 'myServiceType',
            serviceEndpoint: 'http://service.foo.bar',
        });

        const expectedResult = {
            id: 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG;randomString',
            type: 'myServiceType',
            serviceEndpoint: 'http://service.foo.bar',
        };

        expect(srvc).toEqual(expectedResult);
        expect(document.getContent()).toEqual({
            ...mockContent,
            service: [expectedResult],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should not accept duplicate ids', async () => {
        const document = await createDocument(mockDid);

        expect(() => {
            document.addService({
                id: 'foo',
                type: 'myServiceType',
                serviceEndpoint: 'http://service.foo.bar',
            });
            document.addService({
                id: 'foo',
                type: 'myServiceType2',
                serviceEndpoint: 'hhttp://service.foo.bar',
            });
        }).toThrow('Service with same did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG;foo already exists.');
    });

    it('should not accept service without type', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addService({
                serviceEndpoint: 'hhttp://service.foo.bar',
            })
        ).toThrow('Service requires `type` to be defined.');
    });

    it('should not accept service without serviceEndpoint', async () => {
        const document = await createDocument(mockDid);

        expect(() =>
            document.addService({
                type: 'myServiceType',
            })
        ).toThrow('Service requires `serviceEndpoint` to be defined.');
    });

    it('should accept service with additional properties', async () => {
        const document = await createDocument(mockDid);

        document.addService({ ...mockService1, id: 'Service1', foo: 'bar' });

        expect(document.getContent().service[0]).toEqual({ ...mockService1, foo: 'bar' });
    });
});

describe('removeService', () => {
    it('should remove service with full id successfully', async () => {
        const fullId = 'did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG;Service1';
        const document = await createDocument(mockDid);

        document.removeService(fullId);
        expect(document.getContent()).toEqual(mockContent);

        document.addService({ ...mockService1, id: 'Service1' });
        document.addService({ ...mockService2, id: 'Service2' });

        document.removeService(fullId);
        expect(document.getContent()).toEqual({
            ...mockContent,
            service: [mockService2],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });

    it('should remove service with short id successfully', async () => {
        const content = { ...mockContent, service: [mockService1, mockService2] };
        const document = await createDocument(mockDid, content);

        document.removeService('Service2');

        expect(document.getContent()).toEqual({
            ...mockContent,
            service: [mockService1],
            updated: '2019-03-18T15:55:38.636Z',
        });
    });
});
