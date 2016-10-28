import {Component, ViewChild, OnInit} from "@angular/core";
import {NavigatorComponent} from "../navigator/navigator.component";
import {MarkerComponent} from "../marker/marker.component";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

import { MapViewInterface } from "../../core/map-view.interface";

import { OrgUnit } from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { OptionsComponent, MapOptions } from "../options/options.component";

@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit, MapViewInterface {
    // private orgUnits: OrgUnit[];
    private levels: L.GeoJSON[][] = [[], [], [], []];
    private layers = [];
    private selectedPolygon;

    private mapOptions: MapOptions[];
    private autoZoomOnSearch: boolean;
    private autoZoomOnGetChildren: boolean;
    private autoZoomOnSelect: boolean;

    private map;

    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService, private orgUnitService: OrgUnitService) {}

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

        map.clicked = 0;
    }

    ngAfterViewInit(): void {
        this.markerComponent.Initialize();
        this.orgUnitService.registerMapView(this);

        // Used to set default values on initialization
        this.onMapOptionsSave();
    }

    onMapOptionsSave(): void {
        this.mapOptions = OptionsComponent.getMapOptions();
        this.autoZoomOnSearch = OptionsComponent.getAutoZoomOnSearch();
        this.autoZoomOnGetChildren = OptionsComponent.getAutoZoomOnGetChildren();
        this.autoZoomOnSelect = OptionsComponent.getAutoZoomOnSelect();

        // Fire changed options event
    }

    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean): void {
        this.levels = [[], [], [], []];
        this.selectedPolygon = "";
        this.addPolygons(orgUnits, maxLevelReached, onSearch);
    }

    deselectMap(): void {
        this.onSideBarClick("");
    }

    onSideBarClick(orgUnitId: string): void {
        // Set selected
        this.selectedPolygon = orgUnitId;

        // Tell all polygons to check, could also result in a fly to depending on settings
        this.fireSelectedChanged();
    }

    private parsePolygonCoordinates(coordinatesAsString: string): any {
        let bracketsRemoved = coordinatesAsString.slice(4, coordinatesAsString.length - 4); // Remove brackets on each end (1)
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

        return parsedCoordinates;
    }

    private fireSelectedChanged(): void {
        for (let l of this.levels) {
            for (let p of l) {
                p.fire("selectedChanged");
            }
        }
    }

    private addPolygons(orgUnits: OrgUnit[], maxLevelReached: boolean, newSearch: boolean) {
        // this.orgUnits = orgUnits;
        let map = this.map;
        let allCoords = [];
        const ms = this;

        // For each orgUnit in the argument array
        for (let org of orgUnits) {

            let levelIndex = org.level - 1;
            let id = org.id;

            // Check if orgUnit contains coordinates
            if (org.coordinates !== undefined) {

                // Coordinates is gathered in the form of a string, needs to parse it into [[[x,y],[x,y]],[[x,y]]] number array

                // Check if coordinate indicate a polygon (and not a single point --- marker)
                if (org.coordinates[1] === "[") {
                    // Set up polygon information
                    let poly = ({
                        "type": "Feature",
                        "properties": {"id": org.id, "name": org.displayName},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": ms.parsePolygonCoordinates(org.coordinates)
                        }
                    });

                    // Push the polygon into an array for easy access later
                    let tempGeo = L.geoJSON(poly, {
                        onEachFeature: function(feature, layer) {
                            layer.bindTooltip(feature.properties.name);
                        },
                        style: function(feature) {
                            return {color: ms.mapOptions[levelIndex].color, fillColor: ms.mapOptions[levelIndex].fillColor, weight: +ms.mapOptions[levelIndex].borderWeight, opacity: +ms.mapOptions[levelIndex].opacity};
                        }
                    })
                    .addEventListener("mouseover", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon !== feature.properties.id) {
                                return {color: ms.mapOptions[levelIndex].hoverColor, fillColor: ms.mapOptions[levelIndex].fillHoverColor, weight: +ms.mapOptions[levelIndex].borderHoverWeight, opacity: +ms.mapOptions[levelIndex].hoverOpacity};
                            }
                        });

                        this.toggleTooltip();
                    })
                    .addEventListener("mouseout", function(e) {
                        this.setStyle(function(feature) {
                            
                            if (ms.selectedPolygon !== feature.properties.id) {
                                return {color: ms.mapOptions[levelIndex].color, fillColor: ms.mapOptions[levelIndex].fillColor, weight: +ms.mapOptions[levelIndex].borderWeight, opacity: +ms.mapOptions[levelIndex].opacity};
                            }
                        });
                    })
                    .addEventListener("click", function(e) {
                        map.clicked = map.clicked + 1;
                        setTimeout(function() {
                            if (map.clicked === 1 && ms.selectedPolygon !== id) {
                                ms.selectedPolygon = id;
                                ms.orgUnitService.callOnMapClick(id, false);
                                ms.fireSelectedChanged();
                            }

                            map.clicked = 0;
                        }, 250);
                    })
                    .addEventListener("dblclick", function(e) {
                        map.clicked = 0;

                        if (!(maxLevelReached)) {
                            ms.selectedPolygon = "";
                            ms.orgUnitService.callOnMapClick(id, true);
                            ms.fireSelectedChanged();
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        let geo = this;
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon === feature.properties.id) {

                                if (ms.autoZoomOnSelect) {
                                    map.flyToBounds(geo.getBounds(), {paddingTopLeft: [350, 75]});
                                }
                                return {color: ms.mapOptions[levelIndex].selectedColor, fillColor: ms.mapOptions[levelIndex].fillSelectedColor, weight: +ms.mapOptions[levelIndex].borderSelectedWeight, opacity: +ms.mapOptions[levelIndex].selectedOpacity};

                            } else {
                                return {color: ms.mapOptions[levelIndex].color, fillColor: ms.mapOptions[levelIndex].fillColor, weight: +ms.mapOptions[levelIndex].borderWeight, opacity: +ms.mapOptions[levelIndex].opacity};
                            }
                        });
                    });

                    allCoords.push(tempGeo.getBounds());
                    ms.levels[org.level - 1].push(tempGeo);

                } else {
                    // Markers for single point locations
                    let level: any = ms.levels[org.level - 1]; // Hack to force L.Markers into array

                    // Markers are parsed in-function because of the low complexity
                    let bracketsRemoved = org.coordinates.slice(1, org.coordinates.length - 1);
                    let markerCoordinate = [];

                    // For each x,y tupple within the subfigure
                    let individualNumbers = bracketsRemoved.split(","); // Split into seperate number values (4)

                    markerCoordinate.push(Number(individualNumbers[1]));
                    markerCoordinate.push(Number(individualNumbers[0]));

                    allCoords.push(markerCoordinate);

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
                        ms.fireSelectedChanged();
                    })
                    .addEventListener("selectedChanged", function(e) { 
                        if (id === ms.selectedPolygon && ms.autoZoomOnSelect) {
                            let coords = this.getLatLng();
                            map.flyTo([coords.lat, coords.lng - 0.0004], 18);
                        }
                    });

                    level.push(tempMark);
                }
            }
        }

        // Remove layers to not create duplicates when they are added
        // back towards the end of the function
        for (let l of ms.layers) {
            l.remove();
        }
        
        ms.layers = [];
        ms.layers.push(L.layerGroup(ms.levels[0]));
        ms.layers.push(L.layerGroup(ms.levels[1]));
        ms.layers.push(L.layerGroup(ms.levels[2]));
        ms.layers.push(L.layerGroup(ms.levels[3]));
        
        for (let l of ms.layers) {
            l.addTo(ms.map);
        }

        if (allCoords.length !== 0 && ((ms.autoZoomOnSearch && newSearch) || (ms.autoZoomOnGetChildren && !newSearch))) {
            map.flyToBounds(allCoords, {paddingTopLeft: [350, 75]});
        }
    }
}
