
# Copperfeed

## CopperfeedConfig

* `feedurl`: the URL of the RSS feed to retrieve
* `autoscroll`: boolean
* `autoscrolltime`: time in seconds between autoscrolls (default: 5)
* `scrolltime`: length in seconds of the scroll animation (default: .25)

## Limitations

* The widget's origin must be the same as the feed's, or the feed must have an Access-Control-Allow-Origin header which includes the widget's origin. Otherwise, CORS will block the retrieval of the data.
