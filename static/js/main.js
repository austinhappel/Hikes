/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 4 */
/*global jQuery, $, _, L*/

(function () {
    "use strict";

    var map;

    function parseGeoJson(data) {
        return L.geoJson(JSON.parse(data),
            {
                onEachFeature: function (feature, layer) {
                    var prop,
                        popup = '<table>';
                    if (feature.properties) {
                        for (prop in feature.properties) {
                            if (feature.properties.hasOwnProperty(prop)) {
                                popup += '<tr><td>' + prop + '</td><td>' + feature.properties[prop] + '</td></tr>\n';
                            }
                        }

                        popup += '</table>';

                        layer.bindPopup(popup);
                    }
                }
            });
    }

    /**
     * Retreives geojson track data, places it in the map and returns the Leaflet
     * geoJSON object for further manipulation
     * @param  {String} url             url for geojson
     * @param  {Function} callbackSuccess callback for successful retreival of geojson
     * @param  {Function} callbackError   callback for error
     * @return {Object} L.geoJson object.
     */
    function getTrack(url, callbackSuccess, callbackError) {
        // retreive the geojson data
        function success(data) {
            var track = parseGeoJson(data);
            track.addTo(map);

            if (typeof callbackSuccess === 'function') {
                callbackSuccess(track);
            }
        }

        function error(jqXHR) {
            console.log('wrong');
            if (typeof callbackError === 'function') {
                callbackError(jqXHR);
            }
        }

        $.ajax({
            url: url,
            type: 'GET',
            success: success,
            error: error
        });
    }

    function focusTrack(track) {
        map.fitBounds(track.getBounds());
    }

    function resizeMap() {
        // init the map size
        $('#map, #sidebar').css({
            height: $(window).outerHeight()
        });
        map.invalidateSize(true);
    }

    function getAllTracks() {
        $('.hike-list a')
            .each(function () {
                var $a = $(this);

                function success(element, track) {
                    $a.data('cachedTrack', track);
                }

                getTrack($a.attr('href'), success);
            });
    }

    // init map
    map = L.map('map');
    L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenCycleMap, ' + 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }).addTo(map);

    $(document).ready(function () {

        // bind events
        $('.hike-list')
            .on('click', 'a', function (e) {
                e.preventDefault();

                var $a = $(e.target);

                function success(track) {
                    focusTrack(track);
                    $a.data('cachedTrack', track);
                }

                if ($a.data('cachedTrack')) {
                    map.fitBounds($a.data('cachedTrack').getBounds());
                } else {
                    getTrack($a.attr('href'), success);
                }

            });

        $(window).resize(function () {
            resizeMap();
        });

        resizeMap();
        getAllTracks();
        getTrack($('.hike-list a').eq(0).attr('href'), focusTrack);

    });
}(this));