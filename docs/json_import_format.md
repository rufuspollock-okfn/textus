# Textus JSON Import Format and Textus Basic Profile

Version 1.0-DRAFT-INCOMPLETE

This document defines the format used when importing a new document into Textus. The document format is based on one or more files containing information in Javascript Object Notation (JSON) format. It is strongly recommended to use a JSON API to generate these files as JSON has specific quoting rules which are non-trivial to implement from scratch!

This document also defines the set of typographical classes, semantic annotation types and structural marker types that make up the Textus Basic Profile and which should be available to any text within a Textus based system. These sets may be extended by domain specific systems to include more specific concepts, those in the basic profile are intended to have general application across all subject domains.

## Text, Typography, Semantics & Structure

The Textus data model for a text consists of three kinds of metadata anchored by locations within a single immutable text. These four components have distinct roles:

+ Text contains visible characters and whitespace, but does not contain formatting information. It defines the coordinate system used for positions of annotations and structure markers, with the first character in the text being at position 0 (zero). When a range is defined between characters A and B the range will include all characters where the character index I satisfies (B > I >= A), that is to say start positions are inclusive and end positions exclusive - a character range [0,5] does not overlap with [5,6] and the range [5,5] is not meaningful (as it has no content)
+ Typography defines formatting to be applied to the text when rendering to a particular device. In the initial case this device is a web browser and the typography is defined in terms of CSS styles. Typographical annotations have a start position, end position and CSS style string. Typographical annotations may not overlap but may be contained within other typographical annotations - this limitation reflects the representation of the rendered HTML.
+ Semantics define any metadata which are not used when rendering the text to a display device. A semantic annotation also has a start and end position but whereas typographical annotations may not overlap there is no such restriction on semantic annotations. In addition to the location the semantic annotation defines a type and optionally an author and creation date - where omitted the interpretation is that the annotation was created during the text import and was the result of an automated process or script. Some annotation types may require additional information to be useful in which case the additional information is included as a payload property which must be an object and may contain any arbitrary information necessary for the particular type. Types are strings, and act as an extension point with a set of types defined by the Textus Basic Profile defined later in this document.
+ Structure is used to assist in navigation within the text. The structure is defined as a set of markers denoting structure start points; the end point is defined to be either the next highest position property of a node of the same depth or lower or the end of the document, whichever is smaller. Each node defines a type and a depth property where the type indicates the kind of structural boundary and the depth is used to allow partial structures. Nodes can contain a description and short display name, and may also include a set of semantic annotations which will be applied to the character range of the structure when imported.

The formats for each of these data types are defined later in this document, the Textus import tool accepts data in one or more distinct files and will merge the information from all files before further processing. Each import file must contain JSON of the form:

```javascript
{
	"text" : [ {
		"text" : "some text...",
		"sequence" : 0
	}, {
		"text" : "...more text",
		"sequence" : 1
	} ],
	"typography" : [ {
		"start" : 0,
		"end" : 4,
		"css" : "strong"
	}, {
		"start" : 0,
		"end" : 24,
		"css" : "everything"
	} ],
	"semantics" : [ {
		"start" : 0,
		"end" : 4,
		"type" : "textus:comment",
		"payload" : {
			"comment" : "This is a comment"
		}
	} ],
	"structure" : [ {
		"type" : "textus:document",
		"start" : 0,
		"depth" : 0,
		"description" : "A document we imported",
		"name" : "Document",
		"annotations" : [
			// (see example later, similar structure to semantic annotations)
		]
	}, {
		"type" : "textus:sentence",
		"start" : 0,
		"depth" : 1
	}, {
		"type" : "textus:sentence",
		"start" : 12,
		"depth" : 1
	} ]
}
```

Note - while the import specification does not include identifiers for semantic annotations such annotations are assigned unique URIs within textus and any export will expose these as an 'id' property.

Each of the text, typography, semantics and structure members are optional - it is possible to specify annotations outside the boundary of the text but this is not meaningful and such annotations will never be displayed. Text chunks are ordered by sequence property and joined during import, in almost all cases the textual data will be small enough to specify as a single block but the ability to split it into smaller chunks is there if this turns out not to be the case.

