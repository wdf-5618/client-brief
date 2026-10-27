"use strict";

const STORAGE_KEY = "clientbrief.draft.v1";
const form = document.querySelector("#brief-form");
const preview = document.querySelector("#brief-preview");
const statusLabel = document.querySelector("#save-status");
const message = document.querySelector("#form-message");
const sampleButton = document.querySelector("#sample-btn");
const printButton = document.querySelector("#print-btn");
const downloadButton = document.querySelector("#download-btn");
const copyButton = document.querySelector("#copy-btn");
const resetButton = document.querySelector("#reset-btn");
const resetDialog = document.querySelector("#reset-dialog");
const completionLabel = document.querySelector("#completion-label");
const completionProgress = document.querySelector("#completion-progress");
const completionBar = document.querySelector("#completion-bar");
const completionFields = [
  "clientName", "contactEmail", "projectName", "projectSummary",
  "projectType", "goals", "audience", "deliverables", "requirements", "targetDate", "budget",
];

function localDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

document.querySelector("#target-date").min = localDateISO(new Date());

function readForm() {
  return Object.fromEntries(new FormData(form).entries());
}

function setFormValues(data) {
  Object.entries(data || {}).forEach(function (entry) {
    const name = entry[0];
    const value = entry[1];
    const control = form.elements.namedItem(name);
    if (!control || typeof value !== "string") return;
    control.value = value.slice(0, control.maxLength > 0 ? control.maxLength : 5000);
  });
}

function setStatus(text) {
  statusLabel.textContent = text;
}

function setMessage(text, isError) {
  message.textContent = text || "";
  message.classList.toggle("is-error", Boolean(isError));
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      data: readForm(),
    }));
    setStatus("Draft saved in this browser");
  } catch (error) {
    setStatus("Browser storage unavailable");
    setMessage("The draft could not be saved in this browser. You can still export it as JSON.", true);
  }
}

function restoreDraft() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    if (!parsed || parsed.version !== 1 || !parsed.data || typeof parsed.data !== "object") {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    setFormValues(parsed.data);
    setStatus("Restored saved draft");
    return true;
  } catch (error) {
    setStatus("Could not restore saved draft");
    return false;
  }
}

function addBriefSection(parent, title, value) {
  const content = typeof value === "string" ? value.trim() : "";
  if (!content) return false;

  const section = document.createElement("section");
  section.className = "brief-section";

  const heading = document.createElement("h3");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  section.append(heading, paragraph);
  parent.append(section);
  return true;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const parsed = new Date(dateString + "T12:00:00");
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderPreview(data) {
  preview.replaceChildren();

  const brand = document.createElement("div");
  brand.className = "document-brand";
  const brandName = document.createElement("span");
  brandName.textContent = "CLIENTBRIEF";
  const label = document.createElement("span");
  label.textContent = "PROJECT NOTE";
  brand.append(brandName, label);
  preview.append(brand);

  if (!data.projectName && !data.clientName && !data.projectSummary) {
    const placeholder = document.createElement("p");
    placeholder.className = "document-placeholder";
    placeholder.textContent = "Your project brief will take shape here as you fill in the form.";
    preview.append(placeholder);
    return;
  }

  const title = document.createElement("h2");
  title.className = "brief-title";
  title.textContent = data.projectName.trim() || "Untitled project";
  preview.append(title);

  const meta = document.createElement("p");
  meta.className = "brief-meta";
  const metaParts = [];
  if (data.clientName.trim()) metaParts.push(data.clientName.trim());
  if (data.projectType) metaParts.push(data.projectType);
  meta.textContent = metaParts.join(" · ") || "Project summary";
  preview.append(meta);

  addBriefSection(preview, "Project contact", [
    data.contactName && "Contact: " + data.contactName,
    data.contactEmail && "Email: " + data.contactEmail,
    data.businessContext && "Business: " + data.businessContext,
  ].filter(Boolean).join("\n"));

  addBriefSection(preview, "Overview", data.projectSummary);
  addBriefSection(preview, "Goals", data.goals);
  addBriefSection(preview, "Target audience", data.audience);
  addBriefSection(preview, "Deliverables", data.deliverables);
  addBriefSection(preview, "Requirements", data.requirements);
  addBriefSection(preview, "References and materials", data.references);

  addBriefSection(preview, "Timeline and budget", [
    data.targetDate && "Target date: " + formatDate(data.targetDate),
    data.budget && "Estimated budget: " + data.budget,
    data.decisionMaker && "Approver: " + data.decisionMaker,
    data.successMeasures && "Success measure: " + data.successMeasures,
  ].filter(Boolean).join("\n"));

  addBriefSection(preview, "Open questions and constraints", data.openQuestions);

  const footer = document.createElement("p");
  footer.className = "brief-meta mt-4 mb-0";
  footer.textContent = "Prepared with ClientBrief · Draft for discussion";
  preview.append(footer);
}

function updateCompletion(data) {
  const complete = completionFields.reduce(function (total, key) {
    return total + (String(data[key] || "").trim() ? 1 : 0);
  }, 0);
  const percent = Math.round((complete / completionFields.length) * 100);
  completionLabel.textContent = percent + "% complete";
  completionProgress.setAttribute("aria-valuenow", String(percent));
  completionBar.style.width = percent + "%";
}

function updateView() {
  const data = readForm();
  renderPreview(data);
  updateCompletion(data);
}

function buildPlainText(data) {
  const lines = [
    "PROJECT BRIEF",
    data.projectName || "Untitled project",
    "",
    "CLIENT",
    data.clientName || "Not provided",
    "Contact: " + (data.contactName || "Not provided"),
    "Email: " + (data.contactEmail || "Not provided"),
    "Project type: " + (data.projectType || "Not specified"),
    "Business or product: " + (data.businessContext || "Not provided"),
    "",
    "OVERVIEW",
    data.projectSummary || "Not provided",
    "",
    "GOALS",
    data.goals || "Not provided",
    "",
    "TARGET AUDIENCE",
    data.audience || "Not provided",
    "",
    "DELIVERABLES",
    data.deliverables || "Not provided",
    "",
    "REQUIREMENTS",
    data.requirements || "Not provided",
    "",
    "REFERENCES AND MATERIALS",
    data.references || "Not provided",
    "",
    "TIMELINE AND BUDGET",
    "Target date: " + (formatDate(data.targetDate) || "Not specified"),
    "Budget: " + (data.budget || "Not specified"),
    "Approver: " + (data.decisionMaker || "Not specified"),
    "Success measures: " + (data.successMeasures || "Not provided"),
    "",
    "OPEN QUESTIONS AND CONSTRAINTS",
    data.openQuestions || "Not provided",
    "",
    "Prepared with ClientBrief. Draft for discussion.",
  ];
  return lines.join("\n");
}

function validForSharing() {
  if (!form.checkValidity()) {
    form.reportValidity();
    setMessage("Please complete the required fields and check the contact email.", true);
    return false;
  }
  setMessage("", false);
  return true;
}

function sanitizeFileName(value) {
  const safe = String(value || "project-brief")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return safe || "project-brief";
}

let saveTimeout;
form.addEventListener("input", function () {
  updateView();
  setMessage("", false);
  setStatus("Unsaved changes");
  window.clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(saveDraft, 300);
});

form.addEventListener("change", function () {
  updateView();
  setMessage("", false);
  window.clearTimeout(saveTimeout);
  saveTimeout = window.setTimeout(saveDraft, 150);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!validForSharing()) return;
  saveDraft();
  setMessage("The required fields are complete. Review the brief, then print it or copy the text to share.", false);
});

