# Creating geojson from GPX data

For some reason, **ogr2ogr** doesn't handle raw gpx data well, and for some reason **togeojson** doesn't convert GPX waypoints at all. So, the solution I've come up with is to use both tools, and then hand-fix any errors generated.

# How to convert GPX tracks to geojson

1. Install **[togeojson](https://github.com/tmcw/togeojson)** node module:
    
        npm install -g togeojson

2. Open up target GPX or KML file and run the following in the command line:

        togeojson file.kml > file.geojson

You should get a geojson file with just your tracks in it. Waypoints get deleted.


# Using ogr2ogr to create geojson points/markers

1. Install **ogr2ogr**:

        sudo port install gdal

**If you have postgres.app** installed, make sure you remove it from the /Applications folder, otherwise you will get several "image library not found" errors that will prevent it's use.

2. Modify your raw gpx data so that it only includes the waypoints, not the tracks. 

3. In terminal, fire off this command:

        ogr2ogr -skipfailures -f GeoJson target.geojson source-with-no-tracks.gpx
