// Select all flames
const flames = document.querySelectorAll('.flame');

// Set up microphone
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

            // Debugging purpose: console.log(volume);

            if (volume > 30) { // You can adjust this threshold depending on how sensitive you want it
                blowOutCandles();
            }

            requestAnimationFrame(detectBlow);
        }

        detectBlow();
    })
    .catch(function (err) {
        console.error('Microphone access denied!', err);
    });

// Function to blow out candles
function blowOutCandles() {
    flames.forEach(flame => {
        flame.style.display = 'none';
    });

    // Show Happy Birthday Message
    const message = document.getElementById('message');
    message.style.display = 'block';

    // Optional: Add small animation
    message.style.animation = 'popUp 1s ease forwards';
}