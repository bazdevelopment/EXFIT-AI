import * as functions from 'firebase-functions/v1';

// Correctly invoke the internal notification function and add its
// returned Promise to our array for parallel execution.
export const fakeContext: functions.https.CallableContext = {
  auth: { uid: 'some-user-id', token: {} as any }, // simulate auth context
  rawRequest: {} as any, // if needed
  instanceIdToken: undefined,
  app: undefined,
};
