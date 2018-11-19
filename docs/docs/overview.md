# Overview

## So... what is Identity Atheneum?

Identity Atheneum is a Node.js application that serves 2 purposes:

* Exposes an unified OAuth API, abstract away other auth details.
* Allows applications to save and retrieve shared information using REST API calls.

## Data Managed By I.A.

!!! warning
    You can still manage those information within your application, however that defeats the purpose. Please refactor your app so it only retrieves these information from I.A.

* Users
    * Username, email address, ID, and any attributes associated.
* Courses
    * Course name, content, tutorials, students, TAs, instructors.
* Tutorials
    * Tutoral name, content, students, TAs, instructors.