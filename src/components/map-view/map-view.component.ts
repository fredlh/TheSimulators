import {Component, ViewChild, OnInit} from "@angular/core";
import {NavigatorComponent} from "../navigator/navigator.component";
import {MarkerComponent} from "../marker/marker.component";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

import { DrawAble } from "../../core/draw-able.interface";

import { OrgUnit } from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit, DrawAble {

    private orgUnits: OrgUnit[];
    private polygons: L.GeoJSON[] = [];

    private map;

    private selectedPolygon;

    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService, private orgUnitService: OrgUnitService) {
    }

    ngOnInit(): void {
        this.map = L.map("map", {
            zoomControl: false,
            center: L.latLng(40.731253, -73.996139),
            zoom: 12,
            minZoom: 4,
            maxZoom: 19,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });

        let map = this.map;

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);
        L.control.scale().addTo(map);

        this.mapService.map = map;
        this.geocoder.getCurrentLocation()
            .subscribe(
                location => map.panTo([location.latitude, location.longitude]),
                err => console.error(err)
            );
    }

    ngAfterViewInit(): void {
        this.markerComponent.Initialize();
        this.orgUnitService.registerDrawAbleComponent(this);
    }

    addPolygons(orgUnits: OrgUnit[]) {
        this.orgUnits = orgUnits;
        let map = this.map;
        let selectedPolygon = this.selectedPolygon;
        let polygons = this.polygons;

        // OBS: At this time all polygons are created on the map
        //      This means that polygons may be put on top of others,
        //      making the polygons below impossible to reach
        //      Should probably limit to one "category" at a time,
        //      easily done by limiting to a single "level" at a time

        // For each orgUnit in the argument array
        for (let org of orgUnits) {

            // Check if orgUnit contains coordinates
            if (org.coordinates !== undefined) {

                // Coordinates is gathered in the form of a string, needs to parse it into [[[x,y],[x,y]],[[x,y]]] number array

                // Check if coordinate indicate a polygon (and not a single point --- marker)
                if (org.coordinates[1] === "[") {

                    let bracketsRemoved = org.coordinates.slice(4, org.coordinates.length - 4); // Remove brackets on each end (1)
                    let subfigures = bracketsRemoved.split("]]],[[["); // Split into subfigures (2)

                    let parsedCoordinates = [];
                    let inverseParsedCoordinates = [];

                    // For each subfigure within the figure
                    for (let subfig of subfigures) {

                        let subfigureBuildup = [];
                        let inverseSubfigureBuildup = [];

                        let individualTuppels = subfig.split("],["); // Split into seperate x,y tuppels (3)

                        // For each x,y tupple within the subfigure
                        for (let tuppel of individualTuppels) {
                            let individualNumbers = tuppel.split(","); // Split into seperate number values (4)

                            let tuppelBuildup = [];
                            tuppelBuildup.push(Number(individualNumbers[0])); // Interpret data as number and
                            tuppelBuildup.push(Number(individualNumbers[1])); // create tupple (5)

                            let inverseTuppelBuildup = [];
                            inverseTuppelBuildup.push(Number(individualNumbers[1]));
                            inverseTuppelBuildup.push(Number(individualNumbers[0]));

                            subfigureBuildup.push(tuppelBuildup); // Combine tuppels into subfigures (6)
                            inverseSubfigureBuildup.push(inverseTuppelBuildup);
                        }

                        parsedCoordinates.push(subfigureBuildup); // Combine subfigures to create final array (7)
                        inverseParsedCoordinates.push(inverseSubfigureBuildup);
                    }

                    // Set up polygon information
                    let poly = ({
                        "type": "Feature",
                        "properties": {"id": org.id, "name": org.displayName, "defaultColor": "black", "highlightColor": "blue", "selectedColor": "red", "weight": "1"},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": parsedCoordinates
                        }
                    });

                    // Push the polygon into an array for easy access later
                    polygons.push(L.geoJSON(poly, {
                        onEachFeature: function(feature, layer) {
                            layer.bindPopup(feature.properties.id + "<br>" + feature.properties.name);
                        },
                        style: function(feature) {
                            return {color: feature.properties.defaultColor};
                        }
                    })
                    .addEventListener("mouseover", function(e) {
                        this.setStyle(function(feature) {
                            if (selectedPolygon === feature.properties.id) {
                                return {fillColor: feature.properties.selectedColor};
                            } else {
                                return {fillColor: feature.properties.highlightColor};
                            }
                        });
                    })
                    .addEventListener("mouseout", function(e) {
                        this.setStyle(function(feature) {
                            if (selectedPolygon === feature.properties.id) {
                                return {fillColor: feature.properties.selectedColor};
                            } else {
                                return {fillColor: feature.properties.defaultColor};
                            }
                        });
                    })
                    .addEventListener("click", function(e) {
                        map.flyToBounds(inverseParsedCoordinates, {paddingTopLeft: [50, 50]}); // coords does not agree, so flies to wrong area atm

                        this.setStyle(function(feature) {
                            selectedPolygon = feature.properties.id;
                        });

                        for (let p of polygons) {
                            p.fire("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        this.setStyle(function(feature) {
                            console.log("Detected selectedChanged event");
                            if (selectedPolygon === feature.properties.id) {
                                return {fillColor: feature.properties.selectedColor};
                            } else {
                                return {fillColor: feature.properties.defaultColor};
                            }
                        });
                    })
                    .addTo(map));
                } else {
                    // Markers for single point locations
                }
            }
        }
    }
}
