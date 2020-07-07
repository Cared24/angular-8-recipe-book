import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData {
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

// ---------------------------------
// ERROR HANDLING - START
const handleAuthentication = (
    expiresIn: number,
    email: string,
    userId: string,
    token: string
) => {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
    return new AuthActions.AuthenticateSuccess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate
    })
}
const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred';

    if (!errorRes.error || !errorRes.error.error) {
        return of(new AuthActions.AuthenticateFail(errorMessage));
    }

    switch (errorRes.error.error.message) {
        case 'EMAIL_EXISTS':
            errorMessage = 'This email exists already';
            break;

        case 'EMAIL_NOT_FOUND':
            errorMessage = 'This email does not exist';
            break;

        case 'INVALID_PASSWORD':
            errorMessage = 'This password is not correct';
            break;
    }
    return of(new AuthActions.AuthenticateFail(errorMessage));
};
// ---------------------------------
// ERROR HANDLING - FINISH

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http
                .post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='
                    + environment.firebaseAPIKey,
                    {
                        email: signupAction.payload.email,
                        password: signupAction.payload.password,
                        returnSecureToken: true
                    }
                )
                .pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                    }),
                    map(resData => {
                        return handleAuthentication(
                            +resData.expiresIn,
                            resData.email,
                            resData.localId,
                            resData.idToken
                        )
                    }),
                    catchError(errorRes => {
                        return handleError(errorRes);
                    })
                );
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http
                .post<AuthResponseData>(
                    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                    {
                        email: authData.payload.email,
                        password: authData.payload.password,
                        returnSecureToken: true
                    }
                ).pipe(
                    tap(resData => {
                        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
                    }),
                    map(resData => {
                        return handleAuthentication(
                            +resData.expiresIn,
                            resData.email,
                            resData.localId,
                            resData.idToken
                        )
                    }),
                    catchError(errorRes => {
                        return handleError(errorRes);
                    })
                );
        }),
    );

    @Effect({ dispatch: false })
    authRedirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS),
        tap(() => {
            this.router.navigate(['/']);
        })
    );

    @Effect()
    autoLogin = this.actions$.pipe(
        ofType(AuthActions.AUTO_LOGIN),
        map(() => {
            const userData: { email: string, id: string, _token: string, _tokenExpirationDate: string } = JSON.parse(localStorage.getItem('userData'));

            if (!userData) {
                return { type: 'DUMMY' };
            }

            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );

            if (loadedUser.token) {
                const expirationDuration =
                    new Date(userData._tokenExpirationDate).getTime() -
                    new Date().getTime();
                tap(resData => {
                    this.authService.setLogoutTimer(expirationDuration);
                });
                return new AuthActions.AuthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate)
                });
                // const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                // this.autoLogout(expirationDuration);
            }
            return { type: 'DUMMY' };
        })
    )

    @Effect({ dispatch: false })
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
            this.authService.clearLogoutTimer();
            localStorage.removeItem('userData');
            this.router.navigate(['/auth']);
        })
    )

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) { }
}
/*
Rxjs: map --> automatically wraps what you return into an observable.
Rxjs: Switchmap --> which allows us to create a new observable by taking another observable's data.
    ngrx will subscribe, i don't have to manually do it.
Rxjs: Of() --> simply a utility function or creating a new observable, a new observable without
    an error.

First of all, an effect by default always should return a new action at the end
once it's done because this effect itself doesn't change the state right, it just executes
some code,


effects typically return an observable which holds a new effect which should be dispatched,
this effect doesn't and to let NgRx effect know about that and avoid errors,
you have to pass an object to your @effect decorator where you set: @Effect({dispatch: false})
*/