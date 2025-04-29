// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "AIzaSyCBCdO6-qoDzLyrkpqnRk7uAoSZpNjmz8s",
  authDomain: "fir-bird-9eeeb.firebaseapp.com",
  projectId: "fir-bird-9eeeb",
  storageBucket: "fir-bird-9eeeb.appspot.com",
  messagingSenderId: "51066862267",
  appId: "1:51066862267:web:e150654accf8495a9a479e",
  measurementId: "G-4HP8E2EX50"
};

// Initialize Firebase
let db;
try {
  const app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization error:", error);
  alert("Failed to initialize Firebase. Please check console for details.");
}

// DOM Elements
const complimentElement = document.getElementById('compliment');
const fortuneElement = document.getElementById('fortune');
const wishInput = document.getElementById('wishInput');
const wishSubmitBtn = document.getElementById('wishSubmit');


// Data Arrays
const compliments = [
  "तुम्हारी बातों में वो असर है, जो अधूरी कहानियों को भी मुकम्मल कर दे।",
  "तुम्हारी आँखें किसी पुराने ग़ज़ल की तरह हैं — हर बार कुछ नया महसूस करवा देती हैं।",
  "तुम्हारा साथ उस बारिश जैसा है, जो खिड़की पर नहीं — दिल पर गिरती है।",
  "तुम वो सुकून हो जो शहरों में नहीं, किसी सुनसान शाम में मिलती है।",
  "तुम्हारा नाम जब हवा में गूंजता है, तो मौसम भी थोड़ी देर ठहर जाता है।"
];

const fortunes = [
  "किसी चुप शाम में, तुम्हारी अधूरी ख्वाहिशें पूरी होने का रास्ता लेंगी।",
  "वो पल आने वाला है, जब किस्मत तुम्हें देखकर मुस्कुराएगी और कहेगी — 'अब तेरी बारी है'।",
  "तुम्हारे सब्र की ज़मीन पर अब खुशियों की बारिश होने वाली है।",
  "कुछ ऐसा होने वाला है, जो तुम्हारे अंदर के शायर को फिर से जगा देगा।",
  "तुम्हारा सबसे हसीन सफर अभी शुरू भी नहीं हुआ — पर उसकी आहट आ रही है।"
];


// Interactive Cards
function generateCompliment() {
  const randomIndex = Math.floor(Math.random() * compliments.length);
  complimentElement.textContent = compliments[randomIndex];
  complimentElement.classList.add('animate');
  setTimeout(() => complimentElement.classList.remove('animate'), 500);
}

function generateFortune() {
  const randomIndex = Math.floor(Math.random() * fortunes.length);
  fortuneElement.textContent = fortunes[randomIndex];
  fortuneElement.classList.add('animate');
  setTimeout(() => fortuneElement.classList.remove('animate'), 500);
}

// Celebration Functions
function startCelebration() {
  openCakeModal();
  setupMicrophone();
}

function openCakeModal() {
  document.getElementById('cakeModal').style.display = 'block';
  resetCandles();
}

function closeCakeModal() {
  document.getElementById('cakeModal').style.display = 'none';
}

function resetCandles() {
  const flames = document.querySelectorAll('.flame');
  flames.forEach(flame => {
    flame.style.display = 'block';
  });
  document.getElementById('message').style.display = 'none';
}

function setupMicrophone() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Microphone access not supported in this browser");
    return;
  }

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(handleMicrophoneAccess)
    .catch(handleMicrophoneError);
}

function handleMicrophoneAccess(stream) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const microphone = audioContext.createMediaStreamSource(stream);
  
  microphone.connect(analyser);
  analyser.fftSize = 256;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  function detectBlow() {
    analyser.getByteFrequencyData(dataArray);
    let sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / bufferLength;
    
    if (average > 30) { // Blow detected
      blowOutCandles();
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
    } else {
      requestAnimationFrame(detectBlow);
    }
  }
  
  detectBlow();
}

function handleMicrophoneError(error) {
  console.error('Microphone error:', error);
  alert('Microphone access needed to blow out candles. Error: ' + error.message);
}

function blowOutCandles() {
  const flames = document.querySelectorAll('.flame');
  flames.forEach(flame => {
    flame.style.display = 'none';
  });

  const message = document.getElementById('message');
  message.style.display = 'block';
  message.style.animation = 'popUp 1s ease forwards';

  setTimeout(openWishModal, 1500);
}

// Wish Modal Functions
function openWishModal() {
  document.getElementById('wishModal').style.display = 'block';
  wishInput.focus();
}

function closeWishModal() {
  document.getElementById('wishModal').style.display = 'none';
  wishInput.value = '';
}

async function submitWish() {
  const wish = wishInput.value.trim();

  if (!wish) {
    alert("Please enter a wish before submitting!");
    return;
  }

  // Validate Firebase connection
  if (!db) {
    alert("Database connection not established. Please refresh the page.");
    return;
  }

  // Set loading state
  wishSubmitBtn.disabled = true;
  wishSubmitBtn.textContent = "Submitting...";

  try {
    await db.collection("wishes").add({
      wish: wish,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert("Your wish has been recorded!");
    closeWishModal();
  } catch (error) {
    console.error("Full error details:", error);
    handleSubmitError(error);
  } finally {
    wishSubmitBtn.disabled = false;
    wishSubmitBtn.textContent = "Submit";
  }
}

function handleSubmitError(error) {
  let errorMessage = "Failed to submit wish. Please try again.";
  
  if (error.code === 'permission-denied') {
    errorMessage = "Permission denied. Check your Firebase security rules.";
  } else if (error.code === 'unavailable') {
    errorMessage = "Network error. Please check your internet connection.";
  }
  
  alert(errorMessage);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  
  // Add keyboard navigation for gallery
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  });
  
  // Add enter key support for wish submission
  wishInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitWish();
  });
});
