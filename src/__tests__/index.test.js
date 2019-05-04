import { Buffer } from 'buffer';
import createIpid from '../index';
import { createMockIpfs, mockPath, mockIpnsHash, mockDid, mockDocument, mockPem } from './mocks';

global.Date = class Date {
    constructor() {
        this.toISOString = () => '2019-03-18T15:55:38.636Z';
    }
};

jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    generateRandomString: jest.fn(() => 'randomString'),
}));

let mockIpfs;

beforeEach(() => {
    jest.clearAllMocks();
    mockIpfs = createMockIpfs();
});

describe('factory', () => {
    it('should create ipid with all specification methods', async () => {
        const ipid = await createIpid(mockIpfs);

        expect(typeof ipid.resolve).toEqual('function');
        expect(typeof ipid.create).toEqual('function');
        expect(typeof ipid.update).toEqual('function');
    });

    it('should not create ipid if ipfs is not provided', async () => {
        expect(createIpid()).rejects.toThrow('IPFS node is unavailable');
    });

    it('should not create ipid if ipfs is not online', async () => {
        expect(createIpid({ isOnline: () => false })).rejects.toThrow('IPFS node is unavailable');
    });
});

describe('resolve', () => {
    it('should resolve successfully', async () => {
        const ipid = await createIpid(mockIpfs);
        const document = await ipid.resolve(mockDid);

        expect(document).toEqual(mockDocument);

        expect(mockIpfs.name.resolve).toHaveBeenCalledTimes(1);
        expect(mockIpfs.name.resolve.mock.calls[0][0]).toEqual(mockIpnsHash);

        expect(mockIpfs.get).toHaveBeenCalledTimes(1);
        expect(mockIpfs.get.mock.calls[0][0]).toEqual(mockPath);
    });

    it('should fail if no ipns record found', async () => {
        const ipfs = { ...mockIpfs, name: { resolve: jest.fn((identifier, options, callback) => callback('foo', {})) } };
        const ipid = await createIpid(ipfs);

        await expect(ipid.resolve(mockDid)).rejects.toThrow('Unable to resolve document with did: did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG');

        expect(ipfs.name.resolve).toHaveBeenCalledTimes(1);
        expect(ipfs.name.resolve.mock.calls[0][0]).toEqual(mockIpnsHash);

        expect(ipfs.get).toHaveBeenCalledTimes(0);
    });

    it('should fail if can\'t get file', async () => {
        const ipfs = { ...mockIpfs, get: jest.fn((identifier, options, callback) => callback('foo', {})) };
        const ipid = await createIpid(ipfs);

        await expect(ipid.resolve(mockDid)).rejects.toThrow('Unable to resolve document with did: did:ipid:QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG');

        expect(ipfs.name.resolve).toHaveBeenCalledTimes(1);
        expect(ipfs.name.resolve.mock.calls[0][0]).toEqual(mockIpnsHash);

        expect(ipfs.get).toHaveBeenCalledTimes(1);
        expect(ipfs.get.mock.calls[0][0]).toEqual(mockPath);
    });

    it('should fail if document content is invalid', async () => {
        const ipfs = { ...mockIpfs, get: jest.fn(async () => [{ content: '123' }]) };
        const ipid = await createIpid(ipfs);

        await expect(ipid.resolve(mockDid)).rejects.toThrow('Document content must be a plain object.');

        expect(ipfs.name.resolve).toHaveBeenCalledTimes(1);
        expect(ipfs.name.resolve.mock.calls[0][0]).toEqual(mockIpnsHash);

        expect(ipfs.get).toHaveBeenCalledTimes(1);
        expect(ipfs.get.mock.calls[0][0]).toEqual(mockPath);
    });
});

