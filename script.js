// Firebase Setup for Firestore Integration
const firebaseConfig = {
  apiKey: "AIzaSyCBCdO6-qoDzLyrkpqnRk7uAoSZpNjmz8s",
  authDomain: "fir-bird-9eeeb.firebaseapp.com",
  projectId: "fir-bird-9eeeb",
  storageBucket: "fir-bird-9eeeb.appspot.com",
  messagingSenderId: "51066862267",
  appId: "1:51066862267:web:e150654accf8495a9a479e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

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
      alert('Please allow microphone access for candle blow detection.');
  });

// Blow Out Candles Function
function blowOutCandles() {
  flames.forEach(flame => {
      flame.style.display = 'none';
  });

  const message = document.getElementById('message');
  message.style.display = 'block';
  message.style.animation = 'popUp 1s ease forwards';

  // Check if the "Make a Wish" button already exists
  if (!document.getElementById('makeWishBtn')) {
      // Create "Make a Wish" button
      const makeWishBtn = document.createElement('button');
      makeWishBtn.innerText = "Make a Wish";
      makeWishBtn.id = 'makeWishBtn'; // Add an id to easily identify it
      makeWishBtn.className = "celebrate-btn"; // Reuse celebrate-btn styling
      makeWishBtn.style.marginTop = "20px";
      makeWishBtn.onclick = openWishModal;

      message.parentElement.appendChild(makeWishBtn); // Append to birthday card
  }
}

// Functions to open and close wish modal
function openWishModal() {
  document.getElementById('wishModal').style.display = "block";
}

function closeWishModal() {
  document.getElementById('wishModal').style.display = "none";
}

// Submit wish function (Integrating with Firestore)
function submitWish() {
  const wish = document.getElementById('wishInput').value;
  if (wish.trim() !== "") {
      const submitButton = document.getElementById('submitWishButton');
      submitButton.disabled = true;  // Disable the button to prevent double submission
      
      // Save wish to Firestore
      db.collection("wishes").add({
          wish: wish,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
          alert("Your wish has been recorded: " + wish);
          closeWishModal();
      })
      .catch((error) => {
          console.error("Error adding wish: ", error);
          alert("There was an error submitting your wish. Please try again.");
      })
      .finally(() => {
          submitButton.disabled = false;  // Re-enable the button after completion
      });
  } else {
      alert("Please enter a wish before submitting!");
  }
}

// Fetch previous wishes from Firestore (Optional)
function fetchWishes() {
  db.collection("wishes").orderBy("timestamp", "desc")
      .get()
      .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
              const wish = doc.data().wish;
              console.log("Wish: ", wish);
              // You can display the wishes here
          });
      })
      .catch((error) => {
          console.error("Error fetching wishes: ", error);
      });
}

// Initialize gallery functionality (if needed)
function initializeGallery() {
  // Example of integrating the gallery with functions to navigate images
  document.getElementById('nextBtn').addEventListener('click', nextPhoto);
  document.getElementById('prevBtn').addEventListener('click', prevPhoto);
}

// Call fetchWishes() if you want to show all previously made wishes on the page
// Call initializeGallery() if you want to set up gallery functionality
window.onload = () => {
  initializeGallery();
};
