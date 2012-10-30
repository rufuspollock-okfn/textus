# TEXTUS API Documentation

## Texts and annotations

### GET /api/text/:textId/:start/:end

GET requests for text and annotation data.

For example:

<http://beta.openphilosophy.org/api/text/_YssDZ_ZQiGNAuOiuQzAZg/500/510>

### GET /api/completeText/:textId

GET request for complete text and syntactic metadata only.

For example:

<http://beta.openphilosophy.org/api/completeText/_YssDZ_ZQiGNAuOiuQzAZg>

### POST /api/upload

POST to /api/upload to upload a text into the session ready for review. Redirects to /#review activity on the client which can then use the /api/review GET method to return the parsed data and any error messages.

### GET /api/upload/review

Retrieves a previously stored parsed upload, returned as JSON of the form { data : <parsed-data-object | null>, error : string | null }. If the error property is non-null the client should display the error message in some fashion.

### POST /api/upload/review

Act on the review, accepts JSON body with { accept : boolean, title : string }. If accept is 'true' then the data is sent to the data store for storage. The response message is of the form { textId : string, error : string } where one of textId or error will be null. The client may use this message to jump directly to the reader UI for the uploaded text. If 'accept' is set to false this simply removes the file data from the session object and sends a blank response message.

### POST /api/semantics

POST to create new semantic annotation.

### POST /api/semantics/:annotationId

POST new annotation data to update or delete an annotation. Set visibility to 'delete' on the updated annotation to remove it from the store. Sends {success : bool, error : string} back on completion.

## Metadata

### GET /api/meta/:textId

Retrieve the metadata for the specified text, metadata specified as { title : string, markers : { int -> marker }, owners : [string] }

For example:

<http://beta.openphilosophy.org/api/meta/_YssDZ_ZQiGNAuOiuQzAZg>

### POST /api/meta/:textId

Update the text metadata for the specified text ID. Metadata is specified as { title : string, markers : { int -> marker }, owners : [string] }. Call will fail if the current metadata doesn't have the current user as one of the owners. Returns { err : string | null, message : string } to the callback. As a side effect this should trigger re-creation of the publicly visible BibJSON fragments, if any, which represent this text in the 'all texts' view and the exposed BibServer query API.

@TODO - should check that at least one owner exists within Textus, but as we can't currently remove people from projects through the UI this isn't a major issue.

### GET /api/uploads

Retrieve text metadata descriptions of the form { textId : string -> { title : string, owners : [string] }}

