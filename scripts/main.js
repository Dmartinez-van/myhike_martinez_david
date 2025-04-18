//Global variable pointing to the current user's Firestore document
let currentUser;

//Function that calls everything needed for the main page
function doAll() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(user.uid); //global
      console.log(currentUser);

      // figure out what day of the week it is today
      const weekday = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const d = new Date();
      let day = weekday[d.getDay()];

      // the following functions are always called when someone is logged in
      readQuote(day);
      insertNameFromFirestore();
      displayCardsDynamically("hikes");
    } else {
      // No user is signed in.
      console.log("No user is signed in");
      window.location.href = "login.html";
    }
  });
}
doAll();

function insertNameFromFirestore() {
  // Check if the user is logged in:
  currentUser.get().then((userDoc) => {
    let user_Name = userDoc.data().name;
    $("#name-goes-here").text(user_Name);
  });
}

// Function to read the quote of the day from the Firestore "quotes" collection
// Input param is the String representing the day of the week, aka, the document name
function readQuote(day) {
  db.collection("quotes")
    .doc(day)
    .onSnapshot(
      (dayDoc) => {
        document.getElementById("quote-goes-here").innerHTML =
          dayDoc.data().quote;

        document.getElementById("author-goes-here").innerHTML =
          dayDoc.data().author;
      },
      (error) => {
        console.log("Error calling onSnapshot", error);
      }
    );
}
// readQuote("tuesday");

function writeHikes() {
  //define a variable for the collection you want to create in Firestore to populate data
  var hikesRef = db.collection("hikes");

  hikesRef.add({
    code: "BBY01",
    name: "Burnaby Lake Park Trail", //replace with your own city?
    city: "Burnaby",
    province: "BC",
    level: "easy",
    details: "A lovely place for lunch walk",
    length: 10, //number value
    hike_time: 60, //number value
    lat: 49.2467097082573,
    lng: -122.9187029619698,
    last_updated: firebase.firestore.FieldValue.serverTimestamp(), //current system time
  });
  hikesRef.add({
    code: "AM01",
    name: "Buntzen Lake Trail", //replace with your own city?
    city: "Anmore",
    province: "BC",
    level: "moderate",
    details: "Close to town, and relaxing",
    length: 10.5, //number value
    hike_time: 80, //number value
    lat: 49.3399431028579,
    lng: -122.85908496766939,
    last_updated: firebase.firestore.Timestamp.fromDate(
      new Date("March 10, 2022")
    ),
  });
  hikesRef.add({
    code: "NV01",
    name: "Mount Seymour Trail", //replace with your own city?
    city: "North Vancouver",
    province: "BC",
    level: "hard",
    details: "Amazing ski slope views",
    length: 8.2, //number value
    hike_time: 120, //number value
    lat: 49.38847101455571,
    lng: -122.94092543551031,
    last_updated: firebase.firestore.Timestamp.fromDate(
      new Date("January 1, 2023")
    ),
  });
}

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
  let cardTemplate = document.getElementById("hikeCardTemplate"); // Retrieve the HTML element with the ID "hikeCardTemplate" and store it in the cardTemplate variable.

  db.collection(collection)
    .orderBy("hike_time")
    .limit(2)
    .get() //the collection called "hikes"
    .then((allHikes) => {
      allHikes.forEach((doc) => {
        //iterate thru each doc
        let docID = doc.id;
        console.log(doc.id);

        var title = doc.data().name; // get value of the "name" key
        var details = doc.data().details; // get value of the "details" key
        var hikeCode = doc.data().code; //get unique ID to each hike to be used for fetching right image
        let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

        // add i tag and onclick functionality
        newcard.querySelector("i").id = "save-" + docID; //guaranteed to be unique
        newcard.querySelector("i").onclick = () => bookmark(docID);

        //update title and text and image
        newcard.querySelector(".card-length").innerHTML =
          "Length: " +
          doc.data().length +
          " km <br>" +
          "Duration: " +
          doc.data().hike_time +
          "min <br>" +
          "Last updated: " +
          doc.data().last_updated.toDate().toLocaleDateString();

        newcard.querySelector(".card-title").innerHTML = title;
        newcard.querySelector(".card-text").innerHTML = details;
        newcard.querySelector(".card-image").src = `./images/${hikeCode}.jpg`; //Example: NV01.jpg

        newcard.querySelector("a").href = "eachHike.html?docID=" + docID;

        // Get bookmarks from users collections and update each bookmark
        currentUser.get().then((userDoc) => {
          //get the user name
          var bookmarks = userDoc.data().bookmarks;
          console.log(bookmarks);
          if (bookmarks.includes(docID)) {
            document.getElementById("save-" + docID).innerText = "bookmark";
          }
        });

        //attach to gallery, Example: "hikes-go-here"
        document.getElementById(collection + "-go-here").appendChild(newcard);
      });
    });
}

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "bookmark" icon.
// It adds the hike to the "bookmarks" array
// Then it will change the bookmark icon from the hollow to the solid version.
//-----------------------------------------------------------------------------
function bookmark(hikeDocID) {
  currentUser.get().then((userDoc) => {
    let bookmarks = userDoc.data().bookmarks;
    if (bookmarks.includes(hikeDocID)) {
      currentUser.update({
        bookmarks: firebase.firestore.FieldValue.arrayRemove(hikeDocID),
      });
      let iconID = "save-" + hikeDocID;
      document.getElementById(iconID).innerText = "bookmark_border";
      console.log(hikeDocID, " hike removed");
    } else {
      // Manage the backend process to store the hikeDocID in the database, recording which hike was bookmarked by the user.
      currentUser
        .update({
          // Use 'arrayUnion' to add the new bookmark ID to the 'bookmarks' array.
          // This method ensures that the ID is added only if it's not already present, preventing duplicates.
          bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeDocID),
        })
        // Handle the front-end update to change the icon, providing visual feedback to the user that it has been clicked.
        .then(function () {
          console.log("bookmark has been saved for " + hikeDocID);
          let iconID = "save-" + hikeDocID;
          //console.log(iconID);
          //this is to change the icon of the hike that was saved to "filled"
          document.getElementById(iconID).innerText = "bookmark";
        });
    }
  });
}
