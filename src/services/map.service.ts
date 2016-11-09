import {Injectable} from "@angular/core";

import {Location} from "../core/location.class";
import { MapViewComponent } from "../components/map-view/map-view.component";
import { MapEditComponent } from "../components/map-edit/map-edit.component";
import { SideBarComponent } from "../components/side-bar/side-bar.component";
import { AccordionComponent } from "../components/accordion/accordion.component";

import { Globals } from "../globals/globals.class";

import { OrgUnit } from "../core/org-unit.class";

import {Map} from "leaflet";

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

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

    parsePolygonCoordinates(coordinatesAsString: string): any {
        let parsedCoordinates = [];
        let polygons = JSON.parse(coordinatesAsString);

        for (let poly of polygons) {
            parsedCoordinates.push(poly[0]);
        }

        return parsedCoordinates;
    }

    fireEvent(event: string): void {
        this.mapView.fireEvent(event);
    }

    enableEvents(): void {
        this.mapView.enableEvents();
    }

    disableEvents(): void {
        this.mapView.disableEvents();
    }

    loadEditPolygon(arg: any): void {
        this.mapEdit.loadEditPolygon(arg);
    }

    loadEditMarker(arg: any): void {
        this.mapEdit.loadEditMarker(arg);
    }

    startEdit(orgUnitId: string, polygon: boolean): void {
        this.mapView.setEditId(orgUnitId);
        this.mapEdit.startEdit(orgUnitId, polygon);
    }

    endEdit(saved: boolean): number[] {
        return this.mapEdit.endEdit(saved);
    }

    draw(orgUnits: OrgUnit[], maxLevelReached: boolean, onSearch: boolean): void {
        this.mapView.draw(orgUnits, maxLevelReached, onSearch);
    }

    selectMap(orgUnitId: string): void {
        this.mapView.selectMap(orgUnitId);
    }

    deselectMap(): void {
        this.mapView.selectMap("");
    }

    onMapOptionsSaved(): void {
        this.mapView.onMapOptionsSaved();
    }

    endEditMode(): void {
        this.mapEdit.endEditMode();
    }

    clearMapEditData(): void {
        this.mapEdit.clearEditData();
    }

    onFilter(orgUnits: OrgUnit[]): void {
        this.draw(orgUnits, false, true);
    }

    mapSelect(orgUnitId: string): void {
        this.accordion.toggleOrgUnitInSideBar(orgUnitId);
        this.sideBar.scrollToOrgUnit(orgUnitId);
    }
}