### Typographical annotations

The input JSON:

```javascript
{
	"text" : [ {
		"text" : "abcdefghij0123456789",
		"sequence" : 0
	} ],
	"typography" : [ {
		"start" : 0,
		"end" : 4,
		"css" : "strong"
	}, {
		"start" : 0,
		"end" : 20,
		"css" : "everything"
	} ]
}
```

will be translated to the following HTML:

```html
<span class="everything"><span class="strong">abcd</span>efghij0123456789</span>
```

Note again the that ranges are inclusive for the start and exclusive for the end, so the range [0,4] includes the character at index 0 but excludes the character at index 4.

Multiple CSS classes can be applied by specifying the css property as a whitespace seperated list of the classes to apply, exactly as you would when specifying a class property in HTML. The set of standard CSS classes available in the basic Textus installation is defined in the Textus Basic Profile later in this document.

### Semantic annotations

These are structured and interpreted similarly to typographical annotations with respect to start and end positions, but must contain a type property and may additionally contain a user specifier, date and / or payload used to specify further information:

```javascript
	"semantics" : [ {
		"start" : 3,
		"end" : 5,
		"type" : "textus:comment",
		"user" : "someone@textus.org",
		"date" : "2010-10-28T12:34Z",
		"payload" : {
			"comment" : "Here is my comment..."
		}
	} ]	
```

The user and date fields are optional - if omitted the interpretation is that the annotation was created by an automated tool or script during import and that the effective date is the date the text was received by Textus (this information is held internally within the system).

Where the date is specified it uses UTC time without seconds as defined by [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601), with the date part specified as YYYY-MM-DD (Americans and other wrong thinking minorities please take note!)

The payload property is also optional, although some annotation types may not be fully specified without it. Its contents are defined by the type property, in this example the type specifies a free text comment and the payload provides the comment text.

### Structure markers

While the structure is conceptually tree-shaped, you declare structure by indicating at which point a section starts - interpreting these assertions into a tree is done during the import process. Some side effects of this approach are

+ It is possible to have locations in the text which aren't within any declared structure.
+ Arbitrary nesting of structure is possible, for example while you may generally have a sub-section within a section within a chapter you can perfectly legally declare a sub-section within a chapter without any intervening section. While that particular example has an inherent heirarchy and suggests that this approach leads to errors there are structure types which don't have any degree of implicit containment or which may occur at various levels.

To determine which structure markers are active for a given location the following algorithm is used:

+For each possible value of the 'depth' property, find the structure marker with that depth which is immediately before the target position relative to others of that depth.
+For each of these, accept it if there are no interposing markers inbetween it and the target with a lower depth value.

For example, given the following list of structure markers the subsequent statements apply:

```javascript
	"a" : {"depth" : 0, "start" : 0  },
	"b" : {"depth" : 2, "start" : 4  },
	"c" : {"depth" : 1, "start" : 10 },
	"d" : {"depth" : 1, "start" : 25 },
	"e" : {"depth" : 2, "start" : 25 },
	"f" : {"depth" : 2, "start" : 30 }
```

The markers which apply at position 6 are [a,b] even though there is no marker of depth 1. At position 10 the markers which apply are [a,c] - marker b does not apply because marker c is inbetween it and the target position and has a lower or equal depth. In fact, marker a applies to any location within the text as there are no other depth 0 markers which can cancel it. At position 28 the markers which apply are [a,d,e] - marker e is valid as marker d is at the same position and therefore not considered to be 'inbetween' marker e and position 28.

Note that the above is not the representation for structure markers, and used only to illustrate the range handling! The format for a structure marker in the input JSON is as follows:

