# Textus Architecture

This document gives an overview of how we're building Textus along with some of the motivation for the decisions we've taken.

## Technology Choices 

### Implementation Language

Textus is implemented in Javascript both on the client and server. This has advantages and disadvantages - we're using it because of the following:

+ Web browsers use Javascript internally so it's one of the few options available for rich client applications targetting the web.
+ The rest of the OKFN projects are using it so there's already a pool of expertise within the organization.
+ It's not particularly hard to find Javascript programmers, a critical consideration for the long term future of the project.
+ It is possible to use the same language on both server and client components, simplifying sharing of data models and reducing the number of distinct skills required to contribute to the project.
+ Javascript is, at its core, a reasonably good language in terms of features.
+ JQuery makes the browser a semi-usable runtime environment.

We're using it in spite of the following issues:

+ As a server-side language Javascript doesn't provide the same solidity as e.g. Java. Aspects such as scalability, monitoring, caching etc are less mature.
+ Directly coding against browsers rather than using a higher level abstraction implies dodging the various browser specific issues. We're mitigating this by only targetting very modern browsers but it's still a potential issue which toolkits such as Google Web Toolkit (cross-compile from Java to Javascript) avoid.
+ Outside of its reasonably pleasant core subset Javascript is full of hideous crimes against sensible langauge design. We hope to avoid waking any of these, but sometimes they're unavoidable.

Overall the consensus is that the positives outweigh the negatives.

### 3rd Party Libraries

Javascript has a decent base of 3rd party libraries and frameworks to help write systems like Textus, we're using several of these as well as the ElasticSearch database / query engine.

