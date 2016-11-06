import { Injectable, OnInit }   from "@angular/core";
import { Headers, Http, Response} from "@angular/http";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/map";
import "rxjs/Rx";


import { OrgUnit }  from "../core/org-unit";

import { SideBarInterface } from "../core/side-bar.interface";
import { MapViewInterface }      from "../core/map-view.interface";
import { GlobalsUpdateInterface} from "../core/globals-update.interface";

import { AccordionComponent } from "../components/accordion/accordion.component";

import {Globals, OrganisationUnitLevel, OrganisationUnitGroup} from "../globals/globals"


@Injectable()
export class OrgUnitService {

    //private serverUrl = "http://localhost:8082/api/";
    private serverUrl = "https://play.dhis2.org/demo/api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json"});

    private orgUnits: OrgUnit[] = [];
    private orgUnitStack: OrgUnit[][] = [];

    private sideBar: SideBarInterface;
    private mapView: MapViewInterface;
    private accordion: AccordionComponent;
    private globalsUpdateListeners: GlobalsUpdateInterface[] = [];

    constructor(private http: Http) {
        // Get all the organisation unit levels
        this.getOrganisationUnitLevels().subscribe(res => {
            let levels: OrganisationUnitLevel[] = res.organisationUnitLevels;
            for (let level of levels) {
                Globals.organisationUnitLevels.push(level);
            }
            this.callOnGlobalsUpdate();
        });

        // Get all the organisation unit groups
        this.getOrganisationUnitGroups().subscribe(res => {
            let groups: OrganisationUnitGroup[] = res.organisationUnitGroups;
            for (let group of groups) {
                Globals.organisationUnitGroups.push(group);
            }
        });
    }

    registerGlobalsUpdateListener(listener: GlobalsUpdateInterface) {
        this.globalsUpdateListeners.push(listener);
    }

    registerSideBar(sideBar: SideBarInterface) {
        this.sideBar = sideBar;
    }

    registerMapView(mapView: MapViewInterface) {
        this.mapView = mapView;
    }

    registerAccordion(accordion: AccordionComponent) {
        this.accordion = accordion;
    }

    // Retrieves all the organisation groups levels
    getOrganisationUnitLevels(): any {
        return this.getRequest(`organisationUnitLevels.json?fields=:all&paging=false`);            
    }

    // Retrives all the organisation unit groups
    getOrganisationUnitGroups(): any {
        return this.getRequest(`organisationUnitGroups.jsonfields=:all&paging=false`);                
    }

    // Retrieves all the organisation units matching the given query
    getOrgUnits(query: string): any {
        return this.getRequest(`organisationUnits.json?paging=false&fields=:all${query}`);      
    }

    // Retrives the organisation unit with the given id and all its children
    getOrgUnit(orgUnitId: string): any {
        return this.getRequest(`organisationUnits/${orgUnitId}?includeChildren=true`);
    }

    // A general http.get request with a request parameter to retrieve a specific thing
    getRequest(request: string): any {
        let apiUrl = `${this.serverUrl}/${request}`;
        console.log("Requesting org unit. API URL:\n" + apiUrl);
        this.headers.append("Authorization", this.basicAuth);
        
        return Observable.create(observer => {
            this.http
            .get(apiUrl, {headers: this.headers})
            .map(res => res.json())
            .subscribe((data) => {
                observer.next(data);
                observer.complete();
          }, (error) => {
                alert("Error during retrieving of an organisation unit");
          });
        });
    }

    saveOrganisationUnit(orgUnit: OrgUnit): any {
        let apiUrl = `${this.serverUrl}/organisationUnits`;
        console.log("Saving org unit:\n" + JSON.stringify(orgUnit) + "\nURL: " + apiUrl);        
        this.headers.append("Authorization", this.basicAuth);
        
        return this.http
            .post(apiUrl, JSON.stringify(orgUnit), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || "Server error"));        
    }

    deleteOrganisationUnit(orgUnitId): any {
        let apiUrl = `${this.serverUrl}/organisationUnits/${orgUnitId}`;
        this.headers.append("Authorization", this.basicAuth);

        return Observable.create(observer => {
            this.http
            .delete(apiUrl, {headers: this.headers})
            .subscribe((res) => {
                observer.next(res);
                observer.complete();
            }, (error) => {
                alert("Error during deletion of an organisation unit");
            });
        });
    }


    updateOrgUnit(orgUnit: OrgUnit): any {
        let apiUrl = `${this.serverUrl}/organisationUnits/${orgUnit.id}`;
        this.headers.append("Authorization", this.basicAuth);

        return this.http
            .put(apiUrl, JSON.stringify(orgUnit), {headers: this.headers})
            .map(res => res.json());
    }


    startEditMode(orgUnitId: string, polygon: boolean): boolean {
        Globals.setInEditMode(polygon);
        return this.mapView.startEditMode(orgUnitId, polygon);
    }

    // endEditMode(saved: boolean): number[][][][] {
    endEditMode(saved: boolean): number[] {
        Globals.endInEditMode();
        return this.mapView.endEditMode(saved);
    }

    search(term = "", level = "", maxLevel = ""): OrgUnit[] {
        if (term.trim() === "") {
            return undefined;
        }

        let searchUrl = "&query=" + term;
        if (level !== "") searchUrl += "&level=" + level;
        if (maxLevel !== "") searchUrl += "&maxLevel=" + maxLevel;

        this.orgUnitStack = [];

        this.getOrgUnits(searchUrl).subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOnSearch();
        });
       return this.orgUnits;
    }

    getAllOrgUnits(): void {
        this.orgUnitStack = [];

        this.getOrgUnits("").subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOnSearch();
        });
    }

    // Returns an array with the parent at index 0
    // and all its children afterwards
    getOrgUnitAndChildren(orgUnitID: string): void {
        this.getOrgUnit(orgUnitID).subscribe(res => {
            this.orgUnitStack.push(this.orgUnits);
            this.orgUnits = res.organisationUnits;

            if (this.orgUnits[0].level === 3) {
                this.mapView.draw(this.orgUnits, true, false);

            } else {
                this.mapView.draw(this.orgUnits, false, false);
            }

            this.sideBar.updateList(this.orgUnits);

        });
        return;
    }

    gotoOrgUnit(orgUnitId: string): void {
        // TODO: Fix this without any errors
        
    }

    returnToLastStackFrame(): void {
        let retValue = this.getPreviousStackFrame();

        if (retValue !== undefined) {
            this.orgUnits = retValue;

            this.mapView.draw(this.orgUnits, false, false);
            this.sideBar.updateList(this.orgUnits);
        }
    }

    hasPreviousStackFrame(): boolean {
        return (this.orgUnitStack.length > 0 ? true : false);
    }

    // Returns the last set of OrgUnits in the orgUnitStack
    // May return undefined
    private getPreviousStackFrame(): OrgUnit[] {
        return this.orgUnitStack.pop();
    }

    private handleError(error: any): any {
        console.error("ERROR: An error occured", error);
    }

    private callOnSearch(): void {
        this.sideBar.updateList(this.orgUnits);
        this.mapView.draw(this.orgUnits, false, true);
    }

    callOnMapClick(orgUnitId: string, doubleClick: boolean): void {
        if (doubleClick) {
            this.getOrgUnitAndChildren(orgUnitId);
        } else {
            this.accordion.toggleOrgUnitInSideBar(orgUnitId);
            this.sideBar.scrollToOrgUnit(orgUnitId);
        }
        
    }

    callOnSideBarClick(orgUnitId: string): void {
        this.mapView.onSideBarClick(orgUnitId);
    }

    callOnGlobalsUpdate(): void {
        for (let listener of this.globalsUpdateListeners) {
            listener.onOrganisationUnitLevelsUpdate();
        }
    }

    deselectMap(): void {
        this.mapView.deselectMap();
    }

    callOnOptionsSave(): void {
        this.mapView.onMapOptionsSave();
    }

    hideSideBar(): void {
        this.sideBar.hideSideBar();
    }

    unHideSideBar(): void {
        this.sideBar.unHideSideBar();
    }

    onFilter(orgUnits: OrgUnit[]): void {
        this.mapView.draw(orgUnits, false, true);
    }

    endAddOrEditOrgUnit(): void {
        this.mapView.endEdit();
    }

    clearMapEditData(): void {
        this.mapView.clearEditData();
    }
}