```javascript
	"structure" : [ {
		"type" : "textus:document",
		"start" : 0,
		"depth" : 0,
		"description" : "This document defines the json import specification",
		"name" : "Import Spec.",
		"annotations" : [ {	
			"type" : "textus:bibjson",
			"user" : "someone@textus.org",
			"date" : "2010-10-28T12:34Z",
			"payload" : {
				"title" : "TEXTUS JSON Import Specification",
				"type" : "article",
				"author" : [ {
					"name" : "Oinn, Tom" } ],
				"year" : "2012",
				"edition" : "first",
				"license" : [ {
					"type" : "copyheart",
					"url" : "http://copyheart.org/manifesto/",
					"description" : "A great license",
					"jurisdiction" : "universal" } ] } } ]   		
	}, {
		"type" : "textus:sentence",
		"start" : 0,
		"depth" : 1
	} ]
```

Any structure type may contain a description, a display-name and a set of annotations. These are all optional, and are interpreted as follows:

+ description - used in the UI when showing more information about a location
+ name - used in the UI when summarizing a location, for example in a breadcrumb trail like display.
+ annotations - an array of semantic annotations (see that section) without start and end points. The start and end points for the annotations are resolved in terms of the boundary of the associated piece of structure, but are then fixed in place once imported (that is to say they won't be moved around should the structure locations change).

## Textus Basic Profile

Semantic annotations and structure nodes contain a type member. Given the value of this field there may be an additional metadata payload required to fully specify the annotation or structure. While these are extensible and we expect different target domains to have differing requirements in this area there are some which are common to or useful for all kinds of texts - these types form the basic profile and are defined here.

### Typographical Classes

The base set of typographical classes correspond to the tag names of HTML elements, and will create the same effects. Styles available as part of this scheme are

+ Heading styles - h1,h2,h3,h4,h5
+ Paragraph formatting - p, blockquote, pre
+ Character formatting - b, i

### Semantic Annotation Types

Semantic annotations enrich the text with descriptions, provenance information, comments, links to related resources and similar. The basic profile includes the following annotation types:

#### BibJSON Metadata

If the type string is set to 'textus:bibjson' the payload member should contain a description of the referenced range using the tag names defined at the [BibJSON site](http://bibjson.org/). Because the annotation defines the character range (the subject of the metadata) we don't use the full BibJSON representation, we already have the subject and therefore have no need to reference it via a link or identifier. 

Note - in the future we may choose to expose these classes of annotations explicitly, in which case the appropriate URL for the referenced character range will be inserted into the surfaced annotations, but for now the context is implicit so we don't do this.

The format for the BibJSON payload is a list of sub-properties, all of which are optional, where the sub-property names are derived from the BibTeX tags for bibliographic information (see the [tag names](http://en.wikipedia.org/wiki/BibTeX#Bibliographic_information_file) on Wikipedia). For the corresponding value types see the BibJSON page, in general simple types such as year, month etc. are strings and all others are objects or lists of objects. A full annotation block describing a book might appear as an item in the 'semantics' list as follows:

```javascript
	"start" : 0,
	"end" : 3242342,
	"type" : "textus:bibjson",
	"user" : "someone@textus.org",
	"date" : "2010-10-28T12:34Z",
	"payload" : {
		"title" : "Alice in Wonderland",
		"type" : "book",
		"author" : [ {
			"name" : "Caroll, Lewis" } ],
		"year" : "1865",
		"edition" : "first",
		"license" : [ {
            "type" : "copyheart",
            "url" : "http://copyheart.org/manifesto/",
            "description" : "A great license",
            "jurisdiction" : "universal" } ]    		
	}
```

In a sense we're deferring responsibility for sensible metadata to the BibJSON project here, which is maybe not ideal, but the intent is to work with that project to pin down the allowable keys and their interpretation in slightly greater detail rather than inventing our own.

#### Free Text Comments

These are the simplest annotation, consisting of a free-form comment from a user:

```javascript
	"start" : 300,
	"end" : 320,
	"type" : "textus:comment",
	"user" : "someone@textus.org",
	"date" : "2010-10-28T12:34Z",
	"payload" : {
		"lang" : "en"
		"text" : "Those twenty characters really blow me away, man..." 		
	}
```

The optional 'lang' property in the payload can be used to specify the [ISO 939-2 code](http://www.loc.gov/standards/iso639-2/php/code_list.php) for the language of the comment. If omitted the default is to assume a comment in English, so the above example is not actually necessary (there is no distinction in that particular ISO standard between British and American English, for example, but I doubt that's something we have to worry about).

#### Source

Used to indicate the provenance of a particular section of text, including links out to scanned images or other textual representations.

```javascript
	"start" : 0,
	"end" : 3095,
	"type" : "textus:source",
	"user" : "someone@textus.org",
	"date" : "2010-10-28T12:34Z",
	"payload" : {
		"type" : "textus:scanned-image",
		"url" : "http://my.transcription.site/texts/mytext/pages/1.html",
		"data-url" : "http://my.transcription.site/texts/mytext/pages/1/image.png" 		
	}
```

The 'url' property is a web page which contains the source, whether directly or indirectly. There is no expecation that automated processing can do anything with the resource at this location, for example we don't expect to be able to automatically infer the image URL for a scanned image, but it acts as a target for a 'more details' link within the reader. It may also be the only option for resources which disallow deep links into their actual content or for where there is no valid URL for the granularity of data we want (for example we might have an annotation on the entire text linking to the top level page for a transcription service in cases where the service doesn't allow for links to individual pages of a transcribed book).

The 'type' can be either of the following, and influences the interpretation of the optional 'data-url':

+ textus:scanned-image : The data-url, if present, references an image resource containing a scan or photograph of a physical book, manuscript etc from which the annotated text is transcribed. The data-url should reference a resource with MIME type image/*.
+ textus:audio : The data-url, if present, references an audio resource from which the annotated text has been transcribed. The data-url should reference a resource with MIME type audio/*.

This set may be expanded in the future.

#### Scene

Scenes are entities within a dramatic text distinguished by a place, a time and a set of actors (in the 'things which cause effects' rather than 'people wearing costumes' sense). All properties are free text, to make these annotations meaningful care should be taken to sensibly normalise e.g. names of characters such that a free text comparison works at a semantic level.

```javascript
	"type" : "textus:scene",
	"payload" : {
		"name" : "Scene III", // Optional - indices within parent used if absent
		"place" : "A spooky wood",
		"time" : "Just before midnight",
		"actors" : [
			"Frightened rabbit",
			"Scarecrow" ] }
```

#### Letter

Letters have an author or authors, a date and a recipient or set of recipients. They may also have a title which can be used as a name when displaying the marker but do not require such - when there is no title a marker of this kind should be displayed using the author, recipient and date fields. Dates are represented as YYYY-MM-DD, with the optional 'date-name' property used when this should be overridden for display purposes (we keep a formal date representation to simplify querying by date range).

```javascript
	"type" : "textus:letter",
	"payload" : {
		"title" : "On Being Liberated from the Bastille", // Optional - title inferred from other fields if absent
		"authors" : [ "Voltaire" ],
		"recipients" : [ "the Lieutenant of Police" ],
		"date" : "1718-04-05",
		"date-name" : "Good Friday, April 5, 1718" }
```

### Structure Marker Types

Structure markers overlap to a degree with semantic annotations, in the both are used to interpret the text to which they apply. Markers may also contain inlined semantic annotations, some of which will be particularly appropriate (i.e. the textus:letter marker containing the letter semantic annotation described above).

+ textus:front : A preface or prologue to the main content of the text
+ textus:back : An epilogue, appendix or similar
+ textus:body : The primary content of the text
+ textus:book : A book, the precise definition of which is somewhat ambiguous (for example some physical books have multiple 'books' within them, most notably the bible)
+ textus:chapter : A chapter (prose)
+ textus:section : A section (prose)
+ textus:part : A part or sub-section (prose)
+ textus:canto : Used for verse
+ textus:act : Used for dramatic texts
+ textus:stanza (verse)
+ textus:paragraph (all)
+ textus:scene : A scene in a dramatic work, use in conjunction with the scene semantic metadata block.
+ textus:letter : A single piece of correspondance, use in conjunction with the letter semantic metadata block.
