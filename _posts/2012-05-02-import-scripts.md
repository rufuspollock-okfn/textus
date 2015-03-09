---
layout: post
title: Import scripts
date: 2012-05-02
---

![][1]

One of our top priorities for TEXTUS is making sure that you can import a text from a number of sources with a minimum of fuss. In order to do this we need to start writing import scripts for all these sources.

We've already identified two key sources for our texts:

* [Wikisource][5]
* [Project Gutenberg][6]

But there are a whole host of others we wish to support as well, including:

* [Perseus Digital Library][7]
* [The Internet Archive][8]

We will be writing import scripts for Wikisource and Project Gutenberg in the coming weeks, a tricky business given that there is not a huge degree of consistency in they way in which these texts are marked up.

Very high on our feature wish-list list is the ability to import from [TEI formatted][2] documents. TEI is an XML based format that has been used widely to encode documents in the humanities for use in teaching and research since the early 90s. In the coming weeks we will also be a developing import scripts for import from TEI looking at the subset of tags that apply specifically to typographical and structural mark-up.

Beyond import from Wikisource, Project Gutenberg and TEI documents — we also want to empower the community who have relevant philosophical texts in diverse formats to develop their own import scripts. This is why we've now written documentation for about the TEXTUS JSON import format which you can find [here][3].

**If you have any public domain digitsed philosophy texts that you would like to get into our first instance of TEXTUS on openphilosophy.org drop us a line on&nbsp;[humanities developer list][4], so that we can assist you in writing your import script.**

[1]: http://okfnlabs.org/textus/images/g24561.png "g2456"
[2]: http://www.tei-c.org/index.xml
[3]: https://github.com/okfn/textus/blob/master/docs/json_import_format.md
[4]: http://lists.okfn.org/mailman/listinfo/humanities-dev
[5]: http://wikisource.org/
[6]: http://www.gutenberg.org/
[7]: http://www.perseus.tufts.edu/
[8]: http://archive.org/