# Text Rendering

Textus displays texts and annotations to the user one screen at a time. This is partly to fit with how people are used to reading and partly to avoid having to retrieve all annotations for a text in one go. This is subject to change - if we trial this with users and they all hate it we can try to work with loading the entire text and only rendering annotation markers etc on the currently visible viewport, but at the present this is how everything fits together:

## Initiation

The user expresses an intent to display a portion of a text, the input to this process is the unique identifier of the text and an offset which is treated as either the first or last character to make visible on the page. We need to be able to specify that the offset is the last character to handle cases where the user requests the previous screen full of text - at that point we don't know what the first character will be as this will depend on the available screen space into which we can render the text.

## Retrieval and Markup Generation

The client requests text chunks and corresponding typographical annotations from the server for a fixed number of characters either beyond or before the specified offset depending on how the offset is to be interpreted. It then renders this retrieved text and annotation set into markup in a hidden container in order to measure the height when rendered in the browser. If the height is less than the available space it requests more text and typographical annotations until the space is exceeded.

Once at least a screen of text has been retrieved the client recursively trims it down until it fits exactly on the available space. At this point semantic annotations for the resultant character range are retrieved and a final rendering pass is made to insert empty marker spans into the markup corresponding to the start and end points of those semantic annotations. Once this is done the result is injected into the text container within the UI; at this point all typographical annotations will have been used to produce (nested) spans with appropriate styles applied through CSS classes defined by the annotations.

## Semantic Annotation Rendering

At present no filtering is applied to the set of semantic annotations, in the full system the following steps will work off a sub-set of the semantic annotations intersecting the visible character range subject to filtering settings of a logged-in user.

Annotation locations are indicated by painting semi-transparent rectangles onto a HTML5 Canvas element floating above the text. The coordinates for these locations are calculated by requesting the location of the empty annotation start and end spans for each annotation.

## Handling of Window Resizing

When the window resizes the browser will automatically re-flow text to fill the available width. This does two things - firstly it means all the annotation locations have to be re-drawn, and secondly we may need to either trim or retrieve more text to fill the enlarged or reduced space available. Re-rendering the canvas is done on every resize event, but text re-rendering is only done when the resize is completed (indicated by no resize events within x milliseconds, probably 500).