// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => links.classList.remove('open'))
  );
}

// Simple demo form handlers — replace with real backend / email service later
function handleLead(e) {
  e.preventDefault();
  alert('[שדה 167: הודעת אישור לטופס הלידים – לדוגמה "תודה! ניצור איתך קשר בקרוב"]');
  e.target.reset();
  return false;
}

function handleContact(e) {
  e.preventDefault();
  alert('[שדה 168: הודעת אישור לטופס יצירת הקשר – לדוגמה "ההודעה נשלחה בהצלחה"]');
  e.target.reset();
  return false;
}

window.handleLead = handleLead;
window.handleContact = handleContact;
