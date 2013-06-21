/*jslint devel: true, browser: true, nomen: true, maxerr: 50, indent: 4 */
/*global jQuery, $, _, L, Avgrund*/

(function () {
    "use strict";

    var map;

    function createPopupLinkRow(url) {
        var template = '<tr><td>Image</td><td><a href="' + url + '">Image</a></td></tr>',
            $ret = $(template);

        $ret
            .find('a')
            .avgrund({
                template: '<img src="' + url + '"/>'
            });

        return $ret;
    }


    /**
     * Parse JSON to geoJson.
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function parseGeoJson(data) {
        return L.geoJson(JSON.parse(data),
            {
                onEachFeature: function (feature, layer) {
                    var prop,
                        $popup = $('<table class="table table-bordered"></table>'),
                        $row;

                    if (feature.properties) {
                        for (prop in feature.properties) {
                            if (feature.properties.hasOwnProperty(prop)) {
                                if (prop === 'image') {
                                    $popup.append(createPopupLinkRow(feature.properties[prop]));
                                } else {
                                    $popup.append('<tr><td>' + prop + '</td><td>' + feature.properties[prop] + '</td></tr>');
                                }
                            }
                        }

                        layer.bindPopup($popup[0]);
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