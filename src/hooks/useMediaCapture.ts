// import { useState, useRef } from 'react'

// export const useMediaCapture = () => {
//   const [isCapturing, setIsCapturing] = useState(false)
//   const [capturedMedia, setCapturedMedia] = useState<string | null>(null)
//   const videoRef = useRef<HTMLVideoElement>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const [audioChunks, setAudioChunks] = useState<Blob[]>([])

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { facingMode: 'user' },
//         audio: false 
//       })
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream
//         setIsCapturing(true)
//       }
//     } catch (error) {
//       console.error('Error accessing camera:', error)
//     }
//   }

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const canvas = canvasRef.current
//       const video = videoRef.current
//       const context = canvas.getContext('2d')
      
//       canvas.width = video.videoWidth
//       canvas.height = video.videoHeight
      
//       if (context) {
//         context.drawImage(video, 0, 0)
//         const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
//         setCapturedMedia(imageDataUrl)
//         stopCamera()
//       }
//     }
//   }

//   const stopCamera = () => {
//     if (videoRef.current?.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream
//       stream.getTracks().forEach(track => track.stop())
//       videoRef.current.srcObject = null
//       setIsCapturing(false)
//     }
//   }

//   const startAudioRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const mediaRecorder = new MediaRecorder(stream)
//       mediaRecorderRef.current = mediaRecorder
//       setAudioChunks([])

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           setAudioChunks(prev => [...prev, event.data])
//         }
//       }

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
//         const audioUrl = URL.createObjectURL(audioBlob)
//         setCapturedMedia(audioUrl)
//         stream.getTracks().forEach(track => track.stop())
//       }

//       mediaRecorder.start()
//       setIsCapturing(true)
//     } catch (error) {
//       console.error('Error accessing microphone:', error)
//     }
//   }

//   const stopAudioRecording = () => {
//     if (mediaRecorderRef.current && isCapturing) {
//       mediaRecorderRef.current.stop()
//       setIsCapturing(false)
//     }
//   }

//   const resetCapture = () => {
//     setCapturedMedia(null)
//     setAudioChunks([])
//   }

//   return {
//     isCapturing,
//     capturedMedia,
//     videoRef,
//     canvasRef,
//     startCamera,
//     capturePhoto,
//     stopCamera,
//     startAudioRecording,
//     stopAudioRecording,
//     resetCapture
//   }
// }