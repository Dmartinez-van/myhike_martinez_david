let hikeDocID = localStorage.getItem("hikeDocID");

function getHikeName(id) {
  db.collection("hikes")
    .doc(id)
    .get()
    .then((thisHike) => {
      let hikeName = thisHike.data().name;
      document.getElementById("hikeName").innerHTML = hikeName;
    });
}

function writeReview() {
  let title = document.getElementById("title").value;
  let levelOfHike = document.getElementById("level").value;
  let season = document.getElementById("season").value;
  let comments = document.getElementById("description").value;
  let flooded = document.querySelector('input[name="flooded"]:checked').value;
  let scrambled = document.querySelector(
    'input[name="scrambled"]:checked'
  ).value;

  const stars = document.querySelectorAll(".star");
  let hikeRating = 0;

  stars.forEach((star) => {
    if (star.textContent === "star") {
      hikeRating++;
    }
  });

  let user = firebase.auth().currentUser;
  if (user) {
    let curUser = db.collection("user").doc(user.uid);
    let userID = user.uid;

    db.collection("reviews")
      .add({
        hikeDocID,
        userID,
        title,
        level: levelOfHike,
        season,
        description: comments,
        flooded,
        scrambled,
        rating: hikeRating,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        window.location.href = "thanks.html";
      });
  } else {
    alert("Not signed in");
    window.location.href = "review.html";
  }
}

// Select all elements with the class name "star" and store them in the "stars" variable
const stars = document.querySelectorAll(".star");
console.log("hello");
// Iterate through each star element
stars.forEach((star, index) => {
  console.log("in for each");
  // Add a click event listener to the current star
  star.addEventListener("click", () => {
    console.log("clicked star");
    // Fill in clicked star and stars before it
    for (let i = 0; i <= index; i++) {
      // Change the text content of stars to 'star' (filled)
      document.getElementById(`star${i + 1}`).textContent = "star";
    }
  });
});

getHikeName(hikeDocID);
