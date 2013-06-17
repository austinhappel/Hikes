# How to convert GPX data to geojson

1. Install **[togeojson](https://github.com/tmcw/togeojson)** node module:
    
    npm install -g togeojson

2. Open up target GPX or KML file and run the following in the command line:

    togeojson file.kml > file.geojson


# Other notes

**ogr2ogr** Is also a useful GIS data converter, although I've had no luck with it. **If you have postgres.app** installed, make sure you remove it from the /Applications folder, otherwise you will get several "image library not found" errors that will prevent it's use.