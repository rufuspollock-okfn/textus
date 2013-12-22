# TEXTUS API Documentation

## Texts and annotations

### GET /api/text/:textId/:start/:end

GET requests for text and annotation data.

For example:

Machiavelli - the Prince <http://beta.openphilosophy.org/api/text/X4-FN2J9T4GzvVWppea7KA/0/2048>

```json

{
  "textId": "X4-FN2J9T4GzvVWppea7KA",
  "text": "THE PRINCE by Niccolò Machiavelli (translated by William K. Marriott)DEDICATIONTo the Magnificent Lorenzo Di Piero De' Medici:Those who strive to obtain the good graces of a prince are      accustomed to come before him with such things as they hold most      precious, or in which they see him take most delight; whence one      often sees horses, arms, cloth of gold, precious stones, and      similar ornaments presented to princes, worthy of their greatness.Desiring therefore to present myself to your Magnificence with      some testimony of my devotion towards you, I have not found among      my possessions anything which I hold more dear than, or value so      much as, the knowledge of the actions of great men, acquired by      long experience in contemporary affairs, and a continual study of      antiquity; which, having reflected upon it with great and      prolonged diligence, I now send, digested into a little volume, to      your Magnificence.And although I may consider this work unworthy of your      countenance, nevertheless I trust much to your benignity that it      may be acceptable, seeing that it is not possible for me to make a      better gift than to offer you the opportunity of understanding in      the shortest time all that I have learnt in so many years, and      with so many troubles and dangers; which work I have not      embellished with swelling or magnificent words, nor stuffed with      rounded periods, nor with any extrinsic allurements or adornments      whatever, with which so many are accustomed to embellish their      works; for I have wished either that no honour should be given it,      or else that the truth of the matter and the weightiness of the      theme shall make it acceptable.Nor do I hold with those who regard it as a presumption if a man      of low and humble condition dare to discuss and settle the      concerns of princes; because, just as those who draw landscapes      place themselves below in the plain to contemplate the nature of      the mountains and of lofty ",
  "typography": [
    {
      "start": 0,
      "end": 69,
      "css": "h1",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "EfEca0IdRySDwizOUm3a-g"
    },
    {
      "start": 69,
      "end": 79,
      "css": "h2",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "NawW1V2aTMGJlW32pakxkg"
    },
    {
      "start": 79,
      "end": 126,
      "css": "p",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "lIOwlDyGRLCol-wGdR_r3A"
    },
    {
      "start": 126,
      "end": 462,
      "css": "p",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "AsV9YQeHQbuMfuOktxVm1g"
    },
    {
      "start": 462,
      "end": 964,
      "css": "p",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "IuWNsOTAQHiazg0tXW13Ig"
    },
    {
      "start": 964,
      "end": 1748,
      "css": "p",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "bgcVyAfwTMS0yKPyjqAhaA"
    },
    {
      "start": 1748,
      "end": 2283,
      "css": "p",
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "id": "dW38T6nETJ-yft5aTjutTQ"
    }
  ],
  "semantics": [
    {
      "user": "alexandreubaldo@gmail.com",
      "type": "textus:comment",
      "payload": {
        "text": "Testando esse sistema."
      },
      "start": 1384,
      "end": 1452,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "MGZD3s8YQBOw-t8WuFJV5w",
      "dynamic": {
        "colour": "rgba(151,8,158,0.2)",
        "displayName": "Alexandre Ubaldo"
      }
    },
    {
      "user": "andrew@finalsclub.org",
      "type": "textus:comment",
      "payload": {
        "text": "Test annotation to see how this works.  I like the interface generally.  "
      },
      "start": 1787,
      "end": 2283,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "mKdag9JIQLWglmIeSEjjyw",
      "dynamic": {
        "colour": "rgba(168,191,113,0.2)",
        "displayName": "Andrew Magliozzi"
      }
    },
    {
      "user": "prasoon.sharma@systematixindia.com",
      "type": "textus:comment",
      "payload": {
        "text": "hello"
      },
      "start": 1836,
      "end": 1845,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "hH19PdkXSh-UhBBtKXQlFQ",
      "dynamic": {
        "colour": "rgba(120,226,83,0.2)"
      }
    },
    {
      "user": "prasoon.sharma@systematixindia.com",
      "type": "textus:comment",
      "payload": {
        "text": "Lovely"
      },
      "start": 390,
      "end": 461,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "-3oHuChsRbGHmOmcTZiLTw",
      "dynamic": {
        "colour": "rgba(120,226,83,0.2)"
      }
    },
    {
      "user": "wilcut.matthew@gmail.com",
      "type": "textus:comment",
      "payload": {
        "text": "Test"
      },
      "start": 181,
      "end": 383,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "Gfu-5nDtSliBGWS5DcGthw",
      "dynamic": {
        "colour": "rgba(40,255,44,0.2)",
        "displayName": "GenAssem"
      }
    },
    {
      "user": "danieldesposito@huridocs.org",
      "type": "textus:tag",
      "payload": {
        "name": "ping",
        "value": "man this is cool"
      },
      "start": 462,
      "end": 964,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "provisional",
      "id": "JbCV9fAXRAuoCbWPeU8cdQ",
      "dynamic": {
        "colour": "rgba(223,139,36,0.2)"
      }
    },
    {
      "user": "danieldesposito@huridocs.org",
      "type": "textus:comment",
      "payload": {
        "text": "oh lala j'aime bien ca"
      },
      "start": 964,
      "end": 1255,
      "textId": "X4-FN2J9T4GzvVWppea7KA",
      "visibility": "final",
      "id": "op6nkVcDR7S20L1nLpEM3Q",
      "dynamic": {
        "colour": "rgba(223,139,36,0.2)"
      }
    }
  ],
  "start": 0,
  "end": 2048
}
```

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

