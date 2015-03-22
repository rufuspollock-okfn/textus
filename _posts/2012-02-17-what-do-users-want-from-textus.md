---
layout: post
title: What Do Users Want from TEXTUS?
date: 2012-02-17
author: Sam Leon
---

![][1]

Yesterday morning a small group of graduate students from Goldsmiths University made their way up from New Cross to join myself and lead developer Tom Oinn for our first user requirements workshop for [OpenPhilosophy.org][2] – the site that is to be the be the first instance of the generic TEXTUS platform.

The key question we sought to answer was: what do students and scholars who will be using OpenPhilosophy.org really want to get out of it?

## The nuts and bolts

To kick things off Tom gave a short presentation on the TEXTUS platform and its key features including an overview of the underlying data management system and the nuts and bolts of the sharing and annotation functions:

One of the core features of the system will be that locations within texts are specified by character ranges. At bottom a text is treated as a series of characters. Typographical or structural features of the text reside as metadata about character ranges. Some of this might could be automatically harvested from texts taken from online archives such as Wikisource, but generally speaking some metadata would need to be input by the users of TEXTUS.

Metadata such as the author of the work would apply to the complete range of characters in the text, from start to finish, say 0-989676. The structural metadata that defined where Chapter 3 was within that text would apply to a range within the whole text, say characters 22367-34639. On this model annotations of the text would also be a class of metadata that referred to some specific range of characters.

Each class of metadata would be handled differently. Structural and typographical metadata would effect the way a document was rendered, while free text annotations would be visible alongside the text itself when you were reading it.

## Breaking up the text and typographical issues

During the first session, we got the group to work with sections of printed philosophy texts, asking them to mark the key structural elements of those texts. Amongst other things we worked with photocopies of [Nietzsche's _The Gay Science_][3] which included passages of prose, aphorism and verse.1

The basic units of structure that the group picked out would enable us to represent and display documents in the way that users wanted.

Knowing the basic units of structure that users wanted would also enable us to build hyperlinked tables of contents for texts. With this information the system would be able to translate character ranges into more meaningful information for the user. A citation that referred to a character range would be capable of being converted into a reference format that employed this basic units of structure. A reference to character range 4501-4557 could become Book I, Section V, Sub-section 13.

There were certain structural features of the texts that were uncontroversial. If the original text was broken up into books, chapters and sections, for instance, everyone was agreed that metadata needed to be added to the plain text to specify which character ranges corresponded to these basic units.

A number of issues were raised in the discussion that took place around the text:

* Should a numbered aphorism be a unit of structure within the documents?
* Should a line of verse be allowed to flow over more lines than it does in the original document?
* Should footnotes by the author or editor appear as annotations of the text or parts of the text itself?
* Should italics, bolding or other typographical features be retained?

The resounding conclusion was that as much structural and typographical information about the original document should be retained as possible. The importance of typographical features such as bolding of titles and sub-titles was highlighted as being something that helped users to skim read texts and was therefore essential to retain if people were to read texts on TEXTUS just as they did printed books.

In order to avoid having lots of spurious underlining, typographical editing would be reserved to an individual or group who was 'managing' the upload of the text to TEXTUS. The same would be true of structural metadata where there would also be an interest in controlling who could make edits.

In order to make the process of adding typography and structure to the underlying character ranges easier, there will be a standard set of typographical and structural metadata options that a given user can pick when working with a section of text.

## New ideas for functionality

During the second session we showed the group the [user stories we had already drafted][4] and gave them the opportunity to add stories that captured how they could imagine using the system.

The stories the group came up with were:

1. I want to be able to cite other users' annotations;
2. I want to be able to translate sections of the text through using annotations;
3. I want to be able to see information on the intellectual tradition into which a text falls;
4. I want to edit, modify or delete an annotation;
5. I want to compare an original language text with a translated edition;
6. I want to be able to tag an annotation as 'not to be quoted' or 'provisional';
7. I want to be able to include hyperlinks in my annotations;
8. I want to be able to integrate TEXTUS with Endnote or other bibliography management tools;
9. I want to be able to add my own openly licensed publications and lecture notes to TEXTUS.

Some of these stories hold significant challenges. The ability to delete your own annotation (4), for instance, would be difficult to implement without compromising on one of TEXTUS's key functions, the ability to site _stable_ URL for any given section of texts and the associated annotations. Allowing users to delete their own annotations would inevitably lead to the existence of dead links that direct to annotations that are no longer there.

One fix that we envisaged for this was rather than allowing URLs that went to deleted annotations to become dead links, they would become links to the annotated part of the text but with a notice that acknowledged that there was once an annotation there but that it had now been removed.

The idea that annotations could be highlighted as 'provisional' (6) implies that the annotation itself has implicit data and metadata parts – the data part being the immutable entity referenced by an identifier when citing, and the metadata referring to transient properties such as whether the annotation is approved for citation.

## New source material

Towards the end of the morning, and well into our third round of tea, we embarked on adding to the already large list of source material that will be the first to enter TEXTUS and be featured on OpenPhilosophy.org. Do remember to keep adding your favorite public domain philosophy texts to the [spreadsheet][5]!

## What next?

In the coming weeks we will be working on interface mock-ups for OpenPhilosophy.org and running more workshops to get feedback on these. We will make sure all work done on this front is posted on this blog, so that those unable to participate in the workshops can take part.

If you would like to be involved in user testing when the platform is ready, request an invite [here][6].

[1]: http://okfnlabs.org/textus/images/IMG_0255-1024x764.jpg "IMG_0255"
[2]: http://openphilosophy.org
[3]: http://www.flickr.com/photos/okfn/sets/72157629346578571
[4]: http://wiki.okfn.org/Projects/Textus
[5]: https://docs.google.com/spreadsheet/ccc?key=0Ams8fpz2_77XdHNMeVB4SGsxMi1nQUFneHFKX2l4T2c#gid=0
[6]: https://docs.google.com/spreadsheet/viewform?formkey=dEhSTy1rYk9pOFNzbTJZUmt5NDRJZEE6MQ