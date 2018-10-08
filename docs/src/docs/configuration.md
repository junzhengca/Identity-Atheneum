# Configuration

## `identity_providers`

A list of IdPs to use.

### `local`

To define a local IdP, use the following template

```yaml
identity_providers:
  - type: local
    name: local_provider
    display_name: Local Identity Provider
```

* type: Should be `local`
* name: Unique name for the IdP
* display_name: Human-readable name for the IdP

### `saml`

To define a SAML IdP, use the following template

```yaml
identity_providers:
  - type: saml
    name: testshib
    display_name: TestShib
    config:
      callback_url: http://localhost:3000/idps/uoft_shibboleth/login
      entry_point: https://idp.testshib.org/idp/profile/SAML2/Redirect/SSO
      identifier_format: urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified
      issuer: my_issuer
      public_cert: keys/certificate.crt
      private_key: keys/mykey.key
      signature_algo: sha256
```

* type: Should be `saml`
* name: Unique name for the IdP
* display_name: Human-readable name for the IdP
* config
    * callback_url: This should always be `<host_root>/idps/<name>/login`
    * entry_point: SAML entry point
    * identifier_format: Format of the identifier, make sure your IdP support the format you are requesting.
    * issuer: Issuer name, you can just use a random name
    * public_cert: Public certificate path, this is used to sign the request
    * private_key: Private decryption key complementary to public certificate.
    * signature_algo: What algorithm to use when signing request, can be `sha1`, `sha256` or `sha512`.