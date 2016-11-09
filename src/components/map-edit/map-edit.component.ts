import { Component, OnInit }                from "@angular/core";

import { MouseEvent }                       from "leaflet";
import { MapService }                       from "../../services/map.service";

const leafletDraw = require("leaflet-draw");

@Component({
    selector: "map-edit",
    template: require<any>("./map-edit.component.html"),
    styles: [ require<any>("./map-edit.component.less") ]
})

export class MapEditComponent implements OnInit {
    private drawControl;
    private markerAdd: boolean = false;
    private editOngoing: boolean = false;

    private editId;
    private editTypePolygon: boolean;

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

        this.map.on("click", (e: MouseEvent) => {
            if (this.markerAdd && this.drawnItems.getLayers().length === 0) {
                self.editMarker = self.createEditMarker(e.latlng);
                self.drawnItems.addLayer(self.editMarker);
                self.editMarker.openPopup();
                self.markerAdd = false;
            }
        });

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

        this.map.on("draw:created", function(e: L.DrawEvents.Created) {
            let type = e.layerType,
                layer = e.layer;

            self.drawnItems.addLayer(layer);
        });

        $("#marker-buttons").hide();
    }

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

    createEditPolygon(latlngs): any {
        return L.polygon(JSON.parse(JSON.stringify(latlngs)), {
            color: "#f06eaa",
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null,
            fillOpacity: 0.2,
        });
    }

    startEdit(orgUnitId: string, polygon: boolean): void {
        this.drawnItems.addTo(this.map);

        this.editId = orgUnitId;
        this.mapService.fireEvent("setEditStyle");
        this.mapService.disableEvents();
        this.editTypePolygon = polygon;

        if (this.editTypePolygon) {
            this.drawControl.addTo(this.map);

            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.mapService.fireEvent("getPolygonCoordinates");
            }

        } else {
            this.markerAdd = false;
            $("#marker-buttons").show();

            if (!((this.editOngoing) || (orgUnitId === ""))) {
                this.editOngoing = true;
                this.mapService.fireEvent("getMarkerCoordinates");
            }
        }
    }

    loadEditMarker(existing): void {
        // Create "backup"
        this.previousEditMarker = this.createEditMarker(existing);

        this.editMarker = this.createEditMarker(existing);
        this.drawnItems.addLayer(this.editMarker);
        this.editMarker.openPopup();
    }

    loadEditPolygon(existingData): void {
        const ms = this;

        // if (existingData[0][0].length > 0) {
            let swappedcoords = [];

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

            for (let i of swappedcoords) {
                this.drawnItems.addLayer(this.createEditPolygon(i));
            }
        // }

        // Create a backup of the editable layers
        this.previousDrawnItems = [];
        for (let l of this.drawnItems.getLayers()) {
            this.previousDrawnItems.push(this.createEditPolygon(l.getLatLngs()));
        }
    }

    endEdit(saved: boolean): number[] {
        let coordinates = [];
        if (this.editTypePolygon) {
            if (saved) {
                this.previousDrawnItems = [];
                for (let lay of this.drawnItems.getLayers()) {
                    this.previousDrawnItems.push(this.createEditPolygon(lay.getLatLngs()));
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
                    this.drawnItems.addLayer(this.createEditPolygon(prevLay.getLatLngs()));
                }
            }

            this.drawControl.remove();

        } else {
            if (saved) {
                // Update "backup" marker
                if (this.drawnItems.getLayers().length > 0) {
                    let coords = this.editMarker.getLatLng();
                    this.previousEditMarker = this.createEditMarker(coords);

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
                    this.editMarker = this.createEditMarker(this.previousEditMarker.getLatLng());
                    this.drawnItems.addLayer(this.editMarker);

                } else {
                    this.editMarker = null;
                    this.previousEditMarker = null;
                }
            }

            $("#marker-buttons").hide();
        }

        this.drawnItems.remove();
        this.mapService.fireEvent("selectedChanged");
        this.mapService.enableEvents();

        return coordinates;
    }

    clearEditData(): void {
        this.drawnItems.clearLayers();
        this.previousDrawnItems = [];
        this.editMarker = null;
        this.previousEditMarker = null;
        this.editOngoing = true;
    }

    endEditMode(): void {
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
}