describe('create', () => {
    it('should create successfully', async () => {
        const operations = jest.fn();
        const ipid = await createIpid(mockIpfs);

        ipid.resolve = jest.fn(() => { throw new Error('foo'); });

        const document = await ipid.create(mockPem, operations);

        expect(ipid.resolve).toHaveBeenCalledTimes(1);
        expect(ipid.resolve).toHaveBeenCalledWith(mockDid);

        expect(operations).toHaveBeenCalledTimes(1);
        expect(operations.mock.calls[0][0].constructor.name).toEqual('Document');

        expect(mockIpfs.key.list).toHaveBeenCalledTimes(2);

        expect(mockIpfs.key.import).toHaveBeenCalledTimes(1);
        expect(mockIpfs.key.import).toHaveBeenCalledWith('js-ipid-randomString', mockPem, undefined);

        expect(mockIpfs.key.rm).toHaveBeenCalledTimes(1);

        expect(mockIpfs.add).toHaveBeenCalledTimes(1);
        expect(mockIpfs.add).toHaveBeenCalledWith(Buffer.from(JSON.stringify(document)));

        expect(mockIpfs.name.publish).toHaveBeenCalledTimes(1);
        expect(mockIpfs.name.publish).toHaveBeenCalledWith(
            'QmdVJSHpB75K3EbyVC9zvsPp6RfYAjonbr4yP6Zzuggfmc',
            { key: 'js-ipid-randomString', lifetime: '87600h', ttl: '87600h' }
        );
    });

    it('should fail if document already exists', async () => {
        const operations = jest.fn();
        const ipid = await createIpid(mockIpfs);

        await expect(ipid.create(mockPem, operations)).rejects.toThrow('Document already exists.');

        expect(operations).toHaveBeenCalledTimes(0);
    });

    it('should fail if a document operation fails', async () => {
        const operations = jest.fn(() => { throw new Error('Operation Failed'); });
        const ipid = await createIpid(mockIpfs);

        ipid.resolve = jest.fn(() => { throw new Error('foo'); });

        await expect(ipid.create(mockPem, operations)).rejects.toThrow('Operation Failed');

        expect(operations).toHaveBeenCalledTimes(1);
    });
});

describe('update', () => {
    it('should update successfully', async () => {
        const operations = jest.fn();
        const ipid = await createIpid(mockIpfs);

        ipid.resolve = jest.fn(() => mockDocument);

        const document = await ipid.update(mockPem, operations);

        expect(ipid.resolve).toHaveBeenCalledTimes(1);
        expect(ipid.resolve).toHaveBeenCalledWith(mockDid);

        expect(operations).toHaveBeenCalledTimes(1);
        expect(operations.mock.calls[0][0].constructor.name).toEqual('Document');

        expect(mockIpfs.key.list).toHaveBeenCalledTimes(2);

        expect(mockIpfs.key.import).toHaveBeenCalledTimes(1);
        expect(mockIpfs.key.import).toHaveBeenCalledWith('js-ipid-randomString', mockPem, undefined);

        expect(mockIpfs.key.rm).toHaveBeenCalledTimes(1);

        expect(mockIpfs.add).toHaveBeenCalledTimes(1);
        expect(mockIpfs.add).toHaveBeenCalledWith(Buffer.from(JSON.stringify(document)));

        expect(mockIpfs.name.publish).toHaveBeenCalledTimes(1);
        expect(mockIpfs.name.publish).toHaveBeenCalledWith(
            'QmdVJSHpB75K3EbyVC9zvsPp6RfYAjonbr4yP6Zzuggfmc',
            { key: 'js-ipid-randomString', lifetime: '87600h', ttl: '87600h' }
        );
    });

    it('should fail if no document available', async () => {
        const operations = jest.fn();
        const ipid = await createIpid(mockIpfs);

        ipid.resolve = jest.fn(() => { throw new Error('foo'); });

        await expect(ipid.update(mockPem, operations)).rejects.toThrow('foo');

        expect(ipid.resolve).toHaveBeenCalledTimes(1);
        expect(ipid.resolve).toHaveBeenCalledWith(mockDid);
    });
});
