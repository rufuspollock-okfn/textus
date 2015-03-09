---
layout: post
title: TEXTUS and The Annotator
date: 2012-04-25
---

The first phase of user requirements gathering has been concluded and we're only a few weeks away from having a first beta version of our platform up and running. You can read about how these sessions went [here][1] and [here][2].

What we learned from these sessions has informed how we've spent this initial intensive period of development. One area that of the platform that we've been working hard to get right is the annotation engine as it sits at the heart of much of what you want to do on TEXTUS — to comment on or translate a section of text for instance.

When we began this project our plan was to fully integrate [The Annotator][3] tool developed by the [Open Knowledge Foundation][4] into TEXTUS, but as the project has progressed it has become clear that what students and scholars wanted was something a little bit different to The Annotator.

Much of the feedback we gained from scholars and students pointed to the fact that annotations needed to be rendered and filtered in ways that The Annotator doesn't currently allow for.

This lead us to the conclusion that more development needed to go into the annotation rendering and user experience than we had first anticipated and that we'd diverge from the code of The Annotator to a greater extent than we initially anticipated.

The drawback from this was that we have not been able to get a working version of the platform as quickly as anticipated. We've had to wait longer than anticipated to try out annotating texts in TEXTUS in the context of reading groups and seminars.

There are two plus sides to this:

1. We will have an annotation tool that explicitly responds to the needs of our user community.
2. We will be doing work on the rendering engine that will inform the development of The Annotator.

For more information on how TEXTUS relates to Annotator have a look at our [documentation folder][5] on Github which also contains some useful information on the [TEXTUS system architecture][6].

Stay tuned for some demos of TEXTUS we've prepared that I'll post shortly.

[1]: http://okfnlabs.org/textus/2012/02/17/what-do-users-want-from-textus.html
[2]: http://okfnlabs.org/textus/2012/03/16/what-do-users-want-part-ii.html
[3]: http://annotateit.org
[4]: http://okfn.org
[5]: https://github.com/okfn/textus/tree/master/docs
[6]: https://github.com/okfn/textus/blob/master/docs/architecture_overview.md
