import firebase from "firebase";

export const fbConfig = {
    apiKey: process.env.REACT_APP_FB_APIKey,
    authDomain: process.env.REACT_APP_FB_AUTHD,
    databaseURL: process.env.REACT_APP_FB_DBURL,
    projectId: process.env.REACT_APP_FB_PID,
    storageBucket: process.env.REACT_APP_FB_SB,
    messagingSenderId: process.env.REACT_APP_FB_MSID,
    appId: process.env.REACT_APP_FB_APPID,
    measurementId: process.env.REACT_APP_FB_MID
}


const initFirebase = firebase.initializeApp(fbConfig);
export const db = initFirebase.firestore();

