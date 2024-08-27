import { MockEmailProviderA } from './mock-email-provider-a';
import { MockEmailProviderB } from './mock-email-provider-b';

export const providers = [
  new MockEmailProviderA(),
  new MockEmailProviderB()
];
