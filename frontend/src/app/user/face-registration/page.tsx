'use client';
import React, { useEffect, useRef, useState } from 'react';
import { loadModel, areModelsLoaded } from '@/utils/FaceAuth';
import * as faceapi from 'face-api.js';
import Button from '@/components/Button';
import FaceDetectionLayout from '@/components/FaceDetectionLayout';
import { useRouter } from 'next/navigation';

export default function FaceRegistration() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceStatus, setFaceStatus] = useState('❌ No Face Detected');
  const [color, setColor] = useState('text-red-600');
  const [face, setFace] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const router =useRouter();

  const startVideo = async () => {
    try {
      const stream= await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('❌ Error accessing webcam:', error);
    }
  };
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
  
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  useEffect(() => {
    async function initModels() {
      await loadModel();
      if (areModelsLoaded()) {
        setIsModelLoaded(true);
        startVideo();
      }
    }
    initModels();
  }, []);

  const detectFace = async () => {
    if (!isModelLoaded || !videoRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 1) {
      setFaceStatus('✅ Single Face Detected');
      setColor('text-green-600');
      const faceDescriptorArray = Array.from(detections[0].descriptor);
      setFace(JSON.stringify(faceDescriptorArray));

      // Capture Image Snapshot
      captureImage();
    } else if (detections.length > 1) {
      setFaceStatus('⚠️ Multiple Faces Detected! Only one person should be present.');
      setColor('text-yellow-600');
    } else {
      setFaceStatus('❌ No Face Detected');
      setColor('text-red-600');
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context is not available.');
      return;
    }

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'captured_image.jpg', { type: 'image/jpeg' });
        setImage(file); // Store image in state
      }
    }, 'image/jpeg');
  };

  useEffect(() => {
    if (!isModelLoaded) return;
    const interval = setInterval(detectFace, 1000);
    return () => clearInterval(interval);
  });

  const handleclick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setColor("bg-gray-400");
    
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      console.error('No user data found in session storage');
      return;
    }
    const user = JSON.parse(storedUser);

    const formData = new FormData();
    formData.append('id', user.id);
    formData.append('username', user.name);
    formData.append('password', user.password);
    formData.append("walletaddress",user.address);
    formData.append('email', user.email);
    formData.append('state',user.state)
    formData.append('face_descriptor', face);

    if (image) {
      formData.append('image', image);
    } else {
      console.error('No captured image available');
      return;
    }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
        method: 'POST',
        body:formData

      });
      if (!response.ok){
        const  res= await response.json()
        setFaceStatus(`❌ ${res.message}`)
      }
      else{
        router.push("/user/login")
      }
      stopVideo()
  };

  return (
    <FaceDetectionLayout title="Face Registration" videoRef={videoRef} faceStatus={faceStatus} color={color} >
      <Button isModelLoaded={isModelLoaded} status={color} onClick={handleclick} />
    </FaceDetectionLayout>
  );
}
