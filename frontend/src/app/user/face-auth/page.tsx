'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadModel, areModelsLoaded } from '@/utils/FaceAuth';
import * as faceapi from 'face-api.js';
import Button from '@/components/Button';
import FaceDetectionLayout from '@/components/FaceDetectionLayout';
import { useRouter } from 'next/navigation';


export default function FaceAuth() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceStatus, setFaceStatus] = useState('❌ No Face Detected');
  const faceDescriptorRef = useRef<number[]>([]);
  const [color, setColor] = useState('text-red-600');
   const router = useRouter();

  // Start webcam stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('❌ Error accessing webcam:', error);
      alert("Please allow webcam to continue");
    }
  };

  // Load face-api models & start webcam
  useEffect(() => {
    async function initModels() {
      await loadModel();
      const loaded = await areModelsLoaded();
      if (loaded) {
        setIsModelLoaded(true);
        startVideo();
      }
    }
    initModels();

    // Cleanup function: stop the camera when leaving the page
    
  }, []);
  useEffect(() =>{
    async function fetchdescriptor() {
      const id = sessionStorage.getItem("id");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/face-descriptor/?id=${id}`);
      if (response.ok){
        const res = await response.json();
        
        const parsedArray: number[] = JSON.parse(res.face_descriptor); // Parse JSON string
        faceDescriptorRef.current = parsedArray;
        console.log(faceDescriptorRef.current)
      }
    }
    fetchdescriptor()
  },[]);

  const cosineSimilarity = (desc1: number[], desc2: number[]): number => {
    const dotProduct = desc1.reduce((sum, val, i) => sum + val * desc2[i], 0);
    const magnitude1 = Math.sqrt(desc1.reduce((sum, val) => sum + val ** 2, 0));
    const magnitude2 = Math.sqrt(desc2.reduce((sum, val) => sum + val ** 2, 0));
  
    if (magnitude1 === 0 || magnitude2 === 0) return 0; // Avoid division by zero
  
    return dotProduct / (magnitude1 * magnitude2);
  };
  
  const detectFace = async () => {
    if (!isModelLoaded || !videoRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (detections.length === 1) {
      setFaceStatus('✅ Single Face Detected');

      const similarity = cosineSimilarity(faceDescriptorRef.current, Array.from(detections[0].descriptor));
      console.log(similarity)
      if (similarity > 0.8){
        setColor('text-green-600');
      }
      

    } else if (detections.length > 1) {
      setFaceStatus('⚠️ Multiple Faces Detected! Only one person should be present.');
      setColor('text-yellow-600');
    } else {
      setFaceStatus('❌ No Face Detected');
      setColor('text-red-600');
    }
  };

  // Run face detection every second when the model is loaded
  useEffect(() => {
    const detctFace = async () => {
    if (!isModelLoaded) return;
    const interval = setInterval(detectFace, 1000);
    return () => clearInterval(interval);
    }
    detctFace();
  });
  
  const handleclick = (e:React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      router.push("/user/vote")
  }

  return (
    <FaceDetectionLayout title="Face Authentication" videoRef={videoRef} faceStatus={faceStatus} color={color}>
      <Button isModelLoaded={isModelLoaded} status={color} onClick={handleclick} />
    </FaceDetectionLayout>
  );
}
