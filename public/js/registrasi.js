// Note: Client side face detection
const imageUpload = document.getElementById("foto_wajah");
const formRegistrasi = document.getElementById("form-regist");
const loader = document.getElementById("loader");
// const cek = document.getElementById("check");
// const input = Array.from(document.querySelectorAll("input"));
// const loader2 = document.getElementById("loader2");
// const alert = document.getElementById("alert");
const btnSubmit = document.getElementById("btn-submit");
const xhr = new XMLHttpRequest();

// Load all module
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models")
]).then(start);

formRegistrasi.addEventListener("submit", function(e) {});

function start() {
    loadIn();
    imageUpload.addEventListener("change", async e => {
        if (imageUpload.files.length) {
            load();
            // Transform image
            const image = await faceapi.bufferToImage(imageUpload.files[0]);
            // Detect image using detectAllFaces function from face api js
            const detection = await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options());
            // Get total face in image
            const totalFace = detection.length;
            loaded();
            // If just one person
            if (totalFace == 1) {
                btnSubmit.disabled = false;
                // const faceImages = await faceapi.extractFaces(image, detection);
                // faceImages.forEach(async e => {
                //     const file = await e.toDataURL("image/png");
                //     localStorage.setItem("img_crop", file);
                // });
            } else {
                btnSubmit.disabled = true;
                alert("Pastikan anda sendirian dan penerangan cukup");
            }
        }
    });
}

function load() {
    loader.style.display = "block";
    btnSubmit.style.display = "none";
}
function loaded() {
    loader.style.display = "none";
    btnSubmit.style.display = "block";
}

// cek.addEventListener("click", async e => {
//     let formData = new FormData();
//     formData.append("nama", input[0].value);
//     formData.append("alamat", input[2].value);
//     formData.append("email", input[3].value);
//     let file = localStorage.getItem("img_crop");
//     const byteString = atob(file.split(",")[1]);
//     let ia = new Uint8Array(byteString.length);
//     for (let i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     const blob = new Blob([ia], { type: "image/png" });
//     formData.append("foto", blob, "foto.png");
//     const dataFetch = await fetch("/register", {
//         method: "post",
//         body: formData
//     });
//     const response = await dataFetch.json();
//     if (response == "oke") {
//         alert("Selamat anda sudah terdaftar");
//         window.location.reload();
//     }
// });

function loadIn() {
    loader.style.display = "none";
    btnSubmit.style.display = "block";
}
