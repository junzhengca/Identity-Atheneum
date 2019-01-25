# Identity Atheneum

[![Build Status](https://travis-ci.org/junthehacker/Identity-Atheneum.svg?branch=master)](https://travis-ci.org/junthehacker/Identity-Atheneum)
[![Coverage Status](https://coveralls.io/repos/github/junthehacker/Identity-Atheneum/badge.svg?branch=master)](https://coveralls.io/github/junthehacker/Identity-Atheneum?branch=master)
[![Slack](https://identity-atheneum-slackin.herokuapp.com/badge.svg)](https://identity-atheneum-slackin.herokuapp.com)

Easy to use data storage and authorization service for developers.

## Features

-   SAML 2.0 IdP Support.
-   Distributed tracing support with Zipkin.
-   Automated error reporting with Sentry.
-   Easy installation and configuration.
-   Instructor and TA interface for easy course administration.
-   REST and GraphQL API support.
-   Advanced Event emitting interface via Redis Pub/Sub and Socket.io.

## Installation

### System Requirements

-   UNIX based operating system (Linux/macOS)
-   Redis 2/3/4 (cannot be password protected)
-   MongoDB 3.6+ (cannot be passsword protected)
-   Node.js 8.x

### Install Dependencies

First clone the repository and install all dependencies.

```bash
# clone the repository
git clone https://github.com/junthehacker/Identity-Atheneum.git
# cd into the repo
cd Identity-Atheneum
# install node dependencies
npm install
```

### Build

We must run a build script before we can actually run the service.

```
npm run flow:build
```

Above command will build everything within `/src` and output into `/lib`.

### Configuration

Before running the service, you must have a valid configuration file, located at `/config.yml`.

-   port: Port you wish to run the service on.
-   host_root: The root URL of the service, for example: https://sample.com (do not include trailing `/`).
-   app_secret: A random string, used to encrypt sessions.
-   zipkin: Optional, configure this if you wish to enable distributed tracing
    -   endpoint: Zipkin endpoint, for example `http://99.79.38.115:9411/api/v2/spans`
    -   service_name: Name of this service, for example `ia-local`
-   redis:
    -   host: Redis server host
    -   port: Redis server port
-   mongo:
    -   url: MongoDB connection url, for example mongodb://localhost/27017/ia (make sure you include the db name)
-   master_key: A random password, used for administrative access.
-   identity_providers: A list of IdP configurations, please see [IdP Configurations](#idp-configurations) for more detail.

### Run

To run the service, use the following command

```
node ./lib
```

You should see something similar to the following

```
Local IdP local_provider initialized.
/idps/local_provider mounted.
SAML IdP testshib initialized.
/idps/testshib mounted.

========================================
 ___      ________
|\  \    |\   __  \
\ \  \   \ \  \|\  \
 \ \  \   \ \   __  \
  \ \  \ __\ \  \ \  \ ___    Build 1
   \ \__\\__\ \__\ \__\\__\   1.0
    \|__\|__|\|__|\|__\|__|   Dandelion
```

Congratulations! The service is running.

## IdP Configurations

You must have a list of IdPs to make the service useful, there are a few to choose from.

### Local

A local identity provider, it stores username and password within MongoDB.

You can only have one local identity provider.

#### Sample Configuration

```yaml
identity_providers:
    # ...
    - type: local
      name: local_provider
      display_name: Local Identity Provider
```

-   type: Should always be `local`
-   name: Unique name for IdP, this is used to generate login URLs.
-   display_name: Name shown on main login page.

### SAML 2.0

SAML 2.0 IdP, if you are using Shibboleth, use this one.

To configure SAML IdP, you must have a key/certificate pair, you can use the following command to generate a pair:

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout mykey.key -out certificate.crt
```

#### Sample Configuration

```yaml
identity_providers:
    # ...
    - type: saml
      name: testshib
      display_name: TestShib
      config:
          callback_url: http://localhost:3000/idps/testshib/login
          entry_point: https://idp.testshib.org/idp/profile/SAML2/Redirect/SSO
          identifier_format: urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
          issuer: my_issuer
          public_cert: keys/certificate.crt
          private_key: keys/mykey.key
          signature_algo: sha256
```

-   type: Should always be `saml`
-   name: Unique name for IdP, this is used to generate login URLs.
-   display_name: Name shown on main login page.
-   config:
    -   callback_url: This should always be `<host_root>/idps/<name>/login`
    -   entry_point: SAML 2.0 entry URL
    -   identifier_format: User identifier format, make sure your IdP support the format you chose. If not sure, use `unspecified`.
    -   issuer: Just a name, you can use anything you like
    -   public_cert: Path to your public certificate
    -   private_key: Path to your private key
    -   signature_algo: What algorithm to use when signing requests.

## SAML MetaData

It is useful to have a xml metadata file when registering with your IdP. To obtain this file, first make sure you have everything configured, then run the service and go to following URL.

```
<host_root>/idps/<name>/metadata
```
