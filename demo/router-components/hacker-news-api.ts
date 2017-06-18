import Firebase = require('firebase');

Firebase.initializeApp({ databaseURL: 'https://hacker-news.firebaseio.com'});
const db = Firebase.database().ref('/v0');

export default function

  watch(path: string, callback: Function) {
    const ref = db.child(path);
    const cb = snapshot => callback(snapshot.val());
    ref.on('value', cb);
    return () => ref.off('value', cb);
  }

  // start(path: string, callback: Function) {
  //   const ref = db.child(path);
  //   const cb = snapshot => callback(snapshot.val());
  //   ref.on('value', cb);
  //   return () => ref.off('value', cb);
  // },

