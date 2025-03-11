let curUser;

function populateUserInfo() {
  firebase.auth().onAuthStateChanged((user) => {
    // Check if user is signed in:
    if (user) {
      // go to correct user doc by using user uid
      curUser = db.collection("users").doc(user.uid);

      curUser.get().then((userDoc) => {
        let userName = userDoc.data().name;
        let userSchool = userDoc.data().school;
        let userCity = userDoc.data().city;

        // if data not null, then write them into html form
        if (userName !== null) {
          document.getElementById("nameInput").value = userName;
        }
        if (userSchool !== null) {
          document.getElementById("schoolInput").value = userSchool;
        }
        if (userCity !== null) {
          document.getElementById("cityInput").value = userCity;
        }
      });
    } else {
      // no user is signed in
      console.log("No user signed in.");
    }
  });
}

function editUserInfo() {
  document.getElementById("personalInfoFields").disabled = false;
}

function saveUserInfo() {
  let newName = document.getElementById("nameInput").value;
  let newSchool = document.getElementById("schoolInput").value;
  let newCity = document.getElementById("cityInput").value;

  curUser
    .update({
      name: newName,
      school: newSchool,
      city: newCity,
    })
    .then(() => {
      console.log("Doc successfully updated!");
    });

  document.getElementById("personalInfoFields").disabled = true;
}

populateUserInfo();
