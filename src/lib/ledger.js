export const INSTANCE_TYPES = ['t3.small', 't3.medium', 't3.large'];

export const ENV_VALUE = /^[A-Za-z0-9._:/@+-]{1,512}$/;

export const SECTIONS = [
  {
    id: 'admin',
    title: 'Initial admin',
    fields: [
      { key: 'SETUP_ADMIN_NAME', label: 'Admin name', required: true, placeholder: 'Ada-Admin' },
      { key: 'SETUP_ADMIN_EMAIL', label: 'Admin email', required: true, placeholder: 'e@e.e', autoComplete: 'email' },
      { key: 'SETUP_ADMIN_PASSWORD', label: 'Admin password', required: true, type: 'password', minLength: 8, autoComplete: 'new-password', hint: 'At least 8 characters. Letters, digits, and . _ : / @ + - only.' },
      { key: 'SETUP_ADMIN_CONTACT_NAME', label: 'Contact name', placeholder: 'Ada-Admin' },
      { key: 'SETUP_ADMIN_CONTACT_EMAIL', label: 'Contact email', placeholder: 'ada@example.com', autoComplete: 'email' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    fields: [
      { key: 'SETUP_VAT_ID', label: 'VAT ID', placeholder: 'CHE-123.456.789' },
      { key: 'SETUP_LEGAL_NAME', label: 'Legal name', placeholder: 'Example-AG' },
      { key: 'SETUP_TRADING_NAME', label: 'Trading name', placeholder: 'Example' },
      { key: 'SETUP_REGISTRATION_NUMBER', label: 'Registration number', placeholder: 'CHE-123.456.789' },
      { key: 'SETUP_STREET', label: 'Street', placeholder: 'Bahnhofstrasse-1' },
      { key: 'SETUP_CITY', label: 'City', placeholder: 'Zurich' },
      { key: 'SETUP_POSTAL_CODE', label: 'Postal code', placeholder: '8001' },
      { key: 'SETUP_COUNTRY', label: 'Country', placeholder: 'Switzerland' },
      { key: 'SETUP_INDUSTRY', label: 'Industry', placeholder: 'Software' },
      { key: 'SETUP_CONTACT_PERSON', label: 'Contact person', placeholder: 'Ada-Admin' },
      { key: 'SETUP_PHONE', label: 'Phone', placeholder: '+41790000000' },
      { key: 'SETUP_WEBSITE', label: 'Website', placeholder: 'https://example.com', wide: true },
      { key: 'SETUP_ORG_DISPLAY_NAME', label: 'Org display name', placeholder: 'Example-AG' },
    ],
  },
];

export const ENV_FIELDS = SECTIONS.flatMap((section) => section.fields);

export function emptyLedgerValues() {
  const values = {
    name: '',
    instance_type: 't3.small',
  };
  for (const field of ENV_FIELDS) {
    values[field.key] = field.default || '';
  }
  return values;
}

export function slugProblem(name) {
  if (!/^[a-z][a-z0-9-]{0,38}$/.test(name) || name.endsWith('-')) {
    return 'Name must be a lowercase slug of at most 39 characters, starting with a letter, and cannot end with a hyphen.';
  }
  return '';
}

export function envValueProblem(field, value) {
  if (!value) return '';
  if (field.minLength && value.length < field.minLength) {
    return `${field.label} must be at least ${field.minLength} characters.`;
  }
  if (field.hexKey && !/^[0-9a-fA-F]{64}$/.test(value)) {
    return `${field.label} must be 64 hex characters.`;
  }
  if (field.type === 'bool' && value !== 'true' && value !== 'false') {
    return `${field.label} must be true or false.`;
  }
  if (!ENV_VALUE.test(value)) {
    return `${field.label} can only use letters, digits, and . _ : / @ + -`;
  }
  return '';
}

export function buildLedgerRequest(values, idempotencyKey) {
  const name = String(values.name || '').trim().toLowerCase();
  const nameError = slugProblem(name);
  if (nameError) return { error: nameError };

  const instanceType = String(values.instance_type || '').trim();
  if (!INSTANCE_TYPES.includes(instanceType)) {
    return { error: 'Choose t3.small, t3.medium, or t3.large.' };
  }

  const environment = {};
  for (const field of ENV_FIELDS) {
    const value = String(values[field.key] || '').trim();
    if (!value) {
      if (field.required) return { error: `${field.label} is required.` };
      continue;
    }
    const problem = envValueProblem(field, value);
    if (problem) return { error: problem };
    environment[field.key] = value;
  }

  return {
    body: {
      name,
      instance_type: instanceType,
      idempotency_key: idempotencyKey,
      environment,
    },
  };
}

export function newIdempotencyKey() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `setup-${suffix}`;
}
