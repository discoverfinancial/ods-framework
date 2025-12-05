[![DFS - Incubating](./docs/_images/discover-incubating.svg)](https://technology.discover.com/technologies/open_source) [![Contributors-Invited](https://img.shields.io/badge/Contributors-Wanted-blue)](./CONTRIBUTE.md)
# ODS Framework

This repository contains the framework upon which enables Operational Data Stores (ODS) and ODS applications to be built.

There are two directories for the two npm modules that make up the framework:

### ods-common

The common package is a required dependency for ods-framework. It contains interfaces for ODS data models (in the models directory) and document states (in the states directory).

It also includes two utility classes included that assist with using and rendering ODS content.  The odsUtils can be used on server and browser, while the odsUi defines the browser's AppContext interface.

[View the ods-common README](./ods-common/code/README.md)

### ods-framework

The ods-framework package contains the framework module for implementing an Operational Data Store (ODS) server and ODS applications.  It stores enterprise operational data from different systems of record using an industry standard [CycloneDX SBOM](https://cyclonedx.org/docs/1.6/json/) data model in a MongoDB database.  

The framework defines an architecture that utilizes data clients to extract data from the systems of record in your enterprise or from the broader community and aggregate with other data to create a more complete view of a software product.  The data clients can optionally cache data in MongoDB to improve performance for aggregation and query operations.

[Learn more about ODS Framework](./docs/README.md)

[View the ods-framework README](./ods-framework/code/README.md)

## Join our community!

We encourage designers, developers, technical writers and testers to read about our project, to learn about our goals, and to ask questions.  And we hope that you will spend some time in our community.

## Learn more, give feedback

We are happy to listen to ideas, to learn where we can improve and would love to help you become involved in our project.  If you would like to help us to refine ODS Framework's template or ODS applications by reporting issues or suggesting enhancements, please begin the dialog by capturing your thoughts and observations in a [GitHub Issue](https://github.com/discoverfinancial/ods-framework/issues).  Please see the `ods-sample` github repositories to open issues for those projects.

If you would like to discuss our ambitions and vision, or to learn more about ODS family, please [reach out to us through Slack](https://dfslabs.slack.com).

## License

Copyright 2025 Capital One

Distributed under the [MIT License](http://opensource.org/licenses/MIT).

SPDX-License-Identifier: [MIT](https://spdx.org/licenses/MIT)