+ [Node.js](http://nodejs.org/) is used to run the Textus server code.
+ The [Express](http://expressjs.com/) library provides HTTP server functionality within the Node.js hosted code.
+ [ElasticSearch](http://www.elasticsearch.org/) is used as the repository and indexing system for texts and annotations with the [Elastical](https://github.com/rgrove/node-elastical) module used to connect to it from the Node.js hosted code.

On the client we're making use of a fairly conventional set of external libraries:

+ [JQuery](http://jquery.com/) helps reduce some of the pain implicit in interacting with the browser's DOM.
+ [Backbone](http://documentcloud.github.com/backbone/) provides support for URL histories, data models and modular views.
+ [Underscore](http://documentcloud.github.com/underscore/) is a dependency of Backbone but is also used directly within Textus for various utility functions.
+ [RequireJS](http://requirejs.org/) provides code modularity through it's asynchronous module declaration support.

### Use of OKFN Annotator

After discussion with Nick Stenning we concluded that we were unlikely to be able to make use of [Annotator](http://okfn.org/projects/annotator/) directly but would keep it in mind and make sure that any development work could feed back into that project where applicable. Annotator solves a different (and arguably harder) problem than Textus in that it has to cope with annotations applied to any arbitrary piece of content on the internet, whereas because we control how Textus renders its content we can simply ensure that we a suitably helpful model in the first place.

Work on Textus' rendering engine is already feeding through to Annotator.

## High Level Architecture

Textus is a typical modern rich client web application. The user interface is hosted within a web browser and interacts with data stored on the server through RESTfull HTTP calls. The server receives these calls, interprets and acts on them to store or retrieve information from an ElasticSearch based data store. Where users need to be authenticated (any creation of new entities on the server requires authentication, retrieval may not) we are using our own user database rather than federating with e.g. Google or Facebook for identity provision. This seems the simplest mechanism given we'd have to store per-user data in any case.

## Text and Annotations

Texts in Textus are considered to be immutable. When referring to a 'text' in this context we are describing the stream of characters which make up the words in the transcribed version of an original manuscript, book, scroll, cave painting etc rather than the original physical form. For this purpose different editions of a book are distinct texts, as are e.g. translations or any other similar external operation.

Annotations are any piece of information about a contigious range of characters within a text; this includes the top level bibliographic information (title, author or authors, printing information, edition etc), the way in which the text should be rendered to the screen (paragraph and line breaks, formatting, font weights etc) and any comments, links or other metadata whether manually added by users of Textus or automatically harvested. While users will consider these to be substantially different things, and the UI must behave as if they are, the underlying storage and data model on the server is very similar in all cases.

For rendering purposes we divide annotations into two classes with slightly different rules for validity and different permission models:

+ Typographical annotations define formatting, including font choice, boldface and italics, paragraph breaks, indentation and any other property which is used to describe how the text should appear. These annotations will not generally be created by users other than those 'owning' a text, and in fact most will be created automatically when the text is imported. In addition, while they may nest they may not partially intersect. This is because they will be rendered out as span elements in the HTML and the behaviour of intersecting styles would be poorly defined at best.
+ Semantic annotations enrich the meaning of the text regions to which they pertain by providing additional information about those regions. These will include automatically harvested information such as the original pagination, links to scanned images of the physical text where applicable and top level bibliographic information. Most fundamentally to the aim of Textus they will also include user generated annotations, the types of which will vary based on the user communities involved but which will always include free text comments. User generated annotations in addition capture the identity of the user who created the annotation along with various other book-keeping properties such as timestamps and basic permission flags indicating whether the annotation is visible to anyone other than that particular user.

### Representation

The combination of Javascript on the client, Node.js as the server implementation and ElasticSearch as the data store leads to JSON (JavaScript Object Notation) as the most natural representation for both texts and annotations.

Texts are stored as chunks of JSON. Each chunk consists of a JSON structure containing {textid:string, offset:int, text:string} members, with 'textid' being a unique identifier for this particular text, 'offset' the number of characters into the text at which this chunk starts (so for the first chunk in any text this will be 0) and 'text' containing the text for that chunk. The exact amount of text held in each chunk is yet to be determined, the optimal quantity will be one which balances out the desire to make small numbers of requests for data when rendering a page with the desire to not retrieve and transmit more data than is actually needed.

The text content of each chunk currently consists of the input text stripped of all formatting information such as line breaks. This is primarily to avoid ambiguous positions for annotations - this formatting is held instead in typographical annotations.

Annotations are also stored as JSON, with each annotation held as a single JSON structure of the form {textid:string, annotationid:string, start:int, end:int, type:string ...} with other members dependent on the annotation type. The 'textid' and 'annotationid' are identifiers for the text to which this annotation applies and the annotation itself, and the 'start' and 'end' offsets define the region within that text to which the annotation applies. For typographical annotations the 'type' field can be optional when returned on the wire although it will always be set to the typographical annotation type in the underlying data store (subject to this being the most efficient way to do things!).

#### Side-car Annotations

We have decided to use immutable texts along with annotations indexed into those texts. This is obviously at odds with the way pretty much the entire internet provides text, as well as almost all word processors and document editing tools - these almost invariably include their markup within the text stream itself so why aren't we doing that?

+ Primarily because we need a well defined coordinate system for annotations. When a user says 'that bit of text' we need a well defined way to identify 'that bit', to store the user's annotation, to render it etc. Critically this should be stable - if we were to inline annotation information within the text itself the task of identifying a piece of text uniquely is complicated by potential changes in the text over time. By using an immutable underlying text and a simple linear coordinate system we can side-step what would otherwise be a rather intractable problem. 
+ Users searching the text expect to be searching the words in the text, and not words within bits of markup! By explicitly separating the text and annotations we can make use of the search infrastructure of ElasticSearch and simply run it on the 'text' part of each text chunk without having to maintain a distinct searchable version of the text sans markup.
+ For semantic markup, inlining the annotations would bring up questions to do with how to cope with overlapping annotations (and almost all annotations do overlap because we have some which apply to entire texts or large sections thereof).

Overall the motivation is that the underlying text doesn't change whereas the annotations do, so holding the two apart allows us to use techniques best suited for immutable data on the underlying text and those suited for fine grained mutability on the annotations. In addition there are two possibilities this approach opens up for the future direction of Textus:

+ We could move to a model with federated annotation stores. There's no inherent coupling between the annotations and the text to which they pertain other than the text identifier in the annotations. This could be similar to the DAS (Distributed Annotation System) used in bioinformatics to allow multiple groups to host their own sets of annotations on a common genome or similar.
+ We could move to referencing texts held elsewhere rather than importing and warehousing them ourselves, moving towards being a provider of annotation and visualization rather than a provider of the text content. This would open up potential collaborations with publishers who might be reluctant to allow the actual text to be copied wholesale into an external system but who may be interested in allowing the kind of distrubed annotation effort Textus facilitates.