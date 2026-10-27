# ClientBrief — Project Brief Builder

ClientBrief is a responsive intake form for freelancers and small teams. It gathers project goals, scope, deliverables, requirements, budget, timing, and open questions into one readable project brief.

**Live demo:** [Open ClientBrief](https://client-brief-wdf-5618s-projects.vercel.app)  
**Source code:** https://github.com/wdf-5618/client-brief

## Features

- Collect client contact details, project context, goals, audience, scope, requirements, and references.
- Build a live structured brief while the form is edited.
- Show a lightweight completion indicator to encourage useful project details.
- Validate the required fields before copying, exporting, or printing.
- Save a draft in the current browser and restore it after a refresh.
- Copy a plain-text brief to paste into an email or project document.
- Export the structured form data as a JSON file.
- Print the brief or save it as a PDF using the browser's print dialog.
- Load an example brief to explore the workflow.
- Responsive layout, semantic sections, keyboard focus indicators, and status messages.

## Run locally

No build step or package installation is required. From the repository root, run:

~~~bash
python -m http.server 8000
~~~

Then open [http://localhost:8000](http://localhost:8000).

## Project structure

~~~text
client-brief/
├── index.html   # Intake form and live brief preview
├── styles.css   # Responsive layout and print styling
├── app.js       # Validation, rendering, and browser-local draft behavior
└── README.md
~~~

## How it works

- The preview is created with DOM nodes and textContent, so user-entered text is displayed as text rather than injected as HTML.
- One versioned draft is saved in localStorage in the current browser profile.
- JSON export contains the form values and an export timestamp. It does not upload anything.
- The brief is checked against required form fields before copy, export, or print actions.
- The date field uses the browser's local calendar date as the earliest selectable target date.

## Scope and limitations

This is a learning prototype, not a client management platform or project contract. The draft stays in the current browser profile; it does not sync between devices, notify a freelancer, send an email, or store information on a server. There are no accounts, permissions, shared editing, or backend validation. Example client details are fictional. Budget options are sample ranges and should be adjusted for a real project's context.

Avoid putting confidential client information into a public demo. A production version would need secure server-side storage, access control, retention/deletion policies, and a clear privacy notice.

## Manual test checklist

- [x] Fill the four required fields and check the browser validation.
- [x] Confirm the preview updates while typing and that empty sections are omitted.
- [x] Load the example brief and edit several fields.
- [x] Refresh and confirm that the draft restores in the same browser.
- [x] Confirm the plain-text brief is copied to the clipboard.
- [x] Export JSON and confirm it contains form data without contacting a server.
- [x] Generate a PDF and confirm the brief content is present while the form is excluded.
- [x] Clear the form and confirm the saved browser draft is removed.
- [x] Check the layout at a narrow mobile viewport and confirm there is no horizontal overflow.

Smoke testing was performed against the public production URL with a headless browser. This covers the listed workflows but is not a substitute for ongoing testing on different devices and browsers.
