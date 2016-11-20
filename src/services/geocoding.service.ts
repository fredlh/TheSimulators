import { Http, Headers, Response }    from "@angular/http";
import { Location }                   from "../core/location.class";
import { Injectable }                 from "@angular/core";

import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";

/*
 * This is a service responsible for translating a name to a location
 * Called when the user wants to search for a location rather than an orgUnit
 */

@Injectable()
export class GeocodingService {
    http: Http;

    constructor(http: Http) {
        this.http = http;
    }

    // Returns the location of the given address
    // Uses the Google Map API
    geocode(address: string): any {
        return this.http
            .get("http://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(address))
            .map(res => res.json())
            .map(result => {
                if (result.status !== "OK") { throw new Error("unable to geocode address"); }

                let location = new Location();
                location.address = result.results[0].formatted_address;
                location.latitude = result.results[0].geometry.location.lat;
                location.longitude = result.results[0].geometry.location.lng;

                let viewPort = result.results[0].geometry.viewport;
                location.viewBounds = L.latLngBounds(
                  {
                    lat: viewPort.southwest.lat,
                    lng: viewPort.southwest.lng},
                  {
                    lat: viewPort.northeast.lat,
                    lng: viewPort.northeast.lng
                  });

                return location;
            });
    }

}
