# ODS Framework Developer Guide

This document serves as a getting started guide for working with the ODS Framework.

- [Install Dependencies](#install-dependencies) 
- [Install and Use](#install-and-use)
- [Development](#development)
- [Understanding Server APIs](#understanding-server-apis)

## Install Dependencies
The ODS Framework can be built using a Javascript NodeJS Environment.

### Basic Requirements

* Install [git](https://github.com/git-guides/install-git)
* Learn how to [fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and [clone](https://github.com/git-guides/git-clone) GitHub repositories.

If you desire to extend or enhance the Common or Framework code, a local development environment will need to be configured. This requires the installation of Node.js prerequisites, specifically NodeJS 20+ and npm 10+. Visit [nodejs downloads](https://nodejs.org/en/download/) for latest versions.

## Install and Use
Perform the following steps to build a local version of the framework.

### Fetch Latest Code
These instructions assume you have a local copy of a forked instance of [discoverfinancial/ods-framework](https://github.com/discoverfinancial/ods-framework).

```
cd <WORKSPACE>
git clone https://github.com/<YOUR-ORG>/ods-framework
cd ods-framework
```

where:

* `<WORKSPACE>` is path to the local folder where you have created a copy of the GitHub repository.
* `<YOUR-ORG>` is the name of your GitHub account or personal GitHub organization.

### Build the Framework
The following commands will build the framework using a local Node.js environment running on a Linux distribution such as MacOS. 

To build the ods-common package

```
cd ods-common/code

# build ods-common
npm run build
```

This will create the npm module with filename ods-common-x.y.z.tgz.  This npm only has the interfaces needed for the UI for applications that use the framework.  It is separate since the UI doesn't need the entire framework. 

To build the ods-framework package


```
cd ods-framework/code 

# If ods-common was changed, then this script updates ods-framework to use it
./reimport

# build ods-framework
npm run build
```

This will create the npm module with filename ods-framework-x.y.z.tgz.  It will be included by the application that implements the ODS Server.

## Understanding Server APIs

Documentation for the server APIs may be found [in the README](./Using_ODS_Framework.md#api), or by using the `/api/swagger` and `api/ods-swagger` endpoints on a running ODS Server.  The `swagger` endpoint is used for any DLMS documents and the `ods-swagger` endpoint is used for the additional ODS APIs.

