import React from 'react';
import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';
import { app } from '../firebase';

export default function OAuth() {
     const handleGoogleClick= async()=>{
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);

            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: result.user.displayName,
                  email: result.user.email,
                  photo: result.user.photoURL,
                }),
              });

              const data = await res.json()
            
        } catch (error) {
            console.log('could not sign in with google', error);
        }
     }


  return (
    <button onClick={handleGoogleClick} type='button' className='bg-red-600 text-white p-3 rounded-lg uppercase hover:opacity-70'>
        continue with google
    </button>
  )
}
