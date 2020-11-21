import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';

import {User} from "@shared/models";

const userSubject: ReplaySubject<User> = new ReplaySubject(1);

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor() {
        this.user = {
            id: '123',
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'no-reply@bobsmith.com',
        };
    }

    set user(user: User) {
        userSubject.next(user);
    }

    get user$(): Observable<User> {
        return userSubject.asObservable();
    }
}
