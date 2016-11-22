import { Injectable }           from "@angular/core";

import { MapViewComponent }     from "../components/map-view/map-view.component";
import { MapEditComponent }     from "../components/map-edit/map-edit.component";
import { SideBarComponent }     from "../components/side-bar/side-bar.component";
import { AccordionComponent }   from "../components/accordion/accordion.component";

import { OrgUnit }              from "../core/org-unit.class";
import { Location }             from "../core/location.class";

import { Globals }              from "../globals/globals.class";

import { Map }                  from "leaflet";

/*
 * This is a service between Map Edit and Map View, 
 * and between Map View and any component communicating with the map in any way
 * 
 * Contains the actual map used in Map View and Map Edit
 */


@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

    private currentOrgUnits: OrgUnit[] = [];

    private mapView: MapViewComponent;
    private mapEdit: MapEditComponent;
    private sideBar: SideBarComponent;
    private accordion: AccordionComponent;

    constructor() {
        let self = this;

        this.baseMaps = {
            OpenStreetMap: L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>`
            }),
            Esri: L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
                attribution: `Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community`
            }),
            CartoDB: L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
                attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>`
            })
        };
    }

    registerMapView(mapView: MapViewComponent): void {
        this.mapView = mapView;
    }

    registerSideBar(sideBar: SideBarComponent): void {
        this.sideBar = sideBar;
    }

    registerMapEdit(mapEdit: MapEditComponent): void {
        this.mapEdit = mapEdit;
    }

    registerAccordion(accordion: AccordionComponent): void {
        this.accordion = accordion;
    }

    disableMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
    };

    // DHIS coordinates are not directly compatible with leaflet
    // Parse and make compatible number arrays
    parsePolygonCoordinates(coordinatesAsString: string): any {
        let parsedCoordinates = [];
        let polygons = JSON.parse(coordinatesAsString);

        for (let poly of polygons) {
            parsedCoordinates.push(poly[0]);
        }

        return parsedCoordinates;
    }

    // Tigger events on the map
    fireEvent(event: string): void {
        this.mapView.fireEvent(event);
    }

    // Enable click, doubleclick and hover events on the map
    // Used to reenable after finishing edit modes
    enableEvents(): void {
        this.mapView.enableEvents();
    }

    // Disable click, doubleclick and hover events on the map
    // Used during edit modes
    disableEvents(): void {
        this.mapView.disableEvents();
    }

    // Called by the selected polygon to load its data to edit mode
    loadEditPolygon(arg: any): void {
        this.mapEdit.loadEditPolygon(arg);
    }

    // Called by the selected marker to load its data to edit mode
    loadEditMarker(arg: any): void {
        this.mapEdit.loadEditMarker(arg);
    }

    // Called to initiate edit mode for the map
    startEdit(orgUnitId: string, polygon: boolean): void {
        this.mapView.setEditId(orgUnitId);
        this.mapEdit.startEdit(orgUnitId, polygon);
    }

    // Called to end a single edit for the map
    // Does not reset edit mode variables
    // User still on edit screen
    endEdit(saved: boolean): number[] {
        return this.mapEdit.endEdit(saved);
    }

    // Called to fully end edit mode
    // Resets all edit mode variables
    endEditMode(): void {
        this.mapEdit.endEditMode();
    }

    // Draw the given organisation units on the map as polygons or markers
    // Only draws the organisation units with coordinates
    draw(orgUnits: OrgUnit[], onSearch: boolean): void {
        this.currentOrgUnits = orgUnits;

        this.mapView.draw(orgUnits, onSearch);
    }

    // Notification for the map about a select change in the side bar
    // Affects style for polygons and icon for markers
    // May include paning and zooming the map to the selected element
    selectMap(orgUnitId: string): void {
        this.mapView.selectMap(orgUnitId);
    }

    // Notification for the map about no selected elements
    // Affects style for polygons and icon for markers
    // May include paning and zooming the map to all elements
    deselectMap(): void {
        this.mapView.selectMap("");
    }

    getOrgUnitById(orgUnitId: string): OrgUnit {
        for (let o of this.currentOrgUnits) {
            if (o.id === orgUnitId) {
                return o;
            }
        }

        return undefined;
    }

    // Notification for the map about possible change in options
    // May affect style for polygons
    onMapOptionsSaved(): void {
        this.mapView.onMapOptionsSaved();
    }

    // Clear coordinate data for an element in edit mode
    // Makes sure no data is loaded from existing polygons or markers
    clearMapEditData(): void {
        this.mapEdit.clearEditData();
    }

    // Called when using filters to only draw the elements still in the results
    onFilter(orgUnits: OrgUnit[]): void {
        this.draw(orgUnits, true);
    }

    // Called by map to notify side bar about an element selection by map click
    mapSelect(orgUnitId: string): void {
        this.accordion.toggleOrgUnitInSideBar(orgUnitId);
        this.sideBar.scrollToOrgUnit(orgUnitId);
        this.sideBar.appendParent(orgUnitId);
    }
}