sampleButton.addEventListener("click", function () {
  const target = new Date();
  target.setDate(target.getDate() + 28);
  setFormValues({
    clientName: "Green Market",
    contactName: "May Thiri",
    contactEmail: "may@example.com",
    projectName: "Simple online ordering website",
    projectType: "Website or web app",
    businessContext: "A neighborhood grocery shop accepting phone orders today",
    projectSummary: "Create a simple website where regular customers can browse products and send an order request without calling the shop.",
    goals: "Make product information easier to find and reduce the time staff spend answering the same questions.",
    audience: "Nearby customers who mainly use a mobile phone and may not be comfortable with complicated forms.",
    deliverables: "Responsive product list\nProduct detail view\nOrder request form\nBasic handover guide",
    requirements: "Mobile-first layout\nClear product availability note\nSimple contact details\nNo online payment in the first version",
    references: "The shop's current product sheet and logo will be supplied after kickoff.",
    targetDate: localDateISO(target),
    budget: "MMK 250,000–750,000",
    decisionMaker: "Shop owner",
    successMeasures: "Customers can send a complete order request in under three minutes.",
    openQuestions: "Who will update product prices? Which products should be shown first?",
  });
  updateView();
  saveDraft();
  setMessage("Example brief loaded. Edit any field to make it your own.", false);
});

printButton.addEventListener("click", function () {
  if (!validForSharing()) return;
  saveDraft();
  window.print();
});

downloadButton.addEventListener("click", function () {
  if (!validForSharing()) return;
  const data = readForm();
  const payload = {
    format: "ClientBrief",
    version: 1,
    exportedAt: new Date().toISOString(),
    projectBrief: data,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sanitizeFileName(data.projectName) + "-brief.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  setMessage("Brief exported as JSON.", false);
});

copyButton.addEventListener("click", async function () {
  if (!validForSharing()) return;
  const textToCopy = buildPlainText(readForm());
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const fallback = document.createElement("textarea");
      fallback.value = textToCopy;
      fallback.setAttribute("readonly", "");
      fallback.style.position = "fixed";
      fallback.style.opacity = "0";
      document.body.append(fallback);
      fallback.select();
      const copied = document.execCommand("copy");
      fallback.remove();
      if (!copied) throw new Error("Clipboard access was not available.");
    }
    setMessage("Brief copied. You can paste it into an email or project document.", false);
  } catch (error) {
    setMessage("Copy was blocked by the browser. Use Export JSON or Print / Save as PDF instead.", true);
  }
});

resetButton.addEventListener("click", function () {
  if (typeof resetDialog.showModal === "function") {
    resetDialog.showModal();
  } else if (window.confirm("Clear this draft and remove the saved browser copy?")) {
    clearDraft();
  }
});

resetDialog.addEventListener("close", function () {
  if (resetDialog.returnValue === "confirm") clearDraft();
});

function clearDraft() {
  window.clearTimeout(saveTimeout);
  form.reset();
  try {
    localStorage.removeItem(STORAGE_KEY);
    setStatus("Draft cleared");
  } catch (error) {
    setStatus("Form cleared; saved draft could not be removed");
  }
  setMessage("The form has been cleared.", false);
  updateView();
}

const restored = restoreDraft();
if (!restored) setStatus("Your brief is ready to start");
updateView();