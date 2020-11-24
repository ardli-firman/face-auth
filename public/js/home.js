const detectFace = document.getElementById("video");
const alert = document.getElementById("alert");
Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream;
        let mediaStreamTrack = stream.getVideoTracks()[0];
        imageCapture = new ImageCapture(mediaStreamTrack);
        console.log(imageCapture);
    });
}

detectFace.addEventListener("play", async () => {
    const fotoLabels = await getLabeleFotosFromDb();
    const faceMatcher = new faceapi.FaceMatcher(fotoLabels, 0.6);
    alert.innerHTML = "<h2>Success Load</h2>";
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    // setInterval(async () => {
    //     const detections = await faceapi
    //         .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    //         .withFaceLandmarks()
    //         .withFaceDescriptors();
    //     const resizedDetections = faceapi.resizeResults(
    //         detections,
    //         displaySize
    //     );
    //     const results = resizedDetections.map(d => {
    //         return faceMatcher.findBestMatch(d.descriptor);
    //     });
    //     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    //     faceapi.draw.drawDetections(canvas, results);
    //     faceapi.draw.drawFaceLandmarks(canvas, results);
    // }, 100);
});

async function getDataPeople() {
    const data = await fetch("http://localhost:3000/people");
    const datas = await data.json();
    const dataPeople = [];
    datas.map(d => {
        let blobImages = new Blob([new Uint8Array(d.foto.data).buffer]);
        let People = {
            nama: d.nama,
            foto: blobImages
        };
        dataPeople.push(People);
    });
    return dataPeople;
}

async function getLabeleFotosFromDb() {
    const dataPeople = await getDataPeople();
    const labels = dataPeople.map(d => {
        return d.nama;
    });
    return Promise.all(
        labels.map(async (l, i) => {
            const descriptors = [];
            const img = await faceapi.bufferToImage(dataPeople[i].foto);
            const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();
            descriptors.push(detection.descriptor);
            return new faceapi.LabeledFaceDescriptors(l, descriptors);
        })
    );
}
