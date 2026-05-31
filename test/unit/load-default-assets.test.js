const md5 = require('js-md5');

const ScratchStorage = require('../../dist/node/scratch-storage');

// Hash and file size of each default asset
const knownSizes = {
    '5be19e095b00a47ca9f64345f3e11eb8': 19568,
    '3b0486b26f2d51bb800c49cfedb48034': 383694,
    '019b379f699e0e93a2113866f7997c9e': 611
};

const getDefaultAssetTypes = storage => {
    const defaultAssetTypes = [storage.AssetType.ImageBitmap, storage.AssetType.ImageVector, storage.AssetType.Sound];
    return defaultAssetTypes;
};

const getDefaultAssetIds = (storage, defaultAssetTypes) => {
    const defaultIds = {};
    for (const assetType of defaultAssetTypes) {
        const id = storage.getDefaultAssetId(assetType);
        defaultIds[assetType.name] = id;
    }
    return defaultIds;
};

test('constructor', () => {
    const storage = new ScratchStorage();
    expect(storage).toBeInstanceOf(ScratchStorage);
});

test('getDefaultAssetId', () => {
    const storage = new ScratchStorage();
    const defaultAssetTypes = getDefaultAssetTypes(storage);
    const defaultIds = getDefaultAssetIds(storage, defaultAssetTypes);
    for (const assetType of defaultAssetTypes) {
        const id = defaultIds[assetType.name];
        expect(typeof id).toBe('string');
    }
});

test('load', () => {
    const storage = new ScratchStorage();
    const defaultAssetTypes = getDefaultAssetTypes(storage);
    const defaultIds = getDefaultAssetIds(storage, defaultAssetTypes);

    const promises = [];
    const checkAsset = (assetType, id, asset) => {
        expect(asset).toBeInstanceOf(storage.Asset);
        expect(asset.assetId).toStrictEqual(id);
        expect(asset.assetType).toStrictEqual(assetType);
        expect(asset.data.length).toBeTruthy();
        expect(asset.data.length).toBe(knownSizes[id]);
        expect(md5(asset.data)).toBe(id);
    };
    for (const assetType of defaultAssetTypes) {
        const id = defaultIds[assetType.name];

        const promise = storage.load(assetType, id);
        expect(promise).toBeInstanceOf(Promise);

        const checkedPromise = promise.then(asset => checkAsset(assetType, id, asset));

        promises.push(checkedPromise);
    }

    return Promise.all(promises);
});
