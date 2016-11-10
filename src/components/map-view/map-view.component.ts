import { Component, ViewChild, OnInit } from "@angular/core";

import { OrgUnitService }               from "../../services/org-unit.service";
import { MapService }                   from "../../services/map.service";
import { GeocodingService }             from "../../services/geocoding.service";

import { NavigatorComponent }           from "../navigator/navigator.component";
import { MarkerComponent }              from "../marker/marker.component";

import { Location }                     from "../../core/location.class";
import { OrgUnit }                      from "../../core/org-unit.class";

import { OptionsComponent, MapOptions } from "../options/options.component";
import { Globals, FeatureType }         from "../../globals/globals.class";

import { MouseEvent }                   from "leaflet";

const leafletDraw = require("leaflet-draw");


@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit {
    // Holds all markers and polygons
    // [level][marker/polygon]
    private levels: L.GeoJSON[][] = [];

    // Markers/Polygons are put in seperate layers depending on level
    // Makes sure higher levels are "on top of" lower levels
    private layers = [];

    // User selected element, either through map click or selected in side bar
    private selectedElement;

    // Do zoom or not, set using options panel in the UI
    private autoZoomOnSearch: boolean;
    private autoZoomOnGetChildren: boolean;
    private autoZoomOnSelect: boolean;

    private map;

    // Used as part of editing
    // When editing:
    //   -  Element with id = editId should be hidden
    //   -  Click and doubleclick events need to be disabled
    private editId;
    private eventsEnabled = true;

    // Locally stored styles for polygons, updated through the options panel in the UI
    private defaultStyle;
    private defaultHoverStyle;
    private defaultSelectedStyle;

    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService, private orgUnitService: OrgUnitService) {}

    ngOnInit(): void {
        let self = this;

        this.mapService.map = L.map("map", {
            zoomControl: false,
            center: L.latLng(40.731253, -73.996139),
            zoom: 12,
            minZoom: 4,
            maxZoom: 19,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });

        this.map = this.mapService.map;

        L.control.zoom({ position: "topright" }).addTo(this.map);
        L.control.layers(this.mapService.baseMaps).addTo(this.map);
        L.control.scale().addTo(this.map);

        // Fire event to resize icons depending on zoom
        this.map.on("zoom", function() {
            self.fireEvent("zoomIcon");
        });

        /*
        this.map.on("zoomend", function() {
            self.fireEvent("zoomIcon");
        });
        */

        this.mapService.registerMapView(this);
        let map = this.map;

        this.geocoder.getCurrentLocation()
            .subscribe(
                location => map.panTo([8.0, -12.5]).zoomOut(4),
                err => console.error(err)
            );

        // Initialize click counter
        // Used to prevent single click action for doubleclicks
        map.clicked = 0;
    }

    ngAfterViewInit(): void {
        this.onMapOptionsSaved();
    }

    onMapOptionsSaved(): void {
        this.autoZoomOnSearch = OptionsComponent.getAutoZoomOnSearch();
        this.autoZoomOnGetChildren = OptionsComponent.getAutoZoomOnGetChildren();
        this.autoZoomOnSelect = OptionsComponent.getAutoZoomOnSelect();

        // Fire changed options event
        this.fireEvent("optionsChanged");
    }

    enableEvents(): void {
        this.eventsEnabled = true;
    }

    disableEvents(): void {
        this.eventsEnabled = false;
    }

    setEditId(orgUnitId: string): void {
        this.editId = orgUnitId;
    }

    draw(orgUnits: OrgUnit[], onSearch: boolean): void {
        this.levels = [[], [], [], []];
        this.selectedElement = "";

        let doFly = ((this.autoZoomOnSearch && onSearch) || (this.autoZoomOnGetChildren && !onSearch));

        this.addMapElement(orgUnits, doFly);
    }

    drawAdditionalOrgUnits(orgUnits: OrgUnit[]): void {
        // Should it include max level from something else?
        // Should it fly to, according to parameter?

        this.addMapElement(orgUnits, false);
    }

    previewCoordinates(coords: number[][][][]): void {
        // Make polygon in seperate layer and display on map
    }

    selectMap(orgUnitId: string): void {
        // Set selected
        this.selectedElement = orgUnitId;

        // Tell all polygons to check, could also result in a fly to depending on settings
        this.fireEvent("selectedChanged");
    }

    fireEvent(event: string): void {
        for (let l of this.levels) {
            for (let p of l) {
                p.fire(event);
            }
        }
    }

    private addMapElement(orgUnits: OrgUnit[], doFly: boolean) {
        let map = this.map;
        let allCoords = [];
        const ms = this;

        // For each orgUnit in the argument array
        for (let org of orgUnits) {
            let levelIndex = org.level;
            let id = org.id;

            if (org.level > this.levels.length) {
                for (let i = this.levels.length; i < org.level; i++) {
                    this.levels.push([]);
                }
            }

            // Check if orgUnit contains coordinates
            if (org.featureType !== FeatureType.NONE) {
                // Coordinates is gathered in the form of a string, needs to parse it into [[[x,y],[x,y]],[[x,y]]] number array

                // Check if coordinate indicate a polygon (and not a single point --- marker)
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
                            return OptionsComponent.getMapOptionsDefault(levelIndex);
                        }
                    })
                    .addEventListener("mouseover", function(e) {
                        if (ms.eventsEnabled) {
                            this.setStyle(function(feature) {
                                if (ms.selectedElement !== feature.properties.id) {
                                    return OptionsComponent.getMapOptionsHover(levelIndex);
                                }
                            });

                            this.toggleTooltip();
                        }
                    })
                    .addEventListener("mouseout", function(e) {
                        if (ms.eventsEnabled) {
                            this.setStyle(function(feature) {
                                if (ms.selectedElement !== feature.properties.id) {
                                    return OptionsComponent.getMapOptionsDefault(levelIndex);
                                }
                            });
                        }
                    })
                    .addEventListener("click", function(e) {
                        if (ms.eventsEnabled) {
                            map.clicked = map.clicked + 1;
                            setTimeout(function() {
                                if (map.clicked === 1 && ms.selectedElement !== id) {
                                    ms.selectedElement = id;
                                    ms.mapService.mapSelect(id);
                                    ms.fireEvent("selectedChanged");
                                }

                                map.clicked = 0;
                            }, 250);
                        }
                    })
                    .addEventListener("dblclick", function(e) {
                        if (ms.eventsEnabled) {
                            map.clicked = 0;

                            ms.selectedElement = "";
                            ms.orgUnitService.mapGetChildren(id);
                            ms.fireEvent("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        let geo = this;
                        this.setStyle(function(feature) {
                            if (ms.selectedElement === feature.properties.id) {

                                if (ms.autoZoomOnSelect) {
                                    map.flyToBounds(geo.getBounds(), {paddingTopLeft: [350, 75]});
                                }

                                return OptionsComponent.getMapOptionsSelected(levelIndex);

                            } else {
                                return OptionsComponent.getMapOptionsDefault(levelIndex);
                            }
                        });
                    })
                    .addEventListener("optionsChanged", function(e) {
                        this.setStyle(function(feature) {
                            if (ms.selectedElement === feature.properties.id) {
                                return OptionsComponent.getMapOptionsSelected(levelIndex);

                            } else {
                                return OptionsComponent.getMapOptionsDefault(levelIndex);
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
                                ms.mapService.loadEditPolygon(feature.geometry.coordinates);
                            }
                        });
                    });

                    allCoords.push(tempGeo.getBounds());
                    ms.levels[levelIndex - 1].push(tempGeo);

                } else if (org.featureType === FeatureType.POINT) {
                    // Markers for single point locations
                    let level: any = ms.levels[org.level - 1]; // Hack to force L.Markers into array

                    // Fredrik: Ugly fix right now
                    // as it can have FeatureType.POINT and have undefined coordinates
                    if (org.coordinates === undefined) continue;

                    let markerCoordinate = JSON.parse(org.coordinates);
                    allCoords.push([markerCoordinate[1], markerCoordinate[0]]);

                    const defaultIcon = require("../../../images/ambulance_green.png");
                    const highlightIcon = require("../../../images/ambulance_red.png");

                    let currentZoom = this.map.getZoom();

                    let defIcon = L.icon({
                        iconUrl: "../../../images/ambulance_green.png",
                        iconSize: [4 * currentZoom, 4 * currentZoom],
                        iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
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
                            ms.selectedElement = id;
                            ms.mapService.mapSelect(id);
                            ms.fireEvent("selectedChanged");
                        }
                    })
                    .addEventListener("selectedChanged", function(e) {
                        let currentZoom = ms.map.getZoom();

                        if (id === ms.selectedElement) {
                            this.setIcon(L.icon({
                                iconUrl: "../../../images/ambulance_red.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));

                            if (ms.autoZoomOnSelect) {
                                let coords = this.getLatLng();
                                map.flyTo([coords.lat, coords.lng - 0.0004], 18);
                            }

                        } else {
                            this.setIcon(L.icon({
                                iconUrl: "../../../images/ambulance_green.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));
                        }

                        this.setOpacity(1);
                    })
                    .addEventListener("optionsChanged", function(e) {
                        // Don't do anything for markers yet, probably no options for markers ever
                    })
                    .addEventListener("getMarkerCoordinates", function(e) {
                        if (id === ms.editId) {
                            ms.mapService.loadEditMarker(this.getLatLng());
                        }
                    })
                    .addEventListener("setEditStyle", function(e) {
                        if (id === ms.editId) {
                            // Hide icon temporarily
                            this.setOpacity(0);
                        }
                    })
                    .addEventListener("zoomIcon", function (e) {
                        let currentZoom = ms.map.getZoom();

                        if (id === ms.selectedElement) {
                            this.setIcon(L.icon({
                                iconUrl: "../../../images/ambulance_red.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(currentZoom * 3) / 2, 4 * currentZoom]
                            }));
                        } else {
                            this.setIcon(L.icon({
                                iconUrl: "../../../images/ambulance_green.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));
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

        for (let l of ms.layers) {
            l.addTo(ms.map);
        }

        if (allCoords.length !== 0 && doFly) {
            map.flyToBounds(allCoords, {paddingTopLeft: [350, 75]});
        }
    }
}
