import { Component, OnInit }            from "@angular/core";

import { OrgUnitService }               from "../../services/org-unit.service";
import { MapService }                   from "../../services/map.service";
import { GeocodingService }             from "../../services/geocoding.service";

import { OrgUnit }                      from "../../core/org-unit.class";

import { OptionsComponent }             from "../options/options.component";
import { FeatureType }                  from "../../globals/globals.class";

// Marker icons
const defaultIcon = require("../../../images/marker_default.png");
const highlightIcon = require("../../../images/marker_highlight.png");


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

    // Coordinates for all elements currently drawn
    // Used to pan/zoom so all elements are visible
    private allCoords = [];

    // Do zoom or not, set using options panel in the UI
    private autoZoomOnSearch: boolean;
    private autoZoomOnGetChildren: boolean;
    private autoZoomOnSelect: boolean;
    private autoZoomOnDeselect: boolean;
    private autoZoomOnSelectWoCoordinates: boolean;

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

        // Hack to make sure all layers are displayed correctly
        // even if fly to animation is stopped prematurely by user
        // Removes all layers and readds them
        this.map.on("moveend", function() {
            for (let l of self.layers) {
                l.remove();
            }

            for (let l of self.layers) {
                l.addTo(self.map);
            }
        });

        this.mapService.registerMapView(this);
        let map = this.map;

        // Set the default view to Sierra Leone
        map.panTo([8.0, -12.5]).zoomOut(4);

        // Initialize click counter
        // Used to prevent single click action for doubleclicks
        map.clicked = 0;
    }

    ngAfterViewInit(): void {
        // Retrieve default options
        this.onMapOptionsSaved();
    }

    onMapOptionsSaved(): void {
        this.autoZoomOnSearch = OptionsComponent.getAutoZoomOnSearch();
        this.autoZoomOnGetChildren = OptionsComponent.getAutoZoomOnGetChildren();
        this.autoZoomOnSelect = OptionsComponent.getAutoZoomOnSelect();
        this.autoZoomOnDeselect = OptionsComponent.getAutoZoomOnDeselect();
        this.autoZoomOnSelectWoCoordinates = OptionsComponent.getAutoZoomOnSelectWoCoordinates();

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

    // Draw a set of organisation units
    // Also wipes previously drawn units and resets the selected element
    draw(orgUnits: OrgUnit[], onSearch: boolean): void {
        this.levels = [[], [], [], []];
        this.selectedElement = "";

        // Calculate if a zoom to animation should occur
        let doFly = ((this.autoZoomOnSearch && onSearch) || (this.autoZoomOnGetChildren && !onSearch));

        this.addMapElement(orgUnits, doFly);
    }

    // Called when a org unit is selected on the side bar
    // Updates selected and fires event to make sure all drawn org units checks if they are it
    selectMap(orgUnitId: string): void {
        // Fredrik: Just change this to whatever fits the best in the current code
        // No coordinates, so nothing to zoom to
        if (this.allCoords.length === 0) {
            return;
        }

        this.selectedElement = orgUnitId;

        // Check if selected org unit indicates a deselection
        // Could result in a fly to "all" if options allow it
        if (orgUnitId === "") {
            if (this.allCoords.length !== 0 && this.autoZoomOnDeselect) {
                this.map.flyToBounds(this.allCoords, {paddingTopLeft: [350, 75]});
            }

        // Check if selected org unit contains coordinates
        // Could result in a fly to "all" if no coordinates and options allow it
        } else {
            let orgUnit = this.mapService.getOrgUnitById(orgUnitId);
            if ((orgUnit === undefined || orgUnit.coordinates === undefined) && this.autoZoomOnSelectWoCoordinates) {
                this.map.flyToBounds(this.allCoords, {paddingTopLeft: [350, 75]});
            }
        }

        // Tell all drawn elements to check if they are the new selected
        // If they are the new selected it could involve setting a new style
        // Could also result in a fly to depending on settings
        this.fireEvent("selectedChanged");
    }

    // Fires a given events for all drawn items
    fireEvent(event: string): void {
        for (let l of this.levels) {
            for (let p of l) {
                p.fire(event);
            }
        }
    }

    // Add a set of organisation units to the map
    // Only organisation units with coordinates are actually added
    private addMapElement(orgUnits: OrgUnit[], doFly: boolean) {
        // Build up a list of all coordinates to be able to zoom
        // in such a way that everything is visible afterwards
        this.allCoords = [];
        let allCoords = this.allCoords;
        let imagePath = this.orgUnitService.getImagePath();

        const self = this;

        // For each orgUnit in the argument array
        for (let org of orgUnits) {
            let levelIndex = org.level;
            let id = org.id;

            // Add more levels to the global levels array if encountering a higher level than previously seen
            if (org.level > this.levels.length) {
                for (let i = this.levels.length; i < org.level; i++) {
                    this.levels.push([]);
                }
            }

            // Check if orgUnit contains coordinates
            if (org.featureType !== FeatureType.NONE && org.coordinates !== undefined) {

                // Check if coordinate indicate a polygon
                if (org.featureType === FeatureType.MULTI_POLYGON || org.featureType === FeatureType.POLYGON) {

                    // Set up polygon information
                    let poly = ({
                        "type": "Feature",
                        "properties": {"id": org.id, "name": org.displayName},
                        "geometry": {
                            "type": "Polygon",
                            // Coordinates is gathered in the form of a string, needs to parse it into [[[x,y],[x,y]],[[x,y]]] number array
                            "coordinates": self.mapService.parsePolygonCoordinates(org.coordinates),
                            "smoothFactor": 10.0
                        }
                    });

                    // The polygon itself, with all its events
                    let tempGeo = L.geoJSON(poly, {
                        onEachFeature: function(feature, layer) {
                            layer.bindTooltip(feature.properties.name);
                        },
                        style: function(feature) {
                            return OptionsComponent.getMapOptionsDefault(levelIndex);
                        }
                    })
                    // Hovering the mouse over the organisation unit highlights it by a style change
                    // If the organisation unit is already the selected element then nothing happens
                    .addEventListener("mouseover", function(e) {
                        if (self.eventsEnabled) {
                            this.setStyle(function(feature) {
                                if (self.selectedElement !== feature.properties.id) {
                                    return OptionsComponent.getMapOptionsHover(levelIndex);
                                }
                            });

                            this.toggleTooltip();
                        }
                    })
                    // When hovering the organisation unit ends, the style is switched back
                    // If the organisation unit is already the selected element then nothing happens
                    .addEventListener("mouseout", function(e) {
                        if (self.eventsEnabled) {
                            this.setStyle(function(feature) {
                                if (self.selectedElement !== feature.properties.id) {
                                    return OptionsComponent.getMapOptionsDefault(levelIndex);
                                }
                            });
                        }
                    })
                    // Click performs a select of an organisation unit
                    // The style is changed, the side bar notified and a fly to might occur
                    .addEventListener("click", function(e) {
                        if (self.eventsEnabled) {
                            self.map.clicked = self.map.clicked + 1;
                            setTimeout(function() {
                                if (self.map.clicked === 1 && self.selectedElement !== id) {
                                    self.selectedElement = id;
                                    self.mapService.mapSelect(id);
                                    self.fireEvent("selectedChanged");
                                }

                                self.map.clicked = 0;
                            }, 250);
                        }
                    })
                    // Doubleclick performs a dive into an organisation unit
                    // All children of the org unit is retrieved from the server and displayed
                    .addEventListener("dblclick", function(e) {
                        if (self.eventsEnabled) {
                            self.map.clicked = 0;

                            self.selectedElement = "";
                            self.orgUnitService.mapGetChildren(id);
                            self.fireEvent("selectedChanged");
                        }
                    })
                    // Notification about a change in the selected element
                    // If this element is the selected, set style to the selected style
                    // Else set style to the default (non-selected and non-highlighted) style
                    // A fly to might also occur if this element is the selected and zoom option allows it
                    .addEventListener("selectedChanged", function(e) {
                        let geo = this;
                        this.setStyle(function(feature) {
                            if (self.selectedElement === feature.properties.id) {

                                if (self.autoZoomOnSelect) {
                                    self.map.flyToBounds(geo.getBounds(), {paddingTopLeft: [350, 75]});
                                }

                                return OptionsComponent.getMapOptionsSelected(levelIndex);

                            } else {
                                return OptionsComponent.getMapOptionsDefault(levelIndex);
                            }
                        });
                    })
                    // Notification about changes to the options
                    // Every polygon requests and sets the new style
                    .addEventListener("optionsChanged", function(e) {
                        this.setStyle(function(feature) {
                            if (self.selectedElement === feature.properties.id) {
                                return OptionsComponent.getMapOptionsSelected(levelIndex);

                            } else {
                                return OptionsComponent.getMapOptionsDefault(levelIndex);
                            }
                        });
                    })
                    // Notification saying an edit is about to start
                    // Change style to a default edit-style as to make sure the edited polygon stands out
                    // Hides the polygon who is to be edited
                    .addEventListener("setEditStyle", function(e) {
                        let data;

                        this.setStyle(function(feature) {
                            if (id === self.editId) {
                                data = feature.geometry.coordinates;

                                return {color: "black", fillColor: "blue", weight: 0, fillOpacity: 0, opacity: 0};
                            } else {
                                return {color: "black", fillColor: "black", weight: 1, fillOpacity: 0.2, opacity: 1};
                            }
                        });
                    })
                    // Notification about polygon coordinates request
                    // Only the polygon to be edited will answer by calling loadEditPolygon
                    .addEventListener("getPolygonCoordinates", function(e) {
                        this.setStyle(function(feature) {
                            if (id === self.editId) {
                                self.mapService.loadEditPolygon(feature.geometry.coordinates);
                            }
                        });
                    });

                    // Add polygon coordinates to the set of all coordinates (needed for fly-to)
                    allCoords.push(tempGeo.getBounds());

                    // Push the polygon to the correct level array
                    self.levels[levelIndex - 1].push(tempGeo);

                // Check if coordinate indicates a point/marker
                } else if (org.featureType === FeatureType.POINT) {
                    let level: any = self.levels[org.level - 1]; // Hack to force L.Markers into array
                    let id = org.id;

                    let markerCoordinate = JSON.parse(org.coordinates);

                    // Add marker to the set of all coordinates (needed to perform fly-to)
                    allCoords.push([markerCoordinate[1], markerCoordinate[0]]);

                    // Set up icon object
                    let currentZoom = this.map.getZoom();
                    let defIcon = L.icon({
                        iconUrl: imagePath + "marker_default.png",
                        iconSize: [4 * currentZoom, 4 * currentZoom],
                        iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                    });

                    // Set up marker information
                    let markOptions = ({
                        "title": org.displayName + " | coords: " + markerCoordinate,
                        "icon": defIcon
                    });

                    // The marker itself, with all its events
                    let markerlatlng = L.latLng(markerCoordinate[1], markerCoordinate[0]);
                    let tempMark = L.marker(markerlatlng, markOptions)
                    // Click performs a select of an organisation unit
                    // The icon is changed, the side bar notified and a fly to might occur
                    .addEventListener("click", function(e) {
                        if (self.eventsEnabled) {
                            self.selectedElement = id;
                            self.mapService.mapSelect(id);
                            self.fireEvent("selectedChanged");
                        }
                    })
                    // Notification about a change in the selected element
                    // If this element is the selected, set icon to the highlight icon
                    // Else set icon to the default icon
                    // A fly to might be performed if this element is the selected and zoom options allows it
                    .addEventListener("selectedChanged", function(e) {
                        let currentZoom = self.map.getZoom();

                        if (id === self.selectedElement) {
                            this.setIcon(L.icon({
                                iconUrl: imagePath + "marker_highlight.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));

                            if (self.autoZoomOnSelect) {
                                let coords = this.getLatLng();
                                self.map.flyTo([coords.lat, coords.lng - 0.0004], 18);
                            }

                        } else {
                            this.setIcon(L.icon({
                                iconUrl: imagePath + "marker_default.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));
                        }

                        this.setOpacity(1);
                    })
                    // Notification about marker coordinates request
                    // Only the marker to be edited will answer by calling loadEditMarker
                    .addEventListener("getMarkerCoordinates", function(e) {
                        if (id === self.editId) {
                            self.mapService.loadEditMarker(this.getLatLng());
                        }
                    })
                    // Notification saying an edit is about to start
                    // Hides the marker who is to be edited
                    .addEventListener("setEditStyle", function(e) {
                        if (id === self.editId) {
                            this.setOpacity(0);
                        }
                    })
                    // Notification saying a zoom was performed
                    // Resizes the icon dynamically using zoom level
                    .addEventListener("zoomIcon", function (e) {
                        let currentZoom = self.map.getZoom();

                        if (id === self.selectedElement) {
                            this.setIcon(L.icon({
                                iconUrl: imagePath + "marker_highlight.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(currentZoom * 3) / 2, 4 * currentZoom]
                            }));
                        } else {
                            this.setIcon(L.icon({
                                iconUrl: imagePath + "marker_default.png",
                                iconSize: [4 * currentZoom, 4 * currentZoom],
                                iconAnchor: [(4 * currentZoom) / 2, 4 * currentZoom]
                            }));
                        }
                    });

                    // Push the marker to the correct level array
                    level.push(tempMark);

                // Only other possibility is symbol, but don't know what to do with it atm
                } else {
                    alert("featuretype was symbol");
                }
            }
        }

        // Remove layers to not create duplicates when they are added
        // back towards the end of the function
        for (let l of self.layers) {
            l.remove();
        }

        // Reset layers and push all levels to it
        self.layers = [];
        for (let l of self.levels) {
            self.layers.push(L.layerGroup(l));
        }

        // Add all layers back to the map
        for (let l of self.layers) {
            l.addTo(self.map);
        }

        // If options allow it, fly to the bounds containing every element added
        if (allCoords.length !== 0 && doFly) {
            self.map.flyToBounds(allCoords, {paddingTopLeft: [350, 75]});
        }
    }
}
