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

import { MouseEvent } from "leaflet";

import { Globals, FeatureType } from "../../globals/globals";

const leafletDraw = require("leaflet-draw");


@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit, MapViewInterface {
    // private orgUnits: OrgUnit[];
    private levels: L.GeoJSON[][] = [];
    private layers = [];
    private selectedPolygon;
    private maxLevelReached: boolean;

    private mapOptions: MapOptions[];
    private autoZoomOnSearch: boolean;
    private autoZoomOnGetChildren: boolean;
    private autoZoomOnSelect: boolean;

    private map;

    private drawControl; // : L.Control;
    private drawnItems = L.featureGroup();
    private editId;
    private previousDrawnItems = [];

    private eventsEnabled = true;

    private editTypePolygon: boolean;
    private markerAdd: boolean = false;
    private editOngoing: boolean = false;
    private editMarker = null;
    private previousEditMarker = null;

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

        // Get number of levels from GLOBAL, 4 hardcoded atm
        /*
        for (let i = 0; i < 4; i++) {
            this.levels.push([]);
        }
        */

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

        $("#marker-buttons").hide();

        this.drawControl = new L.Control.Draw({
            position: "topright",
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
            let type = e.layerType,
                layer = e.layer;

            ms.drawnItems.addLayer(layer);

            // map.flyToBounds(ms.drawnItems.getBounds(), {paddingTopLeft: [350, 75]})
        });

        this.map.on("click", (e: MouseEvent) => {
            if (this.markerAdd && this.drawnItems.getLayers().length === 0) {
                ms.editMarker = ms.mapService.createEditMarker(e.latlng);
                ms.drawnItems.addLayer(ms.editMarker);
                ms.editMarker.openPopup();
                ms.markerAdd = false;
            }
        });

        map.clicked = 0;
    }

    ngAfterViewInit(): void {
        // this.markerComponent.Initialize();
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
        this.fireEvent("optionsChanged");
    }

    startEditMode(orgUnitId: string, polygon: boolean): boolean {
        if (this.drawnItems.getLayers().length > 0) {
            let condition = this.drawnItems.getLayers()[0];

            if ((polygon && condition instanceof L.Marker) || ((!polygon) && condition instanceof L.Polygon)) {
                return false;
            }
        }
        this.drawnItems.addTo(this.map);

        this.editId = orgUnitId;
        this.fireEvent("setEditStyle");
        this.eventsEnabled = false;
        this.editTypePolygon = polygon;

        if (this.editTypePolygon) {
            this.drawControl.addTo(this.map);

            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.fireEvent("getPolygonCoordinates");
            }

        } else {
            this.markerAdd = false;
            $("#marker-buttons").show();
            
            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.fireEvent("getMarkerCoordinates");
            }
        }

        return true;
    }

    private loadEditMarker(existing): void {
        // Create "backup"
        this.previousEditMarker = this.mapService.createEditMarker(existing);

        this.editMarker = this.mapService.createEditMarker(existing);
        this.drawnItems.addLayer(this.editMarker);
        this.editMarker.openPopup();
    }

    private loadEditPolygon(existingData): void {
        const ms = this;

        console.log("existing: " + JSON.stringify(existingData));

        //if (existingData[0][0].length > 0) {
            let swappedcoords = [];

            for (let j of existingData) {

                console.log("per polygon");

                let innerJ = [];
                for (let k of j) {
                    let innerK = [];
                    innerK.push(k[1]);
                    innerK.push(k[0]);
                    innerJ.push(innerK);
                }

                let addBracket = [];
                addBracket.push(innerJ);
                swappedcoords.push(addBracket);
            }

            for (let i of swappedcoords) {
                this.drawnItems.addLayer(this.mapService.createEditPolygon(i));
            }
        //}

        // Create a backup of the editable layers
        this.previousDrawnItems = [];
        for (let l of this.drawnItems.getLayers()) {
            this.previousDrawnItems.push(this.mapService.createEditPolygon(l.getLatLngs()));
        }
    }

    endEditMode(saved: boolean): number[] {
        let coordinates = [];
        if (this.editTypePolygon) {
            if (saved) {
                this.previousDrawnItems = [];
                for (let lay of this.drawnItems.getLayers()) {
                    this.previousDrawnItems.push(this.mapService.createEditPolygon(lay.getLatLngs()));
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
            } else {

                this.drawnItems.clearLayers();
                for (let prevLay of this.previousDrawnItems) {
                    this.drawnItems.addLayer(this.mapService.createEditPolygon(prevLay.getLatLngs()));
                }
            }

            this.drawControl.remove();

        } else {
            if (saved) {
                // Update "backup" marker
                if (this.drawnItems.getLayers().length > 0) {
                    let coords = this.editMarker.getLatLng();
                    this.previousEditMarker = this.mapService.createEditMarker(coords);

                    // this.map.remove(this.editMarker);
                    coordinates.push(coords.lng);
                    coordinates.push(coords.lat);
                } else {
                    // Just in case
                    this.editMarker = null;
                    this.previousEditMarker = null;
                }
            } else {
                this.drawnItems.clearLayers();

                if (this.previousEditMarker !== null) {
                    this.editMarker = this.mapService.createEditMarker(this.previousEditMarker.getLatLng());
                    this.drawnItems.addLayer(this.editMarker);

                } else {
                    this.editMarker = null;
                    this.previousEditMarker = null;
                }
            }

            $("#marker-buttons").hide();
        }

        this.drawnItems.remove();
        this.fireEvent("selectedChanged");
        this.eventsEnabled = true;

        return coordinates;
    }

    clearEditData(): void {
        this.drawnItems.clearLayers();
        this.previousDrawnItems = [];
        this.editMarker = null;
        this.previousEditMarker = null;
        this.editOngoing = true;
    }

    endEdit(): void {
        this.drawnItems.clearLayers();
        this.previousDrawnItems = [];

        this.markerAdd = false;
        this.editMarker = null;
        this.previousEditMarker = null;
        this.editOngoing = false;
    }

    toggleAddMarker(): void {
        if (this.drawnItems.getLayers().length === 0 && !this.markerAdd) {
            this.markerAdd = true;
        } else {
            this.markerAdd = false;
        }
    }

    removeMarker(): void {
        if (this.editMarker !== null) {
            this.drawnItems.clearLayers();
            this.editMarker = null;
        }
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
        this.fireEvent("selectedChanged");
    }

    private fireEvent(event: string): void {
        for (let l of this.levels) {
            for (let p of l) {
                p.fire(event);
            }
        }
    }

    private addMapElement(orgUnits: OrgUnit[], maxLevelReached: boolean, doFly: boolean) {
        // this.orgUnits = orgUnits;
        let map = this.map;
        let allCoords = [];
        const ms = this;

        // For each orgUnit in the argument array
        for (let org of orgUnits) {

            let levelIndex = org.level - 1;
            let id = org.id;

            if (org.level > this.levels.length) {
                for (let i = this.levels.length; i < org.level; i++) {
                    this.levels.push([]);
                }
            }

            // Check if orgUnit contains coordinates
            //if (org.coordinates !== undefined) {
            if (org.featureType !== FeatureType.NONE) {

                // Coordinates is gathered in the form of a string, needs to parse it into [[[x,y],[x,y]],[[x,y]]] number array

                // Check if coordinate indicate a polygon (and not a single point --- marker)
                //if (org.coordinates[1] === "[") {
                if (org.featureType === FeatureType.MULTI_POLYGON || org.featureType === FeatureType.POLYGON) {
                    // Set up polygon information
                    let poly = ({
                        "type": "Feature",
                        "properties": {"id": org.id, "name": org.displayName},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": ms.mapService.parsePolygonCoordinates(org.coordinates)
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
                        if (ms.eventsEnabled) {
                            this.setStyle(function(feature) {
                                if (ms.selectedPolygon !== feature.properties.id) {
                                    return {color: ms.mapOptions[levelIndex].borderHoverColor, fillColor: ms.mapOptions[levelIndex].hoverColor, weight: +ms.mapOptions[levelIndex].borderHoverWeight, fillOpacity: +ms.mapOptions[levelIndex].hoverOpacity, opacity: +ms.mapOptions[levelIndex].borderHoverOpacity};
                                }
                            });

                            this.toggleTooltip();
                        }
                    })
                    .addEventListener("mouseout", function(e) {
                        if (ms.eventsEnabled) {
                            this.setStyle(function(feature) {

                                if (ms.selectedPolygon !== feature.properties.id) {
                                    return {color: ms.mapOptions[levelIndex].borderColor, fillColor: ms.mapOptions[levelIndex].color, weight: +ms.mapOptions[levelIndex].borderWeight, fillOpacity: +ms.mapOptions[levelIndex].opacity, opacity: +ms.mapOptions[levelIndex].borderOpacity};
                                }
                            });
                        }
                    })
                    .addEventListener("click", function(e) {
                        if (ms.eventsEnabled) {
                            map.clicked = map.clicked + 1;
                            setTimeout(function() {
                                if (map.clicked === 1 && ms.selectedPolygon !== id) {
                                    ms.selectedPolygon = id;
                                    ms.orgUnitService.callOnMapClick(id, false);
                                    ms.fireEvent("selectedChanged");
                                }

                                map.clicked = 0;
                            }, 250);
                        }
                    })
                    .addEventListener("dblclick", function(e) {
                        if (ms.eventsEnabled) {
                            map.clicked = 0;

                            if (!(maxLevelReached)) {
                                ms.selectedPolygon = "";
                                ms.orgUnitService.callOnMapClick(id, true);
                                ms.fireEvent("selectedChanged");
                            }
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
                                data = feature.geometry.coordinates;

                                return {color: "black", fillColor: "blue", weight: 0, fillOpacity: 0, opacity: 0};
                            } else {
                                return {color: "black", fillColor: "black", weight: 1, fillOpacity: 0.2, opacity: 1};
                            }
                        });
                    })
                    .addEventListener("getPolygonCoordinates", function(e) {
                        this.setStyle(function(feature) {
                            if (id === ms.editId) {
                                ms.loadEditPolygon(feature.geometry.coordinates);
                            }
                        });
                    });

                    allCoords.push(tempGeo.getBounds());
                    ms.levels[levelIndex].push(tempGeo);

                } else if (org.featureType === FeatureType.POINT) {
                    // Markers for single point locations
                    let level: any = ms.levels[org.level - 1]; // Hack to force L.Markers into array

                    let markerCoordinate = JSON.parse(org.coordinates);
                    allCoords.push([markerCoordinate[1], markerCoordinate[0]]);

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
                    let markerlatlng = L.latLng(markerCoordinate[1], markerCoordinate[0]);
                    let tempMark = L.marker(markerlatlng, markOptions)
                    .addEventListener("click", function(e) {
                        if (ms.eventsEnabled) {
                            ms.selectedPolygon = id;
                            ms.orgUnitService.callOnMapClick(id, false);
                            ms.fireEvent("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        if (id === ms.selectedPolygon && ms.autoZoomOnSelect) {
                            this.setIcon(highIcon);

                            let coords = this.getLatLng();
                            map.flyTo([coords.lat, coords.lng - 0.0004], 18);

                        } else {
                            this.setIcon(defIcon);
                        }

                        this.setOpacity(1);
                    })
                    .addEventListener("optionsChanged", function(e) {
                        // Don't do anything for markers yet, probably no options for markers ever
                    })
                    .addEventListener("getMarkerCoordinates", function(e) {
                        if (id === ms.editId) {
                            ms.loadEditMarker(this.getLatLng());
                        }
                    })
                    .addEventListener("setEditStyle", function(e) {
                        if (id === ms.editId) {
                            // Hide icon temporarily
                            this.setOpacity(0);
                        }
                    });

                    level.push(tempMark);
                } else {
                    alert("featuretype was symbol");
                }
            }
        }

        // Remove layers to not create duplicates when they are added
        // back towards the end of the function
        for (let l of ms.layers) {
            l.remove();
        }

        ms.layers = [];
        for (let l of ms.levels) {
            ms.layers.push(L.layerGroup(l));
        }

        /*
        ms.layers.push(L.layerGroup(ms.levels[0]));
        ms.layers.push(L.layerGroup(ms.levels[1]));
        ms.layers.push(L.layerGroup(ms.levels[2]));
        ms.layers.push(L.layerGroup(ms.levels[3]));
        */

        for (let l of ms.layers) {
            l.addTo(ms.map);
        }

        if (allCoords.length !== 0 && doFly) {
            map.flyToBounds(allCoords, {paddingTopLeft: [350, 75]});
        }
    }
}
