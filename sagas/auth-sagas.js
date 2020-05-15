import { takeEvery, put, all, call } from 'redux-saga/effects';
import * as firebase from 'firebase';
import * as RootNavigation from '../routes/RootNavigation';
import { loginSuccess, loginFailure, createAccountFailure, signOutSuccess, signOutFailure } from '../redux/actions/auth.actions';
import { saveUserRequest, saveUserSuccess, saveUserFailure } from '../redux/actions/database.actions';

export function* login(action){
    try{
        const auth = firebase.auth();
        const result = yield call(
            [auth, auth.signInWithEmailAndPassword],
            action.payload.email,
            action.payload.password
        );
        let uid = result.user.uid;
        yield put(loginSuccess(result.user));
        yield RootNavigation.navigate('main', {
            screen: 'dashboard',
            params: { uid: uid }
        });
    }catch(error){
        put(loginFailure(error.message));
    }
}

export function* onLoginRequest(){
    yield takeEvery("LOGIN_REQUEST", login);
}

export function* createAccount(action){
    try{
        const auth = firebase.auth();
        const result = yield call(
            [auth, auth.createUserWithEmailAndPassword],
            action.payload.email,
            action.payload.password
        );
        let uid = result.user.uid;
        yield put(saveUserRequest({
            uid: uid,
            fullname: action.payload.fullname,
            email: action.payload.email
        }));
        yield RootNavigation.navigate('main', {
            screen: 'dashboard',
            params: { uid: uid }
        });
    }catch(error){
        yield put(createAccountFailure(error.message))
    }
}

export function* onCreateAccountRequest(){
    yield takeEvery("CREATE_ACCOUNT_REQUEST", createAccount);
}

export function* saveUser(action){
    console.log("Inside save User")
    try{
        const ref = firebase.database().ref('users/' + action.payload.uid)
        const result = yield call(
            [ref, ref.set],
            {
                id: action.payload.uid,
                fullname: action.payload.fullname,
                email: action.payload.email
            }
        );
        yield console.log("Here in saveUser")
        console.log("The result is: ", result);
        yield put(saveUserSuccess(result.user));
    }catch(error){
        yield put(saveUserFailure(error.message));
    }
}

export function* onSaveUserRequest(){
    yield takeEvery("SAVE_USER_REQUEST", saveUser);
}

export function* signOut(action){
    try{
        const auth = firebase.auth();
        const result = yield call(
            [auth, auth.signOut],
        );
        yield put(signOutSuccess());
        yield RootNavigation.navigate('auth', {
            screen: 'welcome'
        });
    }catch(error){
        yield put(signOutFailure(error.message))
    }
}

export function* onsignOutRequest(){
    yield takeEvery("SIGN_OUT_REQUEST", signOut);
}

export function* authSagas(){
    yield all([
        call(onLoginRequest),
        call(onCreateAccountRequest),
        call(onSaveUserRequest),
        call(onsignOutRequest)
    ])
};