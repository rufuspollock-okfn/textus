---
layout: post
title: Bibliographic References in Textus
date: 2012-06-21
---

[Textus](http://okfnlabs.org/textus/) is the OKFN’s open source platform for working with collections of texts. It harnesses the power of semantic web technologies and delivers them in a simple and intuitive interface so that students, researchers and teachers can share and collaborate around collections of texts.

Sites such as the upcoming [openphilosophy.org](http://openphilosophy.org/) and the existing [openshakespeare.org](http://openshakespeare.org/) contain collections of texts, annotated by their respective communities. Following some excellent conversations at the recent [openBiblio workshop and hack session](http://blog.okfn.org/2012/05/09/hackathon-alert-bibliohack/), we now have a plan to make these text repositories play nicely with the rest of the world.

Many thanks to all the participants at the openBiblio event for their comments and help, in particular to Peter Murray-Rust and Simone Fonda, and to the organisers for getting everyone into the same room.

![Textus](http://okfnlabs.org/textus/images/Capture1-1024x761.png)

## New features

Within the next few weeks, we’re hoping to add a whole load of new features to Textus, so you’ll be able to:

* Browse the texts in that instance, filtering by authors, dates etc.
* Create your own reading lists and control whether they’re publicly visible on your profile page or private. Items in these reading lists can be:
 * External references, added either completely manually by filling in all the details or through a search interface.
 * Entire texts or fragments of texts from within the Textus instance itself, allowing you to add very specific content to your reading list.
 * …or you can import the entire reading list from an uploaded file in BibJSON format.
* Add citations to your annotations. As with the reading list creation you can add entirely manually or through search, with the extra feature that you can search your own reading lists – this means you can create annotations which reference other regions of the same or other texts within the Textus instance.
* Export your reading lists as BibJSON for import into other tools and services.

## References in, references out

Currently annotations are free text comments, which may be attributable to a user or may be anonymous, but are rarely any richer than this. Annotations of this kind are valuable, but they lack solid backing. We’d like to allow our annotators to provide evidence through citations.

On the other side of things, we want to be able to reference texts or parts of texts held within a Textus installation from elsewhere, including hyperlinks directly into the reader interface such that when someone cites a fragment of a play in openshakespeare.org they can provide a link which opens that part of the play in a web browser along with any relevent annotations.

An interesting side effect of having a text in Textus is that citing any arbitrary part of that text becomes possible – traditionally it’s been difficult to create truly fine grained citations (down to the paragraph, sentence or even word level). We can do this trivially as Textus defines a coordinate system over each text and references refer to a contigious range of characters within this system. It will be interesting to see how tools which expect very coarse grained references (entire books, articles etc) cope with these much more precise citations, but that’s for the future…

## Tech and implementation

To integrate the functionality described above into Textus we’re going to be taking advantage of three existing projects.

* [BibJSON](http://bibjson.org/) provides a format to express bibliographic information.
* [BibServer](http://bibserver.org/) provides a set of APIs we can use to search external sources of reference and expose references from Textus (allowing Textus to act as a BibServer instance itself)
* [FacetView](http://okfnlabs.org/facetview/) provides a rich filtering and browsing interface embedded in the Textus website to allow navigation and display of collections. This depends on an ElasticSearch or SOLR instance with the data, happily we already use ElasticSearch as the data store for Textus.

So, there is one component we need to write (a sensible search UI across distributed BibServer instances, including the instance embedded within Textus) and a couple to integrate. There will certainly be glitches and things which aren’t as easy as we expect, but really thanks to the excellent work from these other projects we should be able to get a lot of functionality very quickly.