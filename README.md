# Newweather
**Hosted with [opeNode.io](https://www.openode.io)!** Thanks to opeNode for supporting open-source projects!

View now at [newweather.openode.io](https://newweather.openode.io/)

### A random note
I've neglected this project for a while, mostly bc I'm scared to touch it. I put it back online a few days ago, but that doesn't mean it's very stable. Also, looking at the code may be hazardous to your health. You've been warned.

### Note about downtime
Sorry if the openode server is down a lot. I have a rather sporadic dev cycle. Updates take a bit to deploy, and breakages may take a bit of time to solve.
(Unless I decide to touch it (or it breaks), you shouldn't expect downtime - until openode ineveitably shuts the server down for inactivity)

## About
Newweather is a small open source web app based on [Node.js](https://nodejs.org/en/) and the [US National Weather Service (NWS) API](https://www.weather.gov/documentation/services-web-api). Being fed up with other bloated and slow-to-load weather services after the weather service we used previously merged with another one, and discouraged by the ugly and hard to read graphs on the NWS website, I decided to build my own small weather app. This app turns the NWS API data into ~~non-bloated~~, readable graphs (the graphs actually look kinda nice - so I did one thing right on this project) that ~~don't take too long to load, even on mobile devices with slower connections.~~ (they do take a good bit to load. But in this app it's server-side resource loading not client-side. That doesn't make it better though - it still takes a while)

This is my first(ish) (major) node.js project, constructive criticism is welcome.

**Graphs:**

I am currently using the closed-source canvasJS graph library.
Something else open source with similar functionality would be appreciated if you know of one.

**A note about environments**
When trying to get deployed on vercel, The vercel bot added environments. These are still active, but VERY broken. Use them at your own risk.
Actually, this whole repository is a big mess. But I don't feel like fixing it because I'm not interested in working on this project.

## License

All files included in this repository are licensed under the MPL-2.0 except for the following:

* GitHub-Mark-64px.png - license info can be found at [https://github.com/logos](https://github.com/logos)
* And any other files I do not own the rights to but may have forgotten to put here.
