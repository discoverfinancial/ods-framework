# Attestations in ODS Framework

As a part of maintaining software products and systems, there is often a requirement for product owners or developers to be made aware of certain aspects of the software or to validate or certify certain evidence.  These may be driven by business processes, software community determination or risk assessment, and used to satisfy audits, provide managment awareness, or determine operational risk.  For example a product team may need to update a specific open source library on a given timeline to remediate a vulnerability risk.  However, there are many different sources of information about the software bill-of-material that may require updates to be executed by a development team which can make a wholistic view of mandates difficult to manage. 

Teams often have to manage multiple types of updates or enhancements, suggested by a variety of tooling, for a number of different reasons. These suggestions can be hard to track and can be lost or ignored until it becomes a larger problem and affects product stability, vulnerability or customer expectations.  This includes scenarios such as when vulnerabilities are identified in upcoming infrastructure changes which may require updates to a piece of software or system in order to remediate the issues. 

## Overview

The attestation framework defines a flexible system to handle collecting evidence and acknowledgments for a software product or about other entities.  It includes notifications and traceability of these changes, to lower risk and conversely to provide a higher level of confidence for a product or entity of the attestation.

It allows for any type of item or initiative to be acknowledged and tracked by any interested party, and be made available as evidence of conformance for an audit or other review.  With a standardized and consistent attestation framework, issues can be consolidated and tracked at a single location such as a UI which enables them to be easily viewed, managed and remedied. 

## Personas
The following users interact with, contribute to, or receive output from the invention:
- Creator: Generates evidence and associates targets.
- Attestor: Views, updates and attests to assigned evidence.
- Auditor: Views attestations.

## Diagram

![alt text](<Attestation Diagram.png>)

The Attestation Subject block is the item that this attestation references.  It could be a software product, infrastructure, hardware, service, or process - essentially anything abstract or concrete.

The Attestation Creation block is responsible for creating the initial attestation object as described by the Attestation Data Model below.

The Attestation Processor block manages the lifecycle of the attestation document.  It could include a state machine that handles the transition through the various lifecycle stages or states.  This block includes processing required to handle Reminders and Notifications.

The Attestation UI block includes the Attestation Renderer UI that renders the attestation and allows one or more attestors to enter and attest to evidence.  It also includes the Attestation Report Dashboard that can be used by product owners, executives, auditor and regulators to view status of and compliance with requirements.

The Attestation Database block is the database where the attestation documents are stored.

## Attestation Data Model

The attestation data model contains the following types of information:

- A State property to track the lifecycle of the attestation.  This could include any enumeration of values, such as:
    - created: The attestation has been created
    - active: The attestation is active and waiting for an attestor to view and add evidence
    - inprogress: An attestor has provided some evidence, but other evidence remains incomplete
    - overdue: Based upon reminder dates, the attestation is considered overdue
    - rejected: An attestor has indicated that the attestation is rejected and complete evidence will not be provided
    - completed: All evidence in the attestation has been provided by one or more attestors

- Set of Evidence comprised of a set of questions from a creator along with assertions from an attestor.  Detailed information about the attestor's identity, date of attestation and answers are included.  To ensure non-repudiation, the evidence may be digitally signed by the attestor.

- Reminder values which notify relevant parties of required actions. The reminder may include times when a reminder is to be sent to attestors or other interested parties.  It may also provide a custom message text about the attestation that can be sent via email or some other type of notification system.

- Attestor object which identifies the user(s) responsible for providing evidence to a created attestation. 

- Flow Type property which determines the type of attestation and how the user interface is rendered.  
    - It can specify any value such as an "updateVersion" which indicates that the UI should render the questions in the evidence in a predetermined way.  
    - It could also be "questions" for which the UI renders all the questions in one UI page or one at a time.  
    - There could also by a "script" type where the UI is rendered according to JavaScript (or another scripting language) that run in a sandboxed environment with a defined set of utility functions for generating the rendering and interacting with the attestor.  A set of possible utility function include 
        - setState(newState)
        - showQuestion(key)
        - getAttestation()
        - sendEmail()
        - getSubject()
        - getTargets()
        - getGuidance()

- A Subject which associates entities to the specified attestation.  The subject may be different document type in a database.  If so, the subject property would be a reference to that document.  The subject could also reference an entity such as other software, infrastructure, hardware, service or process.  

- Additional Metadata can be included in the data model for referencing the attestation (such as the id), or providing other attestation information such as title, description, or other references.

The attestation data model from models/attestation.ts in ods-common is shown below.

