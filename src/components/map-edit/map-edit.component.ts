import { Component, OnInit }                from "@angular/core";
import { MapService }                       from "../../services/map.service";
import { MouseEvent }                       from "leaflet";


const leafletDraw = require("leaflet-draw");

@Component({
    selector: "map-edit",
    template: require<any>("./map-edit.component.html"),
    styles: [ require<any>("./map-edit.component.less") ]
})

export class MapEditComponent implements OnInit {
    // Controls to draw, edit and delete polygons
    private drawControl;

    // To have map clicks add markers or not
    private markerAdd: boolean = false;

    // Edit variables
    private editOngoing: boolean = false;
    private editId;
    private editTypePolygon: boolean;

    // Current and backup (in case of cancel action) of edit elements
    private drawnItems = L.featureGroup();
    private previousDrawnItems = [];
    private editMarker = null;
    private previousEditMarker = null;

    private map;


    constructor(private mapService: MapService) {}

    ngOnInit(): void {
        let self = this;

        this.map = this.mapService.map;
        this.mapService.registerMapEdit(this);

        // Set up marker creation on map click
        this.map.on("click", (e: MouseEvent) => {
            if (this.markerAdd && this.drawnItems.getLayers().length === 0) {
                self.editMarker = self.createEditMarker(e.latlng);
                self.drawnItems.addLayer(self.editMarker);
                self.editMarker.openPopup();
                self.markerAdd = false;
            }
        });

        // Set up polygon draw, edit and delete controls
        this.drawControl = new (L as any).Control.Draw({
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

        this.map.on("draw:created", function(e) {
            self.drawnItems.addLayer(e.layer);
        });

        $("#marker-buttons").hide();
    }

    // Create a new marker from a given location
    createEditMarker(latlng): any {
        let coords = JSON.parse(JSON.stringify(latlng));
        return L.marker(coords, {
            icon: L.icon({
                iconUrl: require<any>("../../../node_modules/leaflet/dist/images/marker-icon.png"),
                shadowUrl: require<any>("../../../node_modules/leaflet/dist/images/marker-shadow.png"),
                iconSize: [26, 40],
                iconAnchor: [13, 40],
                shadowAnchor: [13, 40]
            }),
            draggable: true
        , zIndexOffset: 1000})
        .bindPopup("current organisation unit marker", {
            offset: L.point(0, -35)
        });
    }

    // Create a new polygon from a given set of locations
    createEditPolygon(latlngs): any {
        return L.polygon(JSON.parse(JSON.stringify(latlngs)), {
            color: "#f06eaa",
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null,
            fillOpacity: 0.2
        });
    }

    // Start edit mode for a given org unit
    // If the org unit contains a polygon or not (marker/point) as an argument
    startEdit(orgUnitId: string, polygon: boolean): void {
        // Prepare edit mode by adding the group of edit layers,
        // setting the id, changing the style of polygons to a default
        // edit style, disable click, doubleclick and hover events and
        // store the type of element
        this.drawnItems.addTo(this.map);
        this.editId = orgUnitId;
        this.mapService.fireEvent("setEditStyle");
        this.mapService.disableEvents();
        this.editTypePolygon = polygon;

        // Polygon
        if (this.editTypePolygon) {
            // Polygons need the polygon edit controls on screen
            this.drawControl.addTo(this.map);

            // If it's a new edit of an existing polygon, retrieve its coordinates
            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.mapService.fireEvent("getPolygonCoordinates");
            }

        // Marker
        } else {
            this.markerAdd = false;

            // Markers need the marker edit controls on screen
            $("#marker-buttons").show();

            // If it's a new edit of an existing marker, retrieve its coordinates
            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.mapService.fireEvent("getMarkerCoordinates");
            }
        }
    }

    // Called by the marker with id equal to editId
    loadEditMarker(existing): void {
        // Create backup to be able to cancel modifications
        this.previousEditMarker = this.createEditMarker(existing);

        // Create and add the edit marker
        this.editMarker = this.createEditMarker(existing);
        this.drawnItems.addLayer(this.editMarker);
        this.editMarker.openPopup();
    }

