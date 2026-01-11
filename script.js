// Detect current page
const currentPage = window.location.pathname.split("/").pop();

// ========== SIGNUP ==========
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const user = document.getElementById("signupUser").value;
    const pass = document.getElementById("signupPass").value;
    const confirm = document.getElementById("confirmPass").value;

    if (pass !== confirm) {
      document.getElementById("authMsg").innerText =
        "❌ Passwords do not match!";
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find((u) => u.user === user)) {
      document.getElementById("authMsg").innerText =
        "⚠️ User already exists. Please login.";
      return;
    }

    users.push({ user, pass });
    localStorage.setItem("users", JSON.stringify(users));
    document.getElementById("authMsg").innerText =
      "✅ Signup successful! Please login.";
    signupForm.reset();
  });
}

// ========== LOGIN ==========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const role = document.getElementById("loginRole").value;
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;

    // Admin login
    if (role === "admin") {
      if (user === "admin" && pass === "admin123") {
        sessionStorage.setItem("role", "admin");
        window.location.href = "admin.html";
      } else {
        document.getElementById("authMsg").innerText =
          "❌ Invalid admin credentials.";
      }
      return;
    }

    // User login
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let found = users.find((u) => u.user === user && u.pass === pass);
    if (found) {
      sessionStorage.setItem("role", "user");
      sessionStorage.setItem("currentUser", user);
      window.location.href = "index.html";
    } else {
      document.getElementById("authMsg").innerText =
        "❌ Invalid user credentials.";
    }
  });
}

// ========== REPORT ISSUE ==========
const reportForm = document.getElementById("reportForm");
if (reportForm) {
  reportForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const desc = document.getElementById("description").value;
    const photo = document.getElementById("photo").files[0];
    const user = sessionStorage.getItem("currentUser") || "Guest";

    let issues = JSON.parse(localStorage.getItem("issues")) || [];
    let id = "ISSUE-" + (issues.length + 1);
    let photoURL = "";

    if (photo) {
      photoURL = URL.createObjectURL(photo);
    }

    issues.push({ id, title, desc, photo: photoURL, user, status: "Pending" });
    localStorage.setItem("issues", JSON.stringify(issues));

    alert(
      "✅ Issue submitted successfully! Please note your Issue ID: " + id
    );
    reportForm.reset();
  });
}

// ========== STATUS TRACK ==========
const statusForm = document.getElementById("statusForm");
if (statusForm) {
  statusForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const id = document.getElementById("trackId").value;
    let issues = JSON.parse(localStorage.getItem("issues")) || [];
    let found = issues.find((i) => i.id === id);

    const statusResult = document.getElementById("statusResult");
    if (found) {
      statusResult.innerHTML = `
        <p><b>Issue ID:</b> ${found.id}</p>
        <p><b>Title:</b> ${found.title}</p>
        <p><b>Description:</b> ${found.desc}</p>
        <p><b>Status:</b> ${found.status}</p>
        ${
          found.photo
            ?  `<img src="${found.photo}" width="200" style="margin-top:10px;"> `
            : ""
        }
      `;
    } else {
      statusResult.innerHTML = "<p>❌ No issue found with that ID.</p>";
    }
  });
}

// ========== ADMIN DASHBOARD ==========
const issueList = document.getElementById("issueList");
if (issueList) {
  let issues = JSON.parse(localStorage.getItem("issues")) || [];
  issueList.innerHTML = issues
    .map(
      (i) => `
    <div class="issue-card">
      <p><b>ID:</b> ${i.id}</p>
      <p><b>User:</b> ${i.user}</p>
      <p><b>Title:</b> ${i.title}</p>
      <p><b>Description:</b> ${i.desc}</p>
      <p><b>Status:</b> ${i.status}</p>
      ${
        i.photo
          ?  `<img src="${i.photo}" width="200" style="margin:10px 0;"> `
          : ""
      }
      <button onclick="updateStatus('${i.id}', 'Resolved')">Mark Resolved</button>
      <button onclick="deleteIssue('${i.id}')">Delete Issue</button>
    </div>
  `
    )
    .join("");
}

function updateStatus(id, status) {
  let issues = JSON.parse(localStorage.getItem("issues")) || [];
  let idx = issues.findIndex((i) => i.id === id);
  if (idx !== -1) {
    issues[idx].status = status;
    localStorage.setItem("issues", JSON.stringify(issues));
    location.reload();
  }
}

function deleteIssue(id) {
  let issues = JSON.parse(localStorage.getItem("issues")) || [];
  issues = issues.filter((i) => i.id !== id);
  localStorage.setItem("issues", JSON.stringify(issues));
  location.reload();
}





document.getElementById("startSpeech").addEventListener("click", function(e) {
  e.preventDefault();

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  let selectedLang = document.getElementById("languageSwitcher").value;

  if (selectedLang === "hi") {
    recognition.lang = "hi-IN";
  } else if (selectedLang === "mr") {
    recognition.lang = "mr-IN";
  } else {
    recognition.lang = "en-IN";
  }





  

  recognition.start();

  recognition.onresult = async function(event) {
    let speechText = event.results[0][0].transcript;

    // If Hindi or Marathi, translate Hinglish → Devanagari
    if (selectedLang === "hi" || selectedLang === "mr") {
      speechText = await translateText(speechText, selectedLang);
    }

    document.getElementById("issueDescription").value = speechText;
  };

  recognition.onerror = function(event) {
    alert("Speech recognition error: " + event.error);
  };
});