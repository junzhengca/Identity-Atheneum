# Node.js Quick Start Guide

!!! note
    This guide is intended for developers who are integrating their Node.js application with I.A. for the first time.

## Think how you can refactor your application

I.A. is best used when you integrate with it properly. Think about how your application can be refactored. Read the overview page and have a general idea of how I.A. works.

## Register your application

First you have to register your application, goto I.A. admin dashboard by visiting `https://tracademic.utsc.utoronto.ca/login` and login with your administrator credentials.

Then choose \[Applications\] -> \[Import Registration Request\], and enter a string with following format:

```json
{
    "name": "YOUR_APPLICATION_NAME",
    "assertion_endpoint": "http[s]://YOUR_ASSERTION_ENDPOINT"
}
```

* `name` - Your application name, can be anything.
* `assertion_endpoint` - The URL you with I.A. to redirect back to once user is authenticated. For the purpose of this tutorial, we assume you have it set as `http://yourapp.com/login`.

Now you have your application registered, you should see it in the applications list. Click on \[Applications Keys\], and generate a new key pair.

We have all information we need now, let's write a simple configuration file so we keep track of things:

```js
// config.js
module.exports = {
    IA_ENDPOINT: 'https://tracademic.utsc.utoronto.ca',
    APPLICATION_ID: 'YOUR_APPLICATION_ID',
    SECRET_KEY: 'YOUR_SECRET_KEY'
}
```

## Integrate authentication

We assume you are using `passport.js` and have `axios` installed. It is not necessary to have these libs, but they make our life easier.

### Write a service provider

It is a good practice to write a provider for API calls, we will write a simple provider that can get login endpoint, and populate authentication token to a real user.

First write the basic class structure:

```js
// IAServiceProvider.js
const config = require('./config');
const axios  = require('axios');
class IAServiceProvider {

}
```

The first function we are going to write will return the login URL.

```js
// IAServiceProvider.js
class IAServiceProvider {
    // ...
    static getLoginUrl() {
        return `${config.IA_ENDPOINT}/login?id=${config.APPLICATION_ID}`;
    }
    // ...
}
```

Then we will write a function that turns token into a real user

```js
// IAServiceProvider.js
class IAServiceProvider {
    // ...
    static async getUserByAuthenticationToken(token) {
        try {
            const result = await axios.get(
                `${config.IA_ENDPOINT}/api/auth_tokens/${token}`,
                {
                    headers: { Authorization: config.SECRET_KEY }
                }
            )
            return result.data;
        } catch (e) {
            throw e; // Just throw it back
        }
    }
    // ...
}
```

### Create a passport authentication strategy

Use the following code to define your authentication strategy

```js
const passport = require('passport');
const IAServiceProvider = require('../providers/IAServiceProvider');
const CustomStrategy = require('passport-custom').Strategy;

// Nothing to serialize, just passthrough
passport.serializeUser((user, done) => {
    done(null, user);
});

// We get our user by the token
passport.deserializeUser((id, done) => {
    IAServiceProvider.getUserByToken(id)
        .then(user => done(null, user))
        .catch(e => done(e, false));
});

// Custom strategy
passport.use('ia-auth', new CustomStrategy((req, done) => {
    if(req.query.token) {
        IAServiceProvider.getUserByToken(req.query.token)
            .then(() => done(null, req.query.token))
            .catch(e => done(e, false));
    } else {
        done(null, false);
    }
}));

module.exports = passport;
```

Now you have the strategy defined, you can use it easily by adding this to your router

```js
router.get('/login', passport.authenticate('ia-auth', {
    successRedirect: 'URL_YOU_WISH_TO_REDIRECT_TO',
    failureRedirect: IAServiceProvider.getLoginUrl()
}));
```

Done! You now have your application working with I.A. authentication module.

## Integrate storage


```
╮（╯＿╰）╭
Under construction...
```
