import '@testing-library/jest-dom';

// Setup global para os testes
beforeAll(() => {
  // Mock de localStorage se necessário
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
});