---
layout: default
title: The Textus Platform
subtitle: An open source platform for presenting and working with cultural and historical texts<br />
---

<iframe src="https://docs.google.com/presentation/d/1OlXIaGgntenmBLNMu0tZYTdrP09TvzZ-R5bpJAgznF4/embed?start=false&amp;loop=false&amp;delayms=3000" frameborder="0" width="580" height="464" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="margin-bottom: 20px;"></iframe>

## Demo

<a href="http://beta.openphilosophy.org/"><img src="http://blog.okfn.org/files/2012/06/Capture1-1024x761.png"></a>

<p style="text-align: center;"><a href="http://beta.openphilosophy.org/">OpenPhilosophy.org</a></p>

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

[format]: ./doc/textus-format.html
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

Note these components are under **active development** as under

[formatter]: https://github.com/okfn/textus-formatter
[viewer]: https://github.com/okfn/textus-viewer
[wordpress]: http://github.com/okfn/textus-wordpress
[api-component]: http://github.com/okfn/textus-api

## Funded By

<a href="http://www.jisc.ac.uk/whatwedo/programmes/di_research/researchtools/textus.aspx"><img src="http://www.jisc.ac.uk/media/3/4/5/%7B345F1B7F-4AD6-4A61-B5BE-70AFA60F002F%7Djisclogojpgweb.jpg" /></a>

