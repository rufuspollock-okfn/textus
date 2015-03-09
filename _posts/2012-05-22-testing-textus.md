---
layout: post
title: Testing TEXTUS
date: 2012-05-22
---

![][1]

Yesterday, Goldsmiths University hosted the first TEXTUS user testing workshop. A small group of philosophy researchers, digital humanists and librarians gathered to probe the first BETA version of the platform.

The workshop focussed on three key functionalities of the system: **reading**, **importing** and **annotation**.

#### Reading

![][2]

The reading interface displaying Nietzsche's "Beyond Good and Evil" which was uploaded at the workshop

The reading experience in TEXTUS is currently very clean and simple, something that all participants liked. However, there were two improvements that people wanted to see in the reading experience:

* Longer pages
* The option changing the size of the font, something that would help the visually impaired

#### Importing

The demo of TEXTUS that we were using allowed for the upload of text files encoded in Wiki mark-up.&nbsp;Participants were asked to find a short philosophical text on either [Project Gutenberg][3] or [Wikisource][4] and copy it into a simple text editor. They were then shown how to mark-up a text using the Wikitext that the TEXTUS importer currently recognises.

It was evident from some of the feedback we got that a more functionalities were needed before importing texts into TEXTUS was as easy and intuitive as it could be.&nbsp;Below is a list of features that are currently under development, but the need for which was evident at the workshop:

* A preview function for texts being imported as plain text files – see [user story 15][5]
* A web-interface for doing structural and typographical mark-up for those who don't want to use Wiki mark-up see [user story 15][5]
* An importer that you can plug a Wikisource URL into and that can automatically pull the Wikitext in to – see [user story 15][5]

#### Annotation

Participants at the workshop were given four annotation tasks to test the annotation rendering and user interface. They were to:

* Give a brief summary of the text in a the form of an annotation
* Annotate the names of fictional and non-fictional characters within your text with information about them from Wikipedia
* Give definition of key philosophical vocabulary within your text as annotations
* Write a translation of three sentences from your text in another language you know

![][6]

Translation and explanation annotations on David Hume's "Of the Standard of Taste", another text that was uploaded at the workshop

Each of these tasks threw up interesting issues.

* TEXTUS currently uses a paginated view, how do you highlight and annotate sections of text that extend beyond a single page?
* If you are using TEXTUS to write collaborative translations it's important that the text box in which you write the translations is big enough to cope with and display clearly large chunks of text.
* TEXTUS currently has no way of dealing with footnotes. A question for the [humanities discussion list][7]: should TEXTUS treat them like annotations or should they display at the foot of the paginated view?

Not only did we get feedback on how our system is holding up from the technical side, but we got some further insights from the group on ways they might like to use annotations.

Four interesting ideas came out of discussions during the afternoon:

* A class of annotations for tagging themes in a text and that enables you to choose from the theme tags you've used previously – see [user story 14][8]
* A viewer for annotations that you have made that allows you to review and edit them – see [user story 11][9]
* An option for giving a "Thumbs up" or a "Thumbs down" for a given annotation – see [user story13][10]
* The ability to push an annotation or a quote to Twitter – see [user story 9][11]

### TEXTUS across multiple devices

![][12]

It was great to see a number of the participants trying TEXTUS out on different kinds of machine. One participant (above) had bought a touch-screen notepad which gave full reading functionality of texts and annotations.

You can't currently create annotations on a touch screen device, but it's something we're trying to work on now.

### Next steps and your chance to try TEXTUS out

In the next few days we will be getting the BETA version of TEXTUS we were using up online. So that you will all be able to try it out. To receive an invite for the BETA testing, please sign up [here][13].

The most up-to-date version of TEXTUS is of course available to download from the [GitHub repo][14].

[1]: http://okfnlabs.org/textus/images/TEXTUS-1.jpg "TEXTUS 1"
[2]: http://okfnlabs.org/textus/images/textus1.png "textus1"
[3]: http://www.gutenberg.org/
[4]: http://wikisource.org/
[5]: http://wiki.okfn.org/Projects/Textus/User_Stories/15
[6]: http://okfnlabs.org/textus/images/textus2-crop.png "textus2-crop"
[7]: http://lists.okfn.org/mailman/listinfo/open-humanities
[8]: http://wiki.okfn.org/Projects/Textus/User_Stories/14
[9]: http://wiki.okfn.org/Projects/Textus/User_Stories/11
[10]: http://wiki.okfn.org/Projects/Textus/User_Stories/13
[11]: http://wiki.okfn.org/Projects/Textus/User_Stories/9
[12]: http://okfnlabs.org/textus/images/TEXTUS-2.jpg "TEXTUS 2"
[13]: https://docs.google.com/spreadsheet/viewform?formkey=dEhSTy1rYk9pOFNzbTJZUmt5NDRJZEE6MQ
[14]: https://github.com/okfn/textus
  