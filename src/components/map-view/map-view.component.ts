import {Component, ViewChild, OnInit} from "@angular/core";
import {NavigatorComponent} from "../navigator/navigator.component";
import {MarkerComponent} from "../marker/marker.component";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

import { MapViewInterface } from "../../core/map-view.interface";

import { OrgUnit } from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit, MapViewInterface {

    private orgUnits: OrgUnit[];
    private level1: L.GeoJSON[] = [];
    private level2: L.GeoJSON[] = [];
    private level3: L.GeoJSON[] = [];
    private level4: L.GeoJSON[] = [];

    private layer1;
    private layer2;
    private layer3;
    private layer4;

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
                // location => map.panTo([location.latitude, location.longitude]),
                location => map.panTo([8.0, -12.5]).zoomOut(4),
                err => console.error(err)
            );

        this.layer1 = L.layerGroup([]);
        this.layer2 = L.layerGroup([]);
        this.layer3 = L.layerGroup([]);
        this.layer4 = L.layerGroup([]);

        this.layer1.addTo(this.map);
        this.layer2.addTo(this.map);
        this.layer3.addTo(this.map);
        this.layer4.addTo(this.map);
    }

    ngAfterViewInit(): void {
        this.markerComponent.Initialize();
        this.orgUnitService.registerMapView(this);
    }

    draw(orgUnits: OrgUnit[]): void {

        // Need to clear all data?

        // ATM reseting when new search is received
        this.level1 = [];
        this.level2 = [];
        this.level3 = [];
        this.level4 = [];

        console.log("JALLLAAA: " + orgUnits);

        this.addPolygons(orgUnits);
    }

    onSideBarClick(orgUnitId: string): void {
        // Set selected
        this.selectedPolygon = orgUnitId;

        // Tell all polygons to check
        // The one selected will trigger a fly-to
        for (let p of this.level1) {
            p.fire("selectedChanged");
        }

        for (let p of this.level2) {
            p.fire("selectedChanged");
        }

        for (let p of this.level3) {
            p.fire("selectedChanged");
        }

        for (let p of this.level4) {
            p.fire("selectedChanged");
        }
    }

    private addPolygons(orgUnits: OrgUnit[]) {
        this.orgUnits = orgUnits;
        let map = this.map;

        const ms = this;

        // OBS: At this time all polygons are created on the map
        //      This means that polygons may be put on top of others,
        //      making the polygons below impossible to reach
        //      Should probably limit to one "category" at a time,
        //      easily done by limiting to a single "level" at a time

        // Remove layers to not create duplicates when they are added
        // back towards the end of the function
        ms.layer1.remove();
        ms.layer2.remove();
        ms.layer3.remove();
        ms.layer4.remove();

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

                    // For each subfigure within the figure
                    for (let subfig of subfigures) {

                        let subfigureBuildup = [];

                        let individualTuppels = subfig.split("],["); // Split into seperate x,y tuppels (3)

                        // For each x,y tupple within the subfigure
                        for (let tuppel of individualTuppels) {
                            let individualNumbers = tuppel.split(","); // Split into seperate number values (4)

                            let tuppelBuildup = [];
                            tuppelBuildup.push(Number(individualNumbers[0])); // Interpret data as number and
                            tuppelBuildup.push(Number(individualNumbers[1])); // create tupple (5)

                            subfigureBuildup.push(tuppelBuildup); // Combine tuppels into subfigures (6)
                        }

                        parsedCoordinates.push(subfigureBuildup); // Combine subfigures to create final array (7)
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

                    let polygons;

                    if (org.level === 1) {
                        polygons = ms.level1;
                    } else if (org.level === 2) {
                        polygons = ms.level2;
                    } else if (org.level === 3) {
                        polygons = ms.level3;
                    } else { // Assuming only 4 levels
                        polygons = ms.level4;
                    }

                    let id = org.id;

                    // Push the polygon into an array for easy access later
                    let tempGeo = L.geoJSON(poly, {
                        onEachFeature: function(feature, layer) {
                            // layer.bindPopup(feature.properties.id + "<br>" + feature.properties.name);
                            layer.bindTooltip(feature.properties.name);
                        },
                        style: function(feature) {
                            return {color: feature.properties.defaultColor};
                        }
                    })
                    .addEventListener("mouseover", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon === feature.properties.id) {
                                return {fillColor: feature.properties.selectedColor};
                            } else {
                                return {fillColor: feature.properties.highlightColor};
                            }
                        });

                        this.toggleTooltip();
                    })
                    .addEventListener("mouseout", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon === feature.properties.id) {
                                return {fillColor: feature.properties.selectedColor};
                            } else {
                                return {fillColor: feature.properties.defaultColor};
                            }
                        });
                    })
                    .addEventListener("click", function(e) {
                        // map.flyToBounds(this.getBounds(), {paddingTopLeft: [350, 75]}); // coords does not agree, so flies to wrong area atm

                        // this.setStyle(function(feature) {
                        //     ms.selectedPolygon = feature.properties.id;
                        //     ms.orgUnitService.callOnMapClick(feature.properties.id);
                        // });

                        ms.selectedPolygon = id;
                        ms.orgUnitService.callOnMapClick(id, false);

                        for (let p of ms.level1) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level2) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level3) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level4) {
                            p.fire("selectedChanged");
                        }
                    })
                    .addEventListener("dblclick", function(e) {
                        // map.flyToBounds(this.getBounds(), {paddingTopLeft: [350, 75]}); // coords does not agree, so flies to wrong area atm

                        // this.setStyle(function(feature) {
                        //     ms.selectedPolygon = feature.properties.id;
                        //     ms.orgUnitService.callOnMapClick(feature.properties.id);
                        // });

                        ms.selectedPolygon = id;
                        ms.orgUnitService.callOnMapClick(id, true);

                        for (let p of ms.level1) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level2) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level3) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level4) {
                            p.fire("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        let geo = this;
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon === feature.properties.id) {
                                map.flyToBounds(geo.getBounds(), {paddingTopLeft: [350, 75]}); // coords does not agree, so flies to wrong area atm
                                return {fillColor: feature.properties.selectedColor};

                            } else {
                                return {fillColor: feature.properties.defaultColor};
                            }
                        });
                    });

                    // Only add polygon if it isn't already added

                    // ATM this is not needed as all data is wiped for each search
                    /*
                    let notFound = true;
                    for (let p of polygons) {
                        let pId;
                        p.setStyle(function(feature) {
                            pId = feature.properties.id;
                        });

                        if (pId === org.id) {
                            notFound = false;
                        }
                    }

                    if (notFound) {
                        polygons.push(tempGeo);
                    }
                    */

                    polygons.push(tempGeo);

                } else {
                    // Markers for single point locations

                    // Coordinates indicate marker
                    let markers;

                    if (org.level === 1) {
                        markers = ms.level1;
                    } else if (org.level === 2) {
                        markers = ms.level2;
                    } else if (org.level === 3) {
                        markers = ms.level3;
                    } else { // Assuming only 4 levels
                        markers = ms.level4;
                    }

                    let bracketsRemoved = org.coordinates.slice(1, org.coordinates.length - 1);
                    let markerCoordinate = [];

                    // For each x,y tupple within the subfigure
                    let individualNumbers = bracketsRemoved.split(","); // Split into seperate number values (4)

                    markerCoordinate.push(Number(individualNumbers[1]));
                    markerCoordinate.push(Number(individualNumbers[0]));

                    // Set up marker information
                    let markOptions = ({
                        "title": org.displayName + " | coords: " + markerCoordinate
                    });

                    let id = org.id;
                    let markerlatlng = L.latLng(markerCoordinate[0], markerCoordinate[1]);
                    let tempMark = L.marker(markerlatlng, markOptions)
                    .addEventListener("click", function(e) {
                        ms.selectedPolygon = id;
                        ms.orgUnitService.callOnMapClick(id, false);

                        for (let p of ms.level1) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level2) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level3) {
                            p.fire("selectedChanged");
                        }

                        for (let p of ms.level4) {
                            p.fire("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        if (id === ms.selectedPolygon) {
                            let coords = this.getLatLng();
                            map.flyTo([coords.lat, coords.lng - 0.0004], 18);
                        }
                    });

                    markers.push(tempMark);
                }
            }
        }

        ms.layer1 = L.layerGroup(ms.level1);
        ms.layer2 = L.layerGroup(ms.level2);
        ms.layer3 = L.layerGroup(ms.level3);
        ms.layer4 = L.layerGroup(ms.level4);

        ms.layer1.addTo(ms.map);
        ms.layer2.addTo(ms.map);
        ms.layer3.addTo(ms.map);
        ms.layer4.addTo(ms.map);
    }
}
