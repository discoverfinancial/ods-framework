> NOTE: At this time we aren't accepting any pull requests for code contributions.  Feedback and bug reports are always welcome.

#  Project Contribution Guide
This document provides guidance for how YOU can collaborate with our project community to improve this technology.

# ODS Contribution and Governance Policies

This document describes the contribution process and governance policies of the ODS project. The project draws influence from, but is not driven by, the [Linux
Foundation Antitrust Policy](https://www.linuxfoundation.org/antitrust-policy/), and the FINOS [IP Policy](https://community.finos.org/assets/files/IP-Policy-9b1cd5f6c1d682e073c3c15224fc6d86.pdf), [Code of Conduct](https://community.finos.org/docs/governance/code-of-conduct), [Collaborative Principles](https://community.finos.org/docs/governance/collaborative-principles/), and [Meeting Procedures](https://community.finos.org/docs/governance/meeting-procedures/).  Please contact a maintainer if you are unsure how to proceed on any topic.

## Reporting Issues

We welcome any feedback on the quality, stability or performance of ODS.  If you see incorrect behavior or would like to suggest ways to improve ODS, please use these guidelines to create an issue in GitHub.
1. Please [check](https://github.com/discoverfinancial/ods-framework/issues) whether there is already an open issue related to your experience/feedback. If there is, join the discussion and contribute any observations or information that may not already be present in the issue.
2. If there isn't already a relevant issue, create one using one of the provided templates.  Please provide the following information:
    1. Add appropriate tag for project -> [`ods-framework`, `ods-surveyor`, `ods-sample`]
        * ods-framework - Core ODS framework functionality
        * ods-surveyor - Data surveyor tool for profiling and assessing data quality
        * ods-sample - Sample applications demonstrating ODS functionality
    3. Add appropriate tag for type of issue -> [`bug`, `enhancement`]
    4. (optional) Add tag for required specialties -> [`design thinking`, `project management`, `question`, `documentation`]
    5. Set `Projects` field to `ODS`
3. If you are reporting a problem that exists in ODS, try to convey answers for the following:
    * Is the bug reproducible as explained?
    * Is it reproducible in other environments (for instance, on different browsers or devices)?
    * Are the steps to reproduce the bug clear? If not, can you describe how you might reproduce it?  Please provide as much relevant information as possible and break the instructions for reproducing the problem into clear, simple steps.
    * Is this bug something you have run into?  Is it blocking you?  Would you appreciate it being looked into faster?
4. If you would like to contribute designs, code, testing or resources toward resolving the issue, please note that in the issue.
5. Respond to any questions or suggestions raised in the issue by other community members.
6. We will triage all new issues at our next community meeting if you would like to offer more information as we prioritize your issue.  Click to see more [meeting
   information](https://github.com/discoverfinancial/ods-framework/blob/main/CONTRIBUTE.md#meetings).

### Asking for features/enhancements

Similar to reporting issues, a user wishing to create a feature request should first [check](https://github.com/discoverfinancial/ods-framework/issues) whether a similar request has already been made in the system.  Searching for features should include looking for issues with the `enhancement` label.  Additionally, searching on issues with the string `[EPIC]`in the title may prove useful.

If there isn't already a similar feature request, please create one using the appropriate `Feature Request Form` template.  After questions and suggestions from the community have been considered by the author and any resulting updates to the request have been made, we will triage the feature request.  If we determine the request to be sufficiently complex that we need to break work items into their own issues, the feature request will likely become an EPIC.  We will work with the author to ensure that no insights or information will be lost.

## Contribution Process

Before making a contribution, please take the following steps:
1. Check whether there's already an open issue related to your proposed contribution as described above.  If not, follow instructions above to create an issue with all relevant information.
2. Respond to any questions or suggestions raised in the issue by other developers.
3. Fork the project repository and prepare your proposed contribution.  All contributions should be created using the latest code from the upstream dev branch.
    1. Create and checkout a new branch to make changes within: `git checkout -b "thisBranchFixesIssue#<issue no.>"`
    2. Update your new branch with the latest upstream dev branch.
    3. In commit messages, reference associated issue.  For example, `commit -m "discoverfinancial/ods-framework#111: corrected button behavior"`
    4. When your changes are ready, be sure to update your branch with the latest upstream dev branch to ensure code will merge correctly.
    5. Retest your contribution with latest updates.
4. Submit a pull request.
    * All pull requests should be made to merge into the upstream dev branch.

## Team members

Meet and join our [Team of Contributors](https://github.com/discoverfinancial/ods-framework/wiki/Maintainers-&-Contributors).

## Learn & listen
<!-- Fill out Missing Project Communications -->
This section includes ways to get started with your open source project. Include links to documentation and to different communication channels:

* Github Discussions
    * Used for questions and discussions of interest to the broader community.
    * Link: https://github.com/discoverfinancial/ods-framework/discussions
* Slack
    * Used for questions to project maintainers or for private chat. 
    * Link: https://dfslabs.slack.com/
    * Invitation: https://join.slack.com/t/dfslabs/shared_invite/zt-2n765ndgw-4eTAaEGw6aOU~mMERwf2JQ
* Blog/Wiki
    * Link: https://github.com/discoverfinancial/ods-framework/wiki

## Community
Participating in our project community spans a variety of activities:

* Reporting bugs and enhancements requests
* Contributing ideas on how to improve testing strategies and identifying gaps in test coverage
* Contributing ideas for how to build the community (see issues tagged with the 'community' tag for examples)
* Speaking at conferences and meetups to build awareness and community
* Participating in Collaboration Summits
* Contributing ideas for improving documentation
* Identifying and tracking new use cases
* Create an example of the project in real world by building something or showing what others have built.
* Blog about other people’s projects based on this project. Show how it’s used in daily life. Take screenshots and make videos!

To join our community see the [Onboarding Resources](https://github.com/discoverfinancial/ods-framework/wiki/Onboarding-Resources) page in the wiki.

## Project Management
<!-- Fill out Missing Project Communications Details-->
Our project uses a combination of GitHub Issues and Project Kanban Dashboards to manage sprint plans.

### Project Roadmap
<!-- ToDo provide Wiki URL for release plan. -->
Our vision for the maturation of this project is outlined in the [Project Roadmap](https://github.com/discoverfinancial/ods-framework/wiki/Roadmap) which is reflective of our intended milestones/release plan.

### Meetings

Logistics for Project Triage Sessions:
* [Meeting Details](https://github.com/discoverfinancial/ods-framework/wiki/Communication#meetings)
* [Meeting Minutes](https://github.com/discoverfinancial/ods-framework/wiki/Meeting-Minutes)

Project Management:
* [Project Kanban Dashboard](https://github.com/orgs/discoverfinancial/projects/2/views/1)

### Contributing Code

#### Community Adoption
Strategically, *Discover Financial Services* intends for this repository to be **promoted** for maturation upstream within a *yet-to-be-identified* community such as [FINOS](https://www.finos.org) or [OpenJS](https://openjsf.org). Once we see broader community contributions we will aggressively work towards the promoting of this project. If and when such a transfer occurs, normal `pull request` based contributions will be possible.

#### Incubation Period
During this tactical timeframe (*for as long as this repo resides within the [DFS GitHub organization](https://github.com/discoverfinancial)*), `pull requests` will not be accepted. For those willing to
answer our [call for contributions](https://github.com/discoverfinancial/ods-framework), please proceed by:

#### Coding Conventions
* ReactJS:
    * `PascalCase`: ReactJS components, interfaces, component file names (tsx, jsx, css)
    * `camelCase`: JavaScript data variables, functions, non-component file names (ts, js, css)
    * Tab: 4 spaces
* NodeJS:
    * `camelCase`: JavaScript data variables, functions, non-component file names
    * Tab: 4 spaces
* CSS:
    * `kebab-case`: CSS variables
    * Tab: 2 spaces
* Other
    * `kebab-case`: Directories and file names
    * `UPPERCASE`: Some root markdown files that are commonly all caps

Currently, ODS Framework is unable to accept pull requests or code contributions of any kind.  However, we are eager to collaborate with you and share ideas on how you can best use the ODS Framework in your projects and listen to your ideas on how the ODS Framework can be improved.

References:
* [ReactJS coding conventions](https://levelup.gitconnected.com/react-code-conventions-and-best-practices-433e23ed69aa)
* [React Best Practices](https://www.freecodecamp.org/news/best-practices-for-react)
* [Case Styles: Camel, Pascal, Snake and Kebab Case](https://betterprogramming.pub/string-case-styles-camel-pascal-snake-and-kebab-case-981407998841)
* [camelCase](https://en.wikipedia.org/wiki/Camel_case)


## Testing
Testing new releases and/or features is a great way to contribute to the community. If you find issues, please submit an [Issue/Feature
Report](https://github.com/discoverfinancial/ods-framework/issues).

## Documentation
[Learn](./DEV_GUIDE.md) how to develop, build, test, and contribute to the online docs.

## Translations
Our project aspires to be globally applicable but that requires internationalization support beyond the English language. We seek help in:

* Providing instructions for extending internationalization support;
* Providing specific language translation enhancements.

## Governance

### Roles

The project community consists of Contributors and Maintainers:
* A **Contributor** is anyone who submits a contribution to the project. (Contributions may include code, issues, comments, documentation, media, or any combination of the above.)
* A **Maintainer** is a Contributor who, by virtue of their contribution history, has been given write access to project repositories and may merge approved contributions.  Currently only Discover employees may contribute to the project.
* The **Lead Maintainer** is the project's interface with the Discover Open Source Governance Board. They are responsible for communicating on behalf of the project. The Lead Maintainer is elected by a vote of the Maintainers.

### Contribution Rules

Anyone is welcome to submit a contribution to the project. The rules below apply to all contributions. (The key words "MUST", "SHALL", "SHOULD", "MAY", etc. in this document are to be interpreted as described in [IETF RFC 2119](https://www.ietf.org/rfc/rfc2119.txt).)

* All contributions MUST be submitted as pull requests, including contributions by Maintainers.
* All pull requests SHOULD be reviewed by a Maintainer (other than the Contributor) before being merged.
* Pull requests for non-trivial contributions SHOULD remain open for a review period sufficient to give all Maintainers a sufficient opportunity to review and comment on them.
* After the review period, if no Maintainer has an objection to the pull request, any Maintainer MAY merge it.
* If any Maintainer objects to a pull request, the Maintainers SHOULD try to come to consensus through discussion. If not consensus can be reached, any Maintainer MAY call for a vote on the contribution.

### Maintainer Voting

The Maintainers MAY hold votes only when they are unable to reach consensus on an issue. Any Maintainer MAY call a vote on a contested issue, after which Maintainers SHALL have 36 hours to register their votes. Votes SHALL take the form of "+1" (agree), "-1" (disagree), "+0" (abstain). Issues SHALL be decided by the majority of votes cast. If there is only one Maintainer, they SHALL decide any issue otherwise requiring a Maintainer vote. If a vote is tied, the Lead Maintainer MAY cast an additional tie-breaker vote.

The Maintainers SHALL decide the following matters by consensus or, if necessary, a vote:
* Contested pull requests
* Election and removal of the Lead Maintainer
* Election and removal of Maintainers

All Maintainer votes MUST be carried out transparently, with all discussion and voting occurring in public, either:
* in comments associated with the relevant issue or pull request, if applicable;
* on the project mailing list or other official public communication channel; or
* during a regular, minuted project meeting.

### Maintainer Qualifications

Any Contributor who has made a substantial contribution to the project MAY apply (or be nominated) to become a Maintainer. The existing Maintainers SHALL decide whether to approve the nomination according to the Maintainer Voting process above.

### Changes to this Document

This document MAY be amended by a vote of the Maintainers according to the Maintainer Voting process above.