```
interface Attestation {
    id: string;                 // The id of the attestation       
    title: string;              // The title of the attestation
    state: string;              // The state of the attestation (example values include created, active, incomplete, pending, inprogress, overdue, complete, rejected, deferred, cancelled)
    dateCreated: number;        // The date the attestation was created
    dateUpdated: number;        // The date the attestation was updated
    subject: AttestationRef;    // A reference to the document that this attestation is about
    target: TargetRef[];        // A reference to the documents that this attestation requires changes to before being completed
    summary: string;            // A summary of the attestation
    guidance: string;           // A reference to the guidance document that this attestation collects evidence about.  This is used for flowType == "updateVersion"
    evidence: {                 // Questions that attestors answer
        [key: string]: Evidence;
    }
    flowType: string;           // The type of attestation (example values include "updateVersion",  "question",  "script")
    script: string;             // The JavaScript code if flowType == "script"
    attestors: Attestor[];      // The list of users that have edit permission for attestation and can provide evidence
    notification: {             // The information for sending a notification that is used by the Attestation Processor when the attestation state is changed
        [key: string]: Email;   //      key = attestation state
    };
    dateStart: number;          // The date that the attestation becomes valid (don't sent notifications until this date)
    dateDueReminder: Reminder[];  // The reminders to send before an attestation is due
    overdueReminder: Reminder[];  // The reminders to send when an attestation is overdue
    attestationDefinitionId?: string;   // The id of the attestation definition that created this attestation
}


interface Email {
    to: string[];               // Attestor, Admin, ProductTeam, some management chain title (ie Director, VP, etc), or email address
    subject: string;            // Subject for email
    message: string;            // Email body
}

interface Reminder {
    days: number;               // Number of days before or after dateDue
    dateSent: number;           // Date that the reminder was sent
    emailText: Email;           // Email text to send
}

interface AttestationRef {
    id: string;                 // The id of the reference document
    name: string;               // The name of the reference document (such as an open-source library name)
    version: string;            // The version of the reference document (such as an open-source library version)
}

interface TargetRef extends AttestationRef {
    preferredVersion: string;   // The version of the reference document that the attestation requires (such as the most recent version of an open-source library)
}

interface Evidence {
    question: string;           // The question that the attestor is asked to answer and attest to
    type: string;               // The type of question that is used by the UI renderer.  Possible types of questions are "text", "yesno", "confirm", "date" and "select".
    answer: string;             // The answer to the question
    attestor: User;             // The attestor who answered question
    date: number;               // The time when question was answered
    signature: string;          // The digital signature providing authenticity and non-repudiation of the question and answer
}

interface Attestor {
    role: string;               // The role assigned to the attestor
    user: User;                 // The identity of the attestor
}

interface User {                // The user details as known in the attestation system
    email: string;
    lastName: string;
    firstName: string;
    userName: string;
    displayName: string;
}

```

## Create Attestation

To create an attestation, the Create Attestation block can be implemented as an algorithm that takes user or other provided information about a subject and builds an attestation document consisting of a set of evidence, reference to relevant documents, a list of attestors and additional metadata properties for UI and notifications.

An example attestation creator code block is shown below.

```
// Get subjects of the attestations
const subjects = await getSubjects();

// For each subject
for (const subject of subjects) {

  // Set the attestors list to all members of the product team
  const attestors = await getAttestorsFromProductTeam(subject);

  // Create attestation
  createAttestation({
        state: "active",
        title: `Update ${target.name} from ${target.version} to ${preferredVersion}`,
        subject: subject,
        targets: [target],
        summary: `Your product ${subject.name} is using ${target.name}@${target.version}.  Guidance recommends that your product be updated to use version ${preferredVersion}.  Please attest to the following statements.`,
        guidance: guidance.id,
        flow: "question",
        evidence: {
            "q1": {
                "question": "Do you plan on updating ${target.name} from version to @${target.version} to ${preferredVersion}?",
                "type": "yn",
            },
            "q2": {
                "question": "If so, when do you anticipate update to be completed?",
                "type": "date",
            }
        },
        attestors: attestors,
        emailText: {
            active: {
                to: ["Attestor"],
                subject: `You have an Attestation: ${subject.name}`,
                message: `<h2>Hi %name%</h2><div>The following product ${subject.name} has attestations that need your review.  Please click on this <a href="">link</a> to review attestation.</div>`,
            },
            ...
        },
        dateStart: now,
        dateDueReminder: [
          {
            days: 30,
            emailText: {
              groups: ["Attestor"],
              subject: `This is a reminder of 30 days`,
              message: `<h2>Hi %name%,</h2> This is due in 30 days.`,
            }
          },
          {
            days: 60,
            emailText: {
              groups: ["Attestor"],
              subject: `This is a reminder of 60 days`,
              message: `<h2>Hi %name%,</h2> This is due in 60 days.`,
            }
          },          
        ],
        overdueReminder: [
          {
            days: 30,
            emailText: {
              groups: ["Attestor"],
              subject: `This is a reminder of 30 days`,
              message: `<h2>Hi %name%,</h2> This is overdue.`,
            }
          },
          {
            days: 60,
            emailText: {
              groups: ["Attestor"],
              subject: `This is a reminder of 60 days`,
              message: `<h2>Hi %name%,</h2> Please review and provide requested evidence per corporate guidance policy.`,
            }
          },          
        ],
    })
}
```

For flowType of script, the script property includes the JavaScript code that is executed to render the attestation UI.

