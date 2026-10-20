const visitDate = document.getElementById("visit-date");
const birthDate = document.getElementById("birth");
const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
].join("-");
visitDate.min = today;
birthDate.max = today;
