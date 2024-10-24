import { current } from '@reduxjs/toolkit'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import {useRef} from 'react';
import {getDownloadURL, getStorage,ref, uploadBytesResumable} from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart,updateUserSuccess,updateUserFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess, signOutUserStart, signOutUserFailure } from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import {Link} from 'react-router-dom';

export default function Profile() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePerec, setFilePerec] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [updateSuccess,setUpdateSuccess] = useState(false);
  const [formData,setFormData]= useState({});
  const [userListing,setUserListing] = useState([]);
  const [showListingError,setShowListingError]=useState(false)
  const dispatch = useDispatch();

  

console.log(formData);
  const { currentUser, loading, error } = useSelector((state) => state.user);
   
  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  },[file]
);

const handleFileUpload = (file) => {
  const storage = getStorage(app);
  const fileName = new Date().getTime() + file.name;
  const storageRef = ref(storage, fileName);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress =
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setFilePerec(Math.round(progress));
    },
    (error) => {
      setFileUploadError(true);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
        setFormData({ ...formData, avatar: downloadURL })
      );
    }
  );
};

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.id]: e.target.value });
};


const handleSubmit = async (e) =>{
  e.preventDefault();
  try {
    dispatch(updateUserStart());
    const res = await fetch(`/api/user/update/${currentUser._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success === false) {
      dispatch(updateUserFailure(data.message));
      return;
    }

    dispatch(updateUserSuccess(data));
    setUpdateSuccess(true);
  } catch (error) {
    dispatch(updateUserFailure(error.message));
  }
}

const handleDeleteUser = async()=>{
  try {
    dispatch(deleteUserStart());
    const res = await fetch(`/api/user/delete/${currentUser._id}`,{
      method: "Delete",
    });
    const data = await res.json();

    if(data.success === false){
      dispatch(deleteUserFailure(data.message))
      return;
    }
    
    dispatch(deleteUserSuccess(data));
  } catch (error) {
    dispatch(deleteUserFailure(error.message))
  }
}

const handleSignOut = async() =>{
  try {
    dispatch(signOutUserStart())
    const res = await fetch('/api/auth/signout');
    const data = await res.json();
    if (data.success === false){
      dispatch(signOutUserFailure(data.message));
      return;
    }
    dispatch(deleteUserSuccess(data));
  } catch (error) {
    dispatch(deleteUserFailure(data.message));
  }
}

const handleShowListing =async()=>{
try {
  setShowListingError(false);
  const res= await fetch(`/api/user/listings/${currentUser._id}`)
  const data = await res.json()

  if (data.success === false) {
    setShowListingError(true);
    return;
  }
  setUserListing(data);
  
} catch (error) {
  setShowListingError(true);
  
}
}

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        

      <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img onClick={()=>fileRef.current.click()} src={ formData.avatar||  currentUser.avatar} alt='profile'
        className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'/>

<p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerec > 0 && filePerec < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerec}%`}</span>
          ) : filePerec === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>

        <input type='text' placeholder='username'className='border p-3 rounded-lg' defaultValue={currentUser.username} id='username' onChange={handleChange}/>

        <input type='email' placeholder='email'className='border p-3 rounded-lg' defaultValue={currentUser.email} id='email' onChange={handleChange}/>

        <input type='password' placeholder='password'className='border p-3 rounded-lg'id='password' onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 
        uppercase hover:opacity-90 disabled:opacity-100' >
          {loading ? 'Loading...':"Update"}
        </button>
        <Link className='bg-green-600 text-white p-3 rounded-lg uppercase text-center hover:opacity-70' to={"/create-listing"}>Create Listing</Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      <button onClick={handleShowListing}>Show Listing</button>
      <p>
        {showListingError ? 'Error show Listings':''}
      </p>
      {userListing && userListing.length > 0 && userListing.map((listing)=>{
        <div>
          <Link to={`/listing/${listing._id}`}>
          <img src={listing.img} alt="listig image" />
          </Link>
          <Link to={`/listing/${listing._id}`}>
          <p className='text-slate-600'>{listing.name}</p>
          </Link>
          <div className='flex flex-col items-center'>
            <button className='text-red-600'>Delete</button>
            <button className='text-green-600'>Edit</button>
          </div>

        </div>

      })}

    </div>
  )
}
