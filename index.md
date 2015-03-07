---
layout: default
title: The Textus Platform
subtitle: An open source platform for presenting and working with cultural and historical texts<br />
---

![Textus: an open source platform for collaborating around collections of texts](images/textus_logo.jpg)

Textus is an **open source** platform for working with collections of texts. It enables students, researchers and teachers to **share** and **collaborate** around texts using a simple and intuitive interface.

## What does Textus do?
Textus currently enables users to:

* Collaboratively annotate texts and view the annotations of others
* Reliably cite electronic versions of texts
* Create bibliographies with stable URLs to online versions of those texts

## Where has Textus been deployed?
The first instance of Textus will be deployed as [beta.OpenPhilosophy.org](http://beta.openphilosophy.org/). We are working closely with students from [Goldsmiths University](http://www.gold.ac.uk/), the [University of Oxford](http://www.ox.ac.uk/) and a distinguished advisory board of philosophy academics to make sure that OpenPhilosophy meets the needs of the philosophical community.

### Demo (Open Philosophy)

<a href="http://beta.openphilosophy.org/"><img src="http://blog.okfn.org/files/2012/06/Capture1-1024x761.png"></a>

<p style="text-align: center;"><a href="http://beta.openphilosophy.org/">OpenPhilosophy.org</a></p>

## How do I get involved with Textus?
Textus is an open source platform developed by the [Open Knowledge Foundation](http://okfn.org/). If you’d like to get involved you can:

* [Sign up to the discussion list](http://lists.okfn.org/mailman/listinfo/open-humanities)
* [Sign up to the developer list](http://lists.okfn.org/mailman/listinfo/humanities-dev)
* [Get the code on Github](https://github.com/okfn/Textus)

<iframe src="https://docs.google.com/presentation/d/1OlXIaGgntenmBLNMu0tZYTdrP09TvzZ-R5bpJAgznF4/embed?start=false&amp;loop=false&amp;delayms=3000" frameborder="0" width="580" height="464" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="margin-bottom: 20px;"></iframe>

We are also in the process of upgrading [Open Literature][lit] to use Textus.

[lit]: http://openliterature.net/

## The Textus 'Standard'

At the core of Textus is a lightweight standard for how to store texts. The
software components of Textus build around this lightweight standard.

You can find full documentation of the standard in the [Textus JSON Format
specification][format].

### Additional related documentation

Note: much of this is in the process of becoming obsolete due to the move to a
new componentized model (see slides) and will be updated or removed in the near
future.

* [API Specification][api]
* [How Text Rendering works][rendering]
* [Notes on Architecture][architecture]

[format]: ./doc/Textus-format.html
[api]: ./doc/api.html
[rendering]: ./doc/text-rendering.html
[architecture]: ./doc/architecture.html

## Components

The Textus Platform is now being refactored composed of 4 separate components:

* [Textus Formatter][formatter] - this tool converts standard text formats to the Textus
  format
* [Textus Viewer][viewer] - this is a pure Javascript + HTML app that displays a text in
  Textus Format
* [Textus Wordpress][wordpress] - a plugin that uses the other Textus tools to turn
  Wordpress into a platform for hosting, presenting and collaborating on
  cultural texts
* [Textus API][api-component] - create an API for texts in Textus format

Note these components are under **active development** as of December 2013.

[formatter]: https://github.com/okfn/Textus-formatter
[viewer]: https://github.com/okfn/Textus-viewer
[wordpress]: http://github.com/okfn/Textus-wordpress
[api-component]: http://github.com/okfn/Textus-api

## Funded By

<a href="http://www.jisc.ac.uk/whatwedo/programmes/di_research/researchtools/Textus.aspx"><img src="images/jisc_logo.png" /></a>

