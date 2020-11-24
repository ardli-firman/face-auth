const imageUpload = document.getElementById("foto");
const alert = document.getElementById("alert");
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models")
]).then(start);

async function start() {
    const container = document.createElement("div");
    container.style.position = "relative";
    document.body.append(container);
    const LabeledFaceDescriptors = await getLabeleFotosFromDb();
    const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6);
    console.log(faceMatcher);
    alert.innerHTML = `<h2>Success Load</h2>`;
    imageUpload.addEventListener("change", async () => {
        const image = await faceapi.bufferToImage(imageUpload.files[0]);
        container.append(image);
        const canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);
        const displaySize = { width: image.width, height: image.height };
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi
            .detectAllFaces(image)
            .withFaceLandmarks()
            .withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map(d => {
            return faceMatcher.findBestMatch(d.descriptor);
        });
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: result.toString()
            });
            drawBox.draw(canvas);
        });
    });
}

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
                .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();
            descriptors.push(detection.descriptor);
            return new faceapi.LabeledFaceDescriptors(l, descriptors);
        })
    );
}
// async function loadLabeledImages() {
//     const data = await fetch("http://localhost:3000/people-data");
//     const labels = await data.json();
//     return Promise.all(
//         labels.map(async label => {
//             const descriptions = [];
//             for (let i = 1; i <= 1; i++) {
//                 const img = await faceapi.fetchImage(
//                     `http://127.0.0.1:3000/images/${label}/${i}.jpg`
//                 );
//                 const detections = await faceapi
//                     .detectSingleFace(img)
//                     .withFaceLandmarks()
//                     .withFaceDescriptor();
//                 descriptions.push(detections.descriptor);
//             }
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     );
// }
