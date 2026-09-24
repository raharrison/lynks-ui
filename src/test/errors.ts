import {AxiosError, AxiosHeaders} from 'axios';

/** An axios error shaped like the server's, for code that is mocked above the network. */
export function apiError(status: number, data?: unknown) {
    return new AxiosError('Request failed', String(status), undefined, undefined, {
        data,
        status,
        statusText: '',
        headers: {},
        config: {headers: new AxiosHeaders()},
    });
}
