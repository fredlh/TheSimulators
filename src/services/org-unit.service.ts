import { Injectable }   from "@angular/core";
import { Headers, Http} from "@angular/http";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/map";
import "rxjs/Rx";


import { OrgUnit }  from "../core/org-unit";

import { SideBarInterface } from "../core/side-bar.interface";
import { MapViewInterface }      from "../core/map-view.interface";

import { AccordionComponent } from "../components/accordion/accordion.component";


@Injectable()
export class OrgUnitService {

    private serverUrl = "https://play.dhis2.org/demo/api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json"});

    private orgUnits: OrgUnit[];

    private sideBar: SideBarInterface;
    private mapView: MapViewInterface;
    private accordion: AccordionComponent;

    constructor(private http: Http) {}

    registerSideBar(sideBar: SideBarInterface) {
        this.sideBar = sideBar;
    }

    registerMapView(mapView: MapViewInterface) {
        this.mapView = mapView;
    }

    registerAccordion(accordion: AccordionComponent) {
        this.accordion = accordion;
    }

    toggleSideBar(orgUnitId: string) {
        this.accordion.toggleSideBar(orgUnitId);
    }

    getOrgUnits(query: string): any {
        let apiUrl = `${this.serverUrl}/organisationUnits.json?paging=false&fields=:all${query}`;
        console.log("Requesting org units from api: " + apiUrl);
        this.headers.append("Authorization", "Basic " + btoa("admin:district"));
        return Observable.create(observer => {
          this.http
            .get(apiUrl, {headers: this.headers})
            .map(res => res.json())
            .subscribe((data) => {
             observer.next(data);
             observer.complete();
          });
        });
    }

    getOrgUnit(orgUnitId: string): any {
        let apiUrl = `${this.serverUrl}/organisationUnits/${orgUnitId}?includeChildren=true`;
        console.log("Requesting org unit with id from api: " + apiUrl);
        this.headers.append("Authorization", "Basic " + btoa("admin:district"));
        return Observable.create(observer => {
          this.http
            .get(apiUrl, {headers: this.headers})
            .map(res => res.json())
            .subscribe((data) => {
             observer.next(data);
             observer.complete();
          });
        });
    }

    search(term = "", level = "", maxLevel = ""): OrgUnit[] {
        if (term.trim() === "") {
            return undefined;
        }

        let searchUrl = "&query=" + term;
        if (level !== "") searchUrl += "&level=" + level;
        if (maxLevel !== "") searchUrl += "&maxLevel=" + maxLevel;

        this.getOrgUnits(searchUrl).subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOnSearch();
        });
       return this.orgUnits;
    }

    getAllOrgUnits(): void {
        this.getOrgUnits("").subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOnSearch();
        });
    }

    // Returns an array with the parent at index 0
    // and all its children afterwards
    getOrgUnitAndChildren(orgUnitID: string): void {
        this.getOrgUnit(orgUnitID).subscribe(res => {
            this.orgUnits = res.organisationUnits;

            if (this.orgUnits[0].level === 3) {
                this.mapView.draw(this.orgUnits, true);
                
            } else {
                this.mapView.draw(this.orgUnits, false);
            }

            this.sideBar.updateList(this.orgUnits);

        });
        return;
    }

    private handleError(error: any): any {
        console.error("ERROR: An error occured", error);
    }

    private callOnSearch(): void {
        this.sideBar.updateList(this.orgUnits);
        this.mapView.draw(this.orgUnits, false);
    }

    callOnMapClick(orgUnitId: string, doubleClick: boolean): void {
        if (doubleClick) {
            //this.sideBar.expandAndScrollToOrgUnit(orgUnitId);
            this.getOrgUnitAndChildren(orgUnitId);
        } else {
            this.toggleSideBar(orgUnitId);
            this.sideBar.scrollToOrgUnit(orgUnitId);
        }
        
    }

    callOnSideBarClick(orgUnitId: string): void {
        this.mapView.onSideBarClick(orgUnitId);
        //this.sideBar.expandAndScrollToOrgUnit(orgUnitId);
    }

    deselectMap(): void {
        this.mapView.deselectMap();
    }
}