// Gallery Functionality
let galleryIndex = 0;
function nextPhoto() {
    const gallery = document.getElementById('gallery');
    galleryIndex = (galleryIndex + 1) % gallery.children.length;
    gallery.style.transform = `translateX(-${galleryIndex * 100}%)`;
}

function prevPhoto() {
    const gallery = document.getElementById('gallery');
    galleryIndex = (galleryIndex - 1 + gallery.children.length) % gallery.children.length;
    gallery.style.transform = `translateX(-${galleryIndex * 100}%)`;
}

// Compliments and Fortunes
const compliments = ["You are amazing!", "Wishing you smiles!", "You are loved!", "Stay awesome!"];
const fortunes = ["A great year awaits!", "Luck is on your side!", "Dream big!", "Celebrate every moment!"];

function generateCompliment() {
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    document.getElementById('compliment').innerText = compliment;
}

function generateFortune() {
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    document.getElementById('fortune').innerText = fortune;
}

// Modal Functions
function openCakeModal() {
    document.getElementById('cakeModal').style.display = "block";
}

function closeCakeModal() {
    document.getElementById('cakeModal').style.display = "none";
}

// Candle Blow Detection
const flames = document.querySelectorAll('.flame');

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(function (stream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const microphone = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function detectBlow() {
            analyser.getByteFrequencyData(dataArray);

            let volume = dataArray.reduce((a, b) => a + b) / dataArray.length;

            if (volume > 30) {
                blowOutCandles();
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    })
    .catch(function (err) {
        console.error('Microphone access denied!', err);
    });

function blowOutCandles() {
    flames.forEach(flame => {
        flame.style.display = 'none';
    });

    const message = document.getElementById('message');
    message.style.display = 'block';
    message.style.animation = 'popUp 1s ease forwards';
}
