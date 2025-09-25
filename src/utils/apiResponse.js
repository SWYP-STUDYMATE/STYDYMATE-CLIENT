export function toDataArray(payload) {
  if (!payload) {
    return [];
  }

  const root = payload?.data ?? payload;

  if (Array.isArray(root)) {
    return root;
  }

  if (root && typeof root === 'object') {
    const nestedCandidates = [
      root.data,
      root.items,
      root.results,
      root.list
    ];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

export function toDataObject(payload, fallback = {}) {
  if (!payload) {
    return fallback;
  }

  const root = payload?.data ?? payload;

  if (root && typeof root === 'object' && !Array.isArray(root)) {
    if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
      return root.data;
    }
    return root;
  }

  return fallback;
}
