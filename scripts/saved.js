function doAll() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      insertNameFromFirestore(user);
      getBookmarks(user);
    } else {
      console.log("No user is signed in");
    }
  });
}
doAll();

function insertNameFromFirestore(user) {
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((userDoc) => {
      userName = userDoc.data().name;
      document.getElementById("name-goes-here").innerHTML = userName;
    });
}

function getBookmarks(user) {
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((userDoc) => {
      let bookmarks = userDoc.data().bookmarks;

      let newcardTemplate = document.getElementById("savedCardTemplate");
      bookmarks.forEach((thisHikeId) => {
        db.collection("hikes")
          .doc(thisHikeId)
          .get()
          .then((doc) => {
            let title = doc.data().name;
            let hikeCode = doc.data().code;
            let hikeLength = doc.data().length;
            let docID = doc.id;
            console.log("doc ", doc);

            // clone the new card
            let newcard = newcardTemplate.content.cloneNode(true);

            newcard.querySelector(".card-title").innerHTML = title;
            newcard.querySelector(".card-length").innerHTML = hikeLength + "km";
            newcard.querySelector(
              ".card-image"
            ).src = `./images/${hikeCode}.jpg`;
            newcard.querySelector("a").href = "eachHike.html?docID=" + docID;

            //NEW LINE: update to display length, duration, last updated
            newcard.querySelector(".card-length").innerHTML =
              "Length: " +
              doc.data().length +
              " km <br>" +
              "Duration: " +
              doc.data().hike_time +
              "min <br>" +
              "Last updated: " +
              doc.data().last_updated.toDate().toLocaleDateString();

            //Finally, attach this new card to the gallery
            hikeCardGroup.appendChild(newcard);
          });
      });
    });
}