    // Called by the polygon with id equal to editId
    loadEditPolygon(existingData): void {
        const ms = this;
        let swappedcoords = [];

        // Convert lnglat coordinates to latlng
        for (let j of existingData) {
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

        // Create each individual subfigure as its own polygon
        for (let i of swappedcoords) {
            this.drawnItems.addLayer(this.createEditPolygon(i));
        }

        // Create a backup of the editable layers to be able to cancel modifications
        this.previousDrawnItems = [];
        for (let l of this.drawnItems.getLayers()) {
            this.previousDrawnItems.push(this.createEditPolygon((l as L.Polygon).getLatLngs()));
        }
    }

    // Called when the user clicks save or cancel in edit mode
    endEdit(saved: boolean): number[] {
        let coordinates = [];

        // Polygon
        if (this.editTypePolygon) {

            // Saved
            // Extract and create return array with correct buildup
            if (saved) {
                this.previousDrawnItems = [];
                for (let lay of this.drawnItems.getLayers()) {
                    // Update the backup with the new data
                    this.previousDrawnItems.push(this.createEditPolygon((lay as L.Polygon).getLatLngs()));
                    let subfigure = [];

                    // Export coords from layer
                    let lats = (lay as any).getLatLngs();
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

            // Not saved
            // Restore data from backup to make sure all edits are reset
            } else {
                this.drawnItems.clearLayers();
                for (let prevLay of this.previousDrawnItems) {
                    this.drawnItems.addLayer(this.createEditPolygon(prevLay.getLatLngs()));
                }
            }

            // Hide the draw control
            this.drawControl.remove();

        // Marker
        } else {

            // Saved
            if (saved) {
                // Update backup marker with the new data
                if (this.drawnItems.getLayers().length > 0) {
                    let coords = this.editMarker.getLatLng();
                    this.previousEditMarker = this.createEditMarker(coords);

                    coordinates.push(coords.lng);
                    coordinates.push(coords.lat);

                // Just in case, if there is no marker, reset everything
                } else {
                    this.editMarker = null;
                    this.previousEditMarker = null;
                }

            // Not saved
            // Restore data from backup to make sure all edits are reset
            } else {
                this.drawnItems.clearLayers();

                if (this.previousEditMarker !== null) {
                    this.editMarker = this.createEditMarker(this.previousEditMarker.getLatLng());
                    this.drawnItems.addLayer(this.editMarker);

                } else {
                    this.editMarker = null;
                    this.previousEditMarker = null;
                }
            }

            // Hide the marker control
            $("#marker-buttons").hide();
        }

        // Remove edits from map, enable click/hover events and tell polygons to update style
        this.drawnItems.remove();
        this.mapService.fireEvent("selectedChanged");
        this.mapService.enableEvents();

        return coordinates;
    }

    // Called when user clicks reset coordinates
    // Resets everything and makes sure data is not loaded from existing elements
    clearEditData(): void {
        this.drawnItems.clearLayers();
        this.previousDrawnItems = [];
        this.editMarker = null;
        this.previousEditMarker = null;
        this.editOngoing = true;
    }

    // Called when user saves or cancels outer edit window
    // Reset everything from edit mode
    endEditMode(): void {
        this.drawnItems.clearLayers();
        this.previousDrawnItems = [];

        this.markerAdd = false;
        this.editMarker = null;
        this.previousEditMarker = null;
        this.editOngoing = false;
    }

    // Called by marker control button
    // Allows adding a single marker if no marker already exist for the element
    toggleAddMarker(): void {
        if (this.drawnItems.getLayers().length === 0 && !this.markerAdd) {
            this.markerAdd = true;
        } else {
            this.markerAdd = false;
        }
    }

    // Called by marker control button
    // Removes all markers for the element
    removeMarker(): void {
        if (this.editMarker !== null) {
            this.drawnItems.clearLayers();
            this.editMarker = null;
        }
    }
}
