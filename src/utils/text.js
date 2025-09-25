const candidateKeys = [
  'displayName',
  'name',
  'title',
  'label',
  'text',
  'value',
  'description',
  'bio',
  'summary',
  'message'
];

const toLocationString = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { city, region, state, country } = value;
  const parts = [city, region ?? state, country]
    .filter((part) => typeof part === 'string' && part.trim() !== '');

  if (parts.length > 0) {
    return parts.join(', ');
  }

  return null;
};

export const toDisplayText = (value, fallback = null) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const normalizedItems = value
      .map((item) => toDisplayText(item))
      .filter((item) => typeof item === 'string' && item.trim() !== '');

    if (normalizedItems.length > 0) {
      return normalizedItems.join(', ');
    }

    return fallback;
  }

  if (typeof value === 'object') {
    for (const key of candidateKeys) {
      const candidate = value[key];
      if (typeof candidate === 'string' && candidate.trim() !== '') {
        return candidate;
      }
    }

    const locationString = toLocationString(value);
    if (locationString) {
      return locationString;
    }

    const stringValues = Object.values(value).filter(
      (item) => typeof item === 'string' && item.trim() !== ''
    );

    if (stringValues.length > 0) {
      return stringValues.join(', ');
    }

    return fallback;
  }

  return String(value);
};

export default toDisplayText;
