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

const leafletDraw = require("leaflet-draw");


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
    private editId;
    private maxLevelReached: boolean;
    private allCoords = [];
    private editDisableLayer;

    private mapOptions: MapOptions[];
    private autoZoomOnSearch: boolean;
    private autoZoomOnGetChildren: boolean;
    private autoZoomOnSelect: boolean;

    private map;

    private drawControl; // : L.Control;
    private drawnItems = L.featureGroup();
    private previousDrawnItems = [];

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

        this.maxLevelReached = false;
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

        this.drawControl = new L.Control.Draw({
        // this.map.addControl(new L.Control.Draw({
            position: "bottomright",
            edit: {
                featureGroup: this.drawnItems,
                poly: {
                    allowIntersection: false
                }
            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                },
                circle: false,
                rectangle: false,
                polyline: false,
                marker: false
            }
        });

        const ms = this;
        this.map.on("draw:created", function(e: L.DrawEvents.Created) {
            var type = e.layerType,
                layer = e.layer;

            ms.drawnItems.addLayer(layer);

            // map.flyToBounds(ms.drawnItems.getBounds(), {paddingTopLeft: [350, 75]})
        });

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
        for (let l of this.levels) {
            for (let p of l) {
                p.fire("optionsChanged");
            }
        }
    }

    startEditMode(orgUnitId: string): void {
        this.editId = orgUnitId;
        
        for (let l of this.levels) {
            for (let p of l) {
                p.fire("setEditStyle");
            }
        }

        if ((this.drawnItems.getLayers().length > 0) || (orgUnitId === "")) {
            this.drawnItems.addTo(this.map);
            this.drawControl.addTo(this.map);
        } else {

            for (let l of this.levels) {
                for (let p of l) {
                    p.fire("getEditCoordinates");
                }
            }
        }
    }

    private loadEditPolygon(existingData): void {
        // this.drawnItems = L.featureGroup();

        // console.log(JSON.stringify(existingData));

        // this.drawnItems.clearLayers();

        const ms = this;

        if (existingData[0][0].length > 0) {
        // if (latlngs.length > 0) {
           
            let swappedcoords = [];
            //for (let i of existingData) {
            //    let innerI = [];
                for (let j of existingData) {
                    let innerJ = [];
                    for (let k of j) {
                        let innerK = [];
                        innerK.push(k[1]);
                        innerK.push(k[0]);
                        innerJ.push(innerK);
                    }
            //        innerI.push(innerJ);
            //    }
                swappedcoords.push(innerJ);
            }
            
            // let swappedcoords = L.GeoJSON.coordsToLatLng(existingData[0]);

            console.log("existingData: " + JSON.stringify(existingData));
            console.log("swapped: " + JSON.stringify(swappedcoords));
            for (let i of swappedcoords) {
            
                // this.drawnItems.addLayer(L.polygon(i, {
                this.drawnItems.addLayer(L.polygon(swappedcoords, {
                    // showArea: false,
                    color: "#f06eaa",
                    weight: 4,
                    opacity: 0.5,
                    fill: true,
                    fillColor: null,
                    fillOpacity: 0.2,
                    // clickable: true
                }));
            }
        }

        // Create a backup of the editable layers
        this.previousDrawnItems = [];
        for (let l of this.drawnItems.getLayers()) {
            this.previousDrawnItems.push(l);
        }
        
        this.drawnItems.addTo(this.map);
        this.drawControl.addTo(this.map);
    }

    endEditMode(saved: boolean): number[][][][] {
        var coordinates = [];
        if (saved) {
            this.previousDrawnItems = [];
            for(let lay of this.drawnItems.getLayers()) {
                this.previousDrawnItems.push(lay);
                let subfigure = [];

                // Export coords from layer
                let lats = lay.getLatLngs();
                for (let area of lats) {
                    for (let point of area) {
                        subfigure.push([point.lng, point.lat]);
                    }
                }

                let pack1 = [];
                let pack2 = [];

                pack1.push(subfigure);
                pack2.push(pack1);
                coordinates.push(pack1);
            }
        }

        this.drawnItems.clearLayers();
        for (let lay of this.previousDrawnItems) {
            this.drawnItems.addLayer(lay);
        }

        for (let l of this.levels) {
            for (let p of l) {
                p.fire("selectedChanged");
            }
        }

        this.editId = "";

        this.drawControl.remove();
        this.drawnItems.remove();

        return coordinates;
    }

    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean): void {
        this.levels = [[], [], [], []];
        this.selectedPolygon = "";
        this.maxLevelReached = maxLevelReached;

        let doFly = ((this.autoZoomOnSearch && onSearch) || (this.autoZoomOnGetChildren && !onSearch));

        this.addMapElement(orgUnits, maxLevelReached, doFly);
    }

    drawAdditionalOrgUnits(orgUnits: OrgUnit[]): void {
        // Should it include max level from something else?
        // Should it fly to, according to parameter?

        this.addMapElement(orgUnits, this.maxLevelReached, false);
    }

    previewCoordinates(coords: number[][][][]): void {
        // Make polygon in seperate layer and display on map
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

    private addMapElement(orgUnits: OrgUnit[], maxLevelReached: boolean, doFly: boolean) {
        // this.orgUnits = orgUnits;
        let map = this.map;
        this.allCoords = [];
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
                            return {color: ms.mapOptions[levelIndex].borderColor, fillColor: ms.mapOptions[levelIndex].color, weight: +ms.mapOptions[levelIndex].borderWeight, fillOpacity: +ms.mapOptions[levelIndex].opacity, opacity: +ms.mapOptions[levelIndex].borderOpacity};
                        }
                    })
                    .addEventListener("mouseover", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon !== feature.properties.id) {
                                return {color: ms.mapOptions[levelIndex].borderHoverColor, fillColor: ms.mapOptions[levelIndex].hoverColor, weight: +ms.mapOptions[levelIndex].borderHoverWeight, fillOpacity: +ms.mapOptions[levelIndex].hoverOpacity, opacity: +ms.mapOptions[levelIndex].borderHoverOpacity};
                            }
                        });

                        this.toggleTooltip();
                    })
                    .addEventListener("mouseout", function(e) {
                        this.setStyle(function(feature) {

                            if (ms.selectedPolygon !== feature.properties.id) {
                                return {color: ms.mapOptions[levelIndex].borderColor, fillColor: ms.mapOptions[levelIndex].color, weight: +ms.mapOptions[levelIndex].borderWeight, fillOpacity: +ms.mapOptions[levelIndex].opacity, opacity: +ms.mapOptions[levelIndex].borderOpacity};
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
                                return {color: ms.mapOptions[levelIndex].borderSelectedColor, fillColor: ms.mapOptions[levelIndex].selectedColor, weight: +ms.mapOptions[levelIndex].borderSelectedWeight, fillOpacity: +ms.mapOptions[levelIndex].selectedOpacity, opacity: +ms.mapOptions[levelIndex].borderSelectedOpacity};

                            } else {
                                return {color: ms.mapOptions[levelIndex].borderColor, fillColor: ms.mapOptions[levelIndex].color, weight: +ms.mapOptions[levelIndex].borderWeight, fillOpacity: +ms.mapOptions[levelIndex].opacity, opacity: +ms.mapOptions[levelIndex].borderOpacity};
                            }
                        });
                    })
                    .addEventListener("optionsChanged", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedPolygon === feature.properties.id) {
                                return {color: ms.mapOptions[levelIndex].borderSelectedColor, fillColor: ms.mapOptions[levelIndex].selectedColor, weight: +ms.mapOptions[levelIndex].borderSelectedWeight, fillOpacity: +ms.mapOptions[levelIndex].selectedOpacity, opacity: +ms.mapOptions[levelIndex].borderSelectedOpacity};

                            } else {
                                return {color: ms.mapOptions[levelIndex].borderColor, fillColor: ms.mapOptions[levelIndex].color, weight: +ms.mapOptions[levelIndex].borderWeight, fillOpacity: +ms.mapOptions[levelIndex].opacity, opacity: +ms.mapOptions[levelIndex].borderOpacity};
                            }
                        });
                    })
                    .addEventListener("setEditStyle", function(e) {
                        let data;

                        this.setStyle(function(feature) {
                            if (id === ms.editId) {
                                // This layer is to be edited
                                console.log("fire event for editLayer received and found id");
                                data = feature.geometry.coordinates;

                                return {color: "black", fillColor: "blue", weight: 0, fillOpacity: 0, opacity: 0};
                            } else {
                                return {color: "black", fillColor: "black", weight: 1, fillOpacity: 0.2, opacity: 1};
                            }
                        });
                    })
                    .addEventListener("getEditCoordinates", function(e) {
                        this.setStyle(function(feature) {
                            if (id === ms.editId) {
                                ms.loadEditPolygon(feature.geometry.coordinates);
                            }
                        });
                    });

                    ms.allCoords.push(tempGeo.getBounds());
                    ms.levels[levelIndex].push(tempGeo);

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

                    ms.allCoords.push(markerCoordinate);

                    const defaultIcon = require("../../../images/ambulance_green.png");
                    const highlightIcon = require("../../../images/ambulance_red.png");

                    let defIcon = L.icon({
                        iconUrl: "../../../images/ambulance_green.png"
                    });

                    let highIcon = L.icon({
                        iconUrl: "../../../images/ambulance_red.png"
                    });

                    // Set up marker information
                    let markOptions = ({
                        "title": org.displayName + " | coords: " + markerCoordinate,
                        "icon": defIcon
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
                            this.setIcon(highIcon);

                            let coords = this.getLatLng();
                            map.flyTo([coords.lat, coords.lng - 0.0004], 18);

                        } else {
                            this.setIcon(defIcon);
                        }
                    })
                    .addEventListener("optionsChanged", function(e) {
                        // Don't do anything for markers yet
                    })
                    .addEventListener("editLayer", function(e) {
                        if (id === ms.editId) {
                            // This layer is to be edited
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

        if (ms.allCoords.length !== 0 && doFly) {
            map.flyToBounds(ms.allCoords, {paddingTopLeft: [350, 75]});
        }
    }
}
