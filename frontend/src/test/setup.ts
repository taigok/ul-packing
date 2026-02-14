import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!('ResizeObserver' in window)) {
  window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
}
