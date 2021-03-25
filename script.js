console.log("JavaScript loaded successfully")

const video = document.getElementById('video');   // Getting the video element

// Loading all the models required for the face-detection 

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),   // Face Detector model
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),  // Sets Landmarks
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Face recognition
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),  // Facial Expressions

]).then(accessVideo)   // Once loaded start the accessVideo fn

function accessVideo() {      // Gets the webcam video for detection
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err),
  )
}
// On playing the video faces must be detected

video.addEventListener('play', () => {

  const canvas = faceapi.createCanvasFromMedia(video);    // Creating a canvas for drawing the face detection

  document.body.append(canvas);     // Appendeing the canvas to the body  

  const displaySize = { width: video.width, height: video.height }  // Setting the display size equal to the video dimensions

  faceapi.matchDimensions(canvas, displaySize)
  // We use async here as the face-api is an asynchronous library plus we want all the functions to happen simultaneoulsy
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions() ; // sets the detections with landmarks and expressions
    const resizedDetections = faceapi.resizeResults(detections, displaySize)  // Resizes the results to the dimensions of the canvas
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    // Then we draw all the detecions, Landmarks and Expressions
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100) // Refreshes every 10ms so as to follow the face 
})