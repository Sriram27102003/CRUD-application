// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdZYNXLPDvYTQVMTmF9_VPBT6XUw4yaFw",
  authDomain: "imaginary-friend-b04d3.firebaseapp.com",
  projectId: "imaginary-friend-b04d3",
  storageBucket: "imaginary-friend-b04d3.firebasestorage.app",
  messagingSenderId: "969812580639",
  appId: "1:969812580639:web:57e711d38565e254b1b82a",
  measurementId: "G-Z8M5GTDNW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Create: Add a new friend
document.getElementById('friend-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const personality = document.getElementById('personality').value;
  const hobbies = document.getElementById('hobbies').value.split(',').map(h => h.trim()).filter(h => h);
  const world = document.getElementById('world').value;
  const backstory = document.getElementById('backstory').value;
  addDoc(collection(db, 'friends'), { name, personality, hobbies, world, backstory })
    .then(() => {
      alert('Friend added!');
      document.getElementById('friend-form').reset();
      loadFriends();
    })
    .catch((error) => {
      console.error('Error adding friend:', error);
      alert('Error adding friend. Check console for details.');
    });
});

// Read: Load and display friends
function loadFriends() {
  const friendList = document.getElementById('friend-list');
  friendList.innerHTML = '';
  onSnapshot(collection(db, 'friends'), (snapshot) => {
    snapshot.forEach((doc) => {
      const friend = doc.data();
      const card = `
        <div class="col-md-4 mb-3">
          <div class="card card-${friend.world.toLowerCase().replace(' ', '-')}">
            <div class="card-body">
              <h5 class="card-title">${friend.name}</h5>
              <p class="card-text">Personality: ${friend.personality}</p>
              <p class="card-text">World: ${friend.world}</p>
              <p class="card-text">Hobbies: ${friend.hobbies.join(', ') || 'None'}</p>
              <p class="card-text">Backstory: ${friend.backstory || 'None'}</p>
              <button class="btn btn-warning" onclick="editFriend('${doc.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteFriend('${doc.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
      friendList.innerHTML += card;
    });
    updateChart();
    loadFriendDropdowns();
  }, (error) => {
    console.error('Error loading friends:', error);
    alert('Error loading friends. Check console for details.');
  });
}
loadFriends();

// Update: Edit a friend
function editFriend(id) {
  getDoc(doc(db, 'friends', id)).then((docSnap) => {
    if (docSnap.exists()) {
      const friend = docSnap.data();
      document.getElementById('name').value = friend.name;
      document.getElementById('personality').value = friend.personality;
      document.getElementById('hobbies').value = friend.hobbies.join(', ');
      document.getElementById('world').value = friend.world;
      document.getElementById('backstory').value = friend.backstory;
      document.getElementById('friend-form').onsubmit = (e) => {
        e.preventDefault();
        updateDoc(doc(db, 'friends', id), {
          name: document.getElementById('name').value,
          personality: document.getElementById('personality').value,
          hobbies: document.getElementById('hobbies').value.split(',').map(h => h.trim()).filter(h => h),
          world: document.getElementById('world').value,
          backstory: document.getElementById('backstory').value
        }).then(() => {
          alert('Friend updated!');
          document.getElementById('friend-form').reset();
          document.getElementById('friend-form').onsubmit = null;
          loadFriends();
        }).catch((error) => {
          console.error('Error updating friend:', error);
          alert('Error updating friend. Check console for details.');
        });
      };
    }
  });
}

// Delete: Remove a friend
function deleteFriend(id) {
  if (confirm('Are you sure you want to delete this friend?')) {
    deleteDoc(doc(db, 'friends', id)).then(() => {
      alert('Friend deleted!');
      loadFriends();
    }).catch((error) => {
      console.error('Error deleting friend:', error);
      alert('Error deleting friend. Check console for details.');
    });
  }
}

// Polar Area Chart for World Diversity
let chartInstance = null;
function updateChart() {
  getDocs(collection(db, 'friends')).then((snapshot) => {
    const worlds = {
      'Cloud Kingdom': 0,
      'Shadow Forest': 0,
      'Crystal Caves': 0,
      'Starship Nexus': 0,
      'Mystic Village': 0
    };
    snapshot.forEach((doc) => {
      worlds[doc.data().world]++;
    });
    const ctx = document.getElementById('worldChart').getContext('2d');
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: Object.keys(worlds),
        datasets: [{
          data: Object.values(worlds),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          borderColor: ['#D6506D', '#2A8ABF', '#D6A340', '#3DA8A8', '#7A52CC'],
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          legend: { position: 'right' },
          title: { display: true, text: 'Friends by World' }
        }
      }
    });
  }).catch((error) => {
    console.error('Error updating chart:', error);
    alert('Error updating chart. Check console for details.');
  });
}

// Friendship Spark: Populate dropdowns and generate interactions
function loadFriendDropdowns() {
  const friend1 = document.getElementById('friend1');
  const friend2 = document.getElementById('friend2');
  friend1.innerHTML = friend2.innerHTML = '<option value="">Select a friend</option>';
  getDocs(collection(db, 'friends')).then((snapshot) => {
    snapshot.forEach((doc) => {
      const friend = doc.data();
      const option = `<option value="${doc.id}">${friend.name}</option>`;
      friend1.innerHTML += option;
      friend2.innerHTML += option;
    });
  }).catch((error) => {
    console.error('Error loading friend dropdowns:', error);
    alert('Error loading friend dropdowns. Check console for details.');
  });
}

function generateSpark() {
  const friend1Id = document.getElementById('friend1').value;
  const friend2Id = document.getElementById('friend2').value;
  if (!friend1Id || !friend2Id || friend1Id === friend2Id) {
    alert('Please select two different friends!');
    return;
  }
  Promise.all([
    getDoc(doc(db, 'friends', friend1Id)),
    getDoc(doc(db, 'friends', friend2Id))
  ]).then(([doc1, doc2]) => {
    const friend1 = doc1.data();
    const friend2 = doc2.data();
    const actions = [
      'explore together in',
      'solve a mystery in',
      'have a grand adventure in',
      'build something amazing in',
      'dance under the stars in'
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const spark = `${friend1.name} and ${friend2.name} ${randomAction} ${friend1.world}!`;
    document.getElementById('spark-result').innerText = spark;
  }).catch((error) => {
    console.error('Error generating spark:', error);
    alert('Error generating spark. Check console for details.');
  });
}