import {setupServer} from 'msw/node';

/** Tests register their own handlers; anything unhandled fails the test. */
export const server = setupServer();
