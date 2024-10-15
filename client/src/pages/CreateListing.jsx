import React, { useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref, uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';

export default function CreateListing() {
  const [files, setfiles] = useState([]);
  const [Formdata, setFormdata] = useState({
    imageUrls: [],
    name:'',
    description:'',
    address:'',
    type:'',
    bedrooms:1,
    bathrooms:1,
    regularprice:50,
    discountprice:10000000,
    offer:false,
    parking:false,
    furnished: false,


  });
  const [imageuploadError, setImageUploadError] = useState(null)
  const [uploading,setUploading]= useState(false);
  //console.log(files);



  const handleImageSubmit = async (e) => {
    if (files.length < 1) {
      setImageUploadError('you have not selected images')

    } else if (files.length > 0 && files.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[1]));
      }
      Promise.all(promises).then((urls) => {
        setFormdata({
          ...Formdata, imageUrls: Formdata.imageUrls.concat(urls),

        });
        setImageUploadError(false)
        setUploading(false)
      }).catch((err) => {
        setImageUploadError("Image Upload Failed (2Mb max per image)");
      }
      )


    } else {
      setImageUploadError('you can only upload 6 images per listing')
      setUploading(false)
    }

  }
  console.log(Formdata);


  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "State Changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`upload is ${progress}%`)
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((DownloadURL) => {
            resolve(DownloadURL);
          });
        }
      )

    })
  }

  const handleRemoveImage = (index =>{
    setFormdata({
      ...Formdata,imageUrls:Formdata.imageUrls.filter((_,i) => i !==index
    )})
  })


  const handleChange = (e)=>{

  }


  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-center text-3xl font-semibold m-7'>Create Listing</h1>
      <form className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>

          <input type='text' placeholder='Name' className='border p-3 rounded-lg'
            id='name' maxLength="62" minLength="10" required onChange={handleChange} value={Formdata.name} />

          <textarea type='text' placeholder='Description' className='border p-3 rounded-lg'
            id='Description' required onChange={handleChange} value={Formdata.description}/>

          <input type='text' placeholder='Address' className='border p-3 rounded-lg'
            id='Address' required onChange={handleChange} value={Formdata.address}/>
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input type='checkbox' id="sale" className='w-5' onChange={handleChange} checked={Formdata.type === 'sale'}/>
              <span>Sell</span>

            </div>

            <div className='flex gap-2'>
              <input type='checkbox' id="rent" className='w-5' onChange={handleChange} checked={Formdata.type === 'rent'}/>
              <span>Rent</span>

            </div>

            <div className='flex gap-2'>
              <input type='checkbox' id="parking spot" className='w-5' onChange={handleChange} checked={Formdata.parking}/>
              <span>Parking Spot</span>

            </div>

            <div className='flex gap-2'>
              <input type='checkbox' id="finished" className='w-5' onChange={handleChange} checked={Formdata.furnished} />
              <span>Finished</span>

            </div>

            <div className='flex gap-2'>
              <input type='checkbox' id="offer" className='w-5' onChange={handleChange} checked={Formdata.offer}/>
              <span>Offer</span>

            </div>

          </div>

          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input type='number' id='bedrooms' min="1" max="10" required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={Formdata.bedrooms}/>
              <span>Beds</span>
            </div>

            <div className='flex items-center gap-2'>
              <input type='number' id='bathrooms' min="1" max="10" required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={Formdata.bathrooms}/>
              <span>Baths</span>
            </div>

            <div className='flex items-center gap-2'>
              <input type='number' id='regularprice' required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={Formdata.regularprice}/>
              <div className='flex flex-col items-center'>
                <p>Regular Price</p>
                <span className='text-sm'>($/month)</span>
              </div>

            </div>
            <div className='flex items-center gap-2'>
              <input type='number' id='regularprice' required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={Formdata.discountprice}/>
              <div className='flex flex-col items-center'>
                <p>Discount Price</p>
                <span className='text-sm'>($/month)</span>
              </div>

            </div>

          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>Image :
            <span className='font-normal text-gray-500 ml-2'>The first image will be the cover(max 6)</span>
          </p>
          <div className='flex gap-4'>
            <input onChange={(e) => setfiles(e.target.files)} className='p-3 border borderr-gray-300 rounded w-full'
              type='file' id='images' accept='image/*' multiple />
            <button onClick={handleImageSubmit} className='p-3 text-green-400 border border-green-700
            rounded uppercase hover:shadow-lg disabled:opacity-80'>
            {uploading? 'Uploading...': 'Upload'}
            </button>
          </div>
          <p className='text-red-500'>{imageuploadError}</p>
          {
            Formdata.imageUrls.length > 0 && Formdata.imageUrls.map((url,index) => (
              <div key={url}>
                <img src={url} alt='listing image' className='w-20 h-20 object-contain rounded-lg' />
                <button type='button' disabled={uploading} onClick={()=>{handleRemoveImage(index)}}  className='p-3 text-red-500 rounded-lg uppercase hover:opacity-90'>Delete</button>
              </div>
            ))
          }
          <button type='button' className='p-3 bg-slate-700 text-white rounded-lg uppercase
        hover:opacity-100 disabled:opacity-80'>Create Listing</button>
        </div>

      </form>
    </main>
  )
}