To provide security, the script can run in a sandboxed environment with a defined set of utility functions for generating the rendering and interacting with the attestor.  A set of possible utility function include 
        - setState(newState)
        - showQuestion(key)
        - getAttestation()
        - sendEmail()
        - getSubject()
        - getTargets()
        - getGuidance()

The following is a script that asks the attestor several questions about the product plans for updating an open-source library to a specific version.

```
const intentionToUpdate = await getAnswer("intentionToUpdate");
const plannedDate = await getAnswer("plannedDate");
const justificationNotToUpdate = await getAnswer("justificationNotToUpdate");
const completedDate = await getAnswer("completedDate");

await showDiv(attestation.summary, "spacer", {fontWeight:"bold"});

async function renderReviewer(key) {
    const reviewer = await getReviewer(key);
    if (reviewer) {
        const date = await getAnswerDate(key);
        await showDiv("Attested by "+reviewer.name+" on" + await formatDateTime(date), "", {fontStyle:"italic", fontWeight:"lighter"})
    }
}

{
    await showQuestion("intentionToUpdate");
    await renderReviewer("intentionToUpdate");
}

// }
if (intentionToUpdate=="Yes") {
    if (!plannedDate) {
        await showQuestion("plannedDate");
        await showButton("Save Attestation - Pending", async function() {
            await console.log("save clicked")
            await setState("pending");
        });
    }
    else if (!completedDate) {
        await showQuestion("plannedDate");
        await renderReviewer("intentionToUpdate");

        await showQuestion("completedDate");
        await showButton("Save Attestation - Pending", async function() {
            await console.log("save clicked")
            await setState("pending");
        });
    }
    else {
        {
            await showQuestion("plannedDate");
            await renderReviewer("plannedDate");
        }
        {
            await showQuestion("completedDate");
            await renderReviewer("completedDate");
        }

        await showButton("Save Attestation - Complete", async function() {
            await console.log("save clicked")
            await setState("completed");
        });
    }
}
if (intentionToUpdate=="No") {
    await showQuestion("justificationNotToUpdate");
    await renderReviewer("justificationNotToUpdate");
    if (justificationNotToUpdate) {
        await showButton("Save Attestation - Reject", async function() {
            await console.log("save clicked")
            await setState("rejected");
        });
    }
}

```

## Attestation Processor

Once an attestation is created, the **Attestation Processor** can implement a state machine to define how the attestation document is processed as it progresses through it's lifecycle.  (see states/attestation.ts in ods-common)

The Attestation Processor is comprised of:

- A state machine which updates the state values of an attestation document after actions have been performed or after specific amounts of time.

- An email processor which notifies the attestors or other interested parties of upcoming tasks or deadlines for a given attestation document.  For software updates, there may be many open source software libraries that should be updated at any one time.  To reduce the number of emails or notifications that a recipient might receive, multiple attestation notifications are consolidated into a single email or message.

- Reminder logic that periodically reviews the reminder properties and identifies which attestations need notifications, and the content and recipients of the notifications.


```
// For each attestation
for (const attestation of attestations) {

    // If not started yet, then skip
    if (attestation.dateStart && (attestation.dateStart > now)) {
        continue;
    }

    // If flowType == updateVersion
    if (attestation.flowType == ATTESTATION_UPDATE_VERSION) {

        // If attestation is question completed, then state should be completed
        // Updating the attestation will cause email to be sent by state machine
        if (attestation.evidence?.[UPDATE_COMPLETED_DATE]?.answer) {
            updateAttestation({state: "complete"}, attestation.id);
            continue;
        }

        // If UPDATE_PLANNED_DATE question is answered, use that as the baseDate for reminders
        const answer = attestation.evidence?.[UPDATE_PLANNED_DATE]?.answer;
        if (answer) {
            const plannedUpdate = (new Date(answer)).getTime();

            if (plannedUpdate) {
                log.debug("Attestation is an ATTESTATION_UPDATE_VERSION")
                const numDays = Math.floor((now - plannedUpdate) / 1000 / 60 / 60 / 24);

                // If overdue & state not set to overdue, then set it.
                // This will send the overdue notification from the state machine
                if (attestation.state != "overdue" && numDays >= 0) {
                    updateAttestation(ctx, {state: "overdue"}, attestation.id);
                    continue;
                }

                // Get reminders and check to see if any should be sent
                const reminderType = (numDays > 0) ? "overdueReminder" : "dateDueReminder";
                const reminders = attestation[reminderType];

                for (const reminder of reminders) {
                    // If a reminder hasn't been sent, then send it
                    if (!reminder.dateSent && reminder.emailText && (
                        (reminderType === "overdueReminder" && (Math.abs(numDays) >= reminder.days)) || 
                        (reminderType === "dateDueReminder" && (Math.abs(numDays) <= reminder.days))
                    )) {
                        const people = getEmailAddressesForAttestation()
                        const sent = sendAttestationReminderIfNotSentYet(ctx, attestation, numDays);
                        reminder.dateSent = Date.now();
                    }
                }

                // Save attestation document with dates that reminders were sent
                updateAttestation(attestation, attestation.id)
            }
        }
    }

    // Handle other flowTypes of attestations
    ...
}

```

