# Installation

## System Requirement

Before we begin the installation, make sure you satisfy the system requirement.

### Operating System

Any Linux or macOS distribution is fine, however the following are recommended, as they are thoroughly tested.

* Ubuntu 16.04
* macOS 10.13 High Sierra

### Redis

Redis is **required** for the system to function.

Any version of Redis should be fine, but it is recommended to get the latest 4.0 version.

*Make sure Redis is not password protected, and is only visible on internal network.*

### MongoDB

MongoDB is **required** for the system to function.

We support MongoDB 3.6.x, however 4.0 should also work.

*Make sure MongoDB is not password protected, and is only visible on internal network.*

### Node.js

Node.js 8.x is required.

## Build

Awesome! You now have the system requirement satisfied, let's build the application.

### Install Dependencies

First we need to install some dependencies, you can do it by simply running

```
$ npm install
```

### Unit Test (Optional)

You can run an unit test just to make sure everything is working.

```
$ npm run test
```

You should see something like the following if test passes

```
  ConfigFile
    #constructor()
      ✓ should set file path
    #read()
      ✓ should read the file content and return it as string

  YamlConfigFile
    #parse()
      ✓ should parse the yaml content
      ✓ should throw error if yaml not valid


  4 passing (12ms)
```

### Compile JavaScript

Before we can run the server, we need to compile the scripts to strip out all type definitions.

```
$ npm run flow:build
```

You should now see a new folder called `/lib`. Congratulations! Everything is built.

## Basic Configurations

We now need to do some basic configurations, open `config.yml`, and put following content.

```yml
port: # Which port you wish to listen on
host_root: # Host root url, for example: https://example.com
redis:
  - host: # Redis host
  - port: # Redis port
mongo:
  url: # MongoDB connection URL, for example: mongodb://localhost:27017/ia
app_secret: # Choose a random string, this is used to encrypt sessions
```

Now try to run the server using command:

```
$ node ./lib
```

You will see an error saying `identity_providers` is undefined. This is because we haven't defined a list of IdPs to use yet, to do so, please follow Identity Provider Configurations