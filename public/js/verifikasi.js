// Note: Client side face verification
const video = document.getElementById("video");
const verify = document.getElementById("verify");
const output = document.getElementById("output");

// Load all module with promise
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models")
]).then(start);

// Init start
async function start() {
    // Get labeled fotos from db
    const LabeledFaceDescriptors = await getLabeleFotosFromDb();
    const faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6);
    console.log(faceMatcher);
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        video.srcObject = stream;
    });

    // Click function to verify
    verify.addEventListener("click", async function() {
        let canvas = capture(video);
        canvas.onclick = function() {
            window.open(this.toDataURL(image / jpg));
        };
        console.log(canvas);
        // Detect with SSDMobileNet
        const detection = await faceapi
            .detectSingleFace(canvas, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()
            .withFaceDescriptor();
        console.log(detection);
        if (detection) {
            const detect = await faceMatcher.findBestMatch(detection.descriptor);
            console.log(detect);
            if (detect._label !== "unknown") {
                Swal.fire({
                    icon: "success",
                    title: "Silahkan masuk",
                    text: detect._label
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Anda belum terdaftar",
                    text: "Pastikan wajah pas dengan frame!"
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Tidak terdeteksi",
                text: "Pastikan wajah pas dengan frame!"
            });
        }
    });
}

function capture(video, scaleFactor) {
    if (scaleFactor == null) {
        scaleFactor = 0.25;
    }
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}

// Get data people from db
async function getDataPeople() {
    const data = await fetch("http://localhost:3000/people");
    const datas = await data.json();
    const dataPeople = [];
    // Transfrom buffer to blob
    datas.map(d => {
        let blobImages = new Blob([new Uint8Array(d.foto.data).buffer]);
        let People = {
            nama: d.nama,
            foto: blobImages
        };
        dataPeople.push(People);
    });
    // return data people
    return dataPeople;
}

// Get label
async function getLabeleFotosFromDb() {
    const dataPeople = await getDataPeople();
    // Label (name)
    const labels = dataPeople.map(d => {
        return d.nama;
    });
    return Promise.all(
        labels.map(async (l, i) => {
            const descriptors = [];
            // Transform blob to image
            const img = await faceapi.bufferToImage(dataPeople[i].foto);
            // Detection
            const detection = await faceapi
                .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
                .withFaceLandmarks()
                .withFaceDescriptor();
            // Push descriptor
            descriptors.push(detection.descriptor);
            // Return data user with descriptor foto
            return new faceapi.LabeledFaceDescriptors(l, descriptors);
        })
    );
}
