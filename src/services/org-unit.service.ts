import { Injectable }   from "@angular/core";
import { Headers, Http} from "@angular/http";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/map";
import "rxjs/Rx";


import { OrgUnit }  from "../core/org-unit";

import { SideBarInterface } from "../core/side-bar.interface";
import { MapViewInterface }      from "../core/map-view.interface";


@Injectable()
export class OrgUnitService {

    private serverUrl = "https://play.dhis2.org/demo/api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json"});

    private orgUnits: OrgUnit[];

    private sideBar: SideBarInterface;
    private mapView : MapViewInterface;

    constructor(private http: Http) {}

    registerSideBar(sideBar: SideBarInterface) {
        this.sideBar = sideBar;
    }

    registerMapView(mapView: MapViewInterface) {
        this.mapView = mapView;
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

    private handleError(error: any): any {
        console.error("An error occured", error);
    }

    private callOnSearch(): void {
        this.sideBar.onSearch(this.orgUnits);
        this.mapView.onSearch(this.orgUnits);
    }

    callOnMapClick(orgUnitId: string): void {
        this.sideBar.onMapClick(orgUnitId);
    }

    callOnSideBarClick(orgUnitId: string): void {
        this.mapView.onSideBarClick(orgUnitId);
    }
}