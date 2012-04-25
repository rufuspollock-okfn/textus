# Textus JSON Import Format and Textus Basic Profile

Version 1.0-DRAFT-INCOMPLETE

This document defines the format used when importing a new document into Textus. The document format is based on one or more files containing information in Javascript Object Notation (JSON) format. It is strongly recommended to use a JSON API to generate these files as JSON has specific quoting rules which are non-trivial to implement from scratch!

This document also defines the set of typographical classes, semantic annotation types and structural marker types that make up the Textus Basic Profile and which should be available to any text within a Textus based system. These sets may be extended by domain specific systems to include more specific concepts, those in the basic profile are intended to have general application across all subject domains.

## Text, Typography, Semantics & Structure

The Textus data model for a text consists of three kinds of metadata anchored by locations within a single immutable text. These four components have distinct roles:

+ Text contains visible characters and whitespace, but does not contain formatting information. It defines the coordinate system used for positions of annotations and structure markers, with the first character in the text being at position 0 (zero). When a range is defined between characters A and B the range will include all characters where the character index I satisfies (B > I >= A), that is to say start positions are inclusive and end positions exclusive - a character range [0,5] does not overlap with [5,6] and the range [5,5] is not meaningful (as it has no content)
+ Typography defines formatting to be applied to the text when rendering to a particular device. In the initial case this device is a web browser and the typography is defined in terms of CSS styles. Typographical annotations have a start position, end position and CSS style string. Typographical annotations may not overlap but may be contained within other typographical annotations - this limitation reflects the representation of the rendered HTML.
+ Semantics define any metadata which are not used when rendering the text to a display device. A semantic annotation also has a start and end position but whereas typographical annotations may not overlap there is no such restriction on semantic annotations. In addition to the location the semantic annotation defines a type and optionally an author and creation date - where omitted the interpretation is that the annotation was created during the text import and was the result of an automated process or script. Some annotation types may require additional information to be useful in which case the additional information is included as a payload property which must be an object and may contain any arbitrary information necessary for the particular type. Types are strings, and act as an extension point with a set of types defined by the Textus Basic Profile defined later in this document.
+ Structure is used to assist in navigation within the text. The structure is defined as a set of markers denoting structure start points; the end point is defined to be either the next highest position property of a node of the same depth or lower or the end of the document, whichever is smaller. Each node defines a type and a depth property where the type indicates the kind of structural boundary and the depth is used to allow partial structures. Nodes can also contain a metadata payload where the type requires it - types are extensible but an initial set is defined in the Textus Basic Profile defined later in this document.

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
		"payload" : {
			"heading" : "Some random document"
		}
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
		"payload" : {
			"heading" : "Some random document"
		}
	}, {
		"type" : "textus:sentence",
		"start" : 0,
		"depth" : 1
	} ]
```

The payload property is optional but may be required to correctly interpret the structure marker (for example, to render it in the 'current location' display) based on the type. The set of available marker types and their required payload metadata is defined in the Textus Basic Profile.

## Textus Basic Profile

Semantic annotations and structure nodes contain a type member. Given the value of this field there may be an additional metadata payload required to fully specify the annotation or structure. While these are extensible and we expect different target domains to have differing requirements in this area there are some which are common to or useful for all kinds of texts - these types form the basic profile and are defined here.

### Typographical Classes

The base set of typographical classes correspond to the tag names of HTML elements, and will create the same effects. Styles available as part of this scheme are

+ Heading styles - h1,h2,h3,h4,h5
+ Paragraph formatting - p, blockquote, pre
+ Character formatting - b, i

### Semantic Annotation Types

TODO - probably derive most of these from http://dtd.nlm.nih.gov/book/tag-library/

### Structure Marker Types

TODO 