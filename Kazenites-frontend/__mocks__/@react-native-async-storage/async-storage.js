const createAsyncStorageMock = () => {
  let storage = {};

  return {
    setItem: jest.fn(async (key, value) => {
      storage[key] = value;
      return value;
    }),
    getItem: jest.fn(async key => storage[key] ?? null),
    removeItem: jest.fn(async key => {
      delete storage[key];
    }),
    clear: jest.fn(async () => {
      storage = {};
    }),
    getAllKeys: jest.fn(async () => Object.keys(storage)),
    mergeItem: jest.fn(async (key, value) => {
      const currentValue = storage[key];
      if (currentValue) {
        try {
          const currentObj = JSON.parse(currentValue);
          const nextObj = JSON.parse(value);
          storage[key] = JSON.stringify({ ...currentObj, ...nextObj });
        } catch (e) {
          storage[key] = value;
        }
      } else {
        storage[key] = value;
      }
    }),
  };
};

export default createAsyncStorageMock();
export const AsyncStorage = createAsyncStorageMock();
