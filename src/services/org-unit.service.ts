import { Injectable }   from "@angular/core";
import { Headers, Http} from "@angular/http";
import { Observable } from "rxjs/Observable";

import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/map";
import "rxjs/Rx";


import { OrgUnit }  from "../core/org-unit";

import { OrgUnitUpdate } from "../core/org-unit-update.interface";
import { DrawAble }      from "../core/draw-able.interface";


@Injectable()
export class OrgUnitService {

    private serverUrl = "https://play.dhis2.org/demo/api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json"});

    private orgUnits: OrgUnit[];

    private orgUnitUpdateListeners = [];
    private drawAbleComponents = [];

    constructor(private http: Http) {}

    registerOrgUnitUpdateListener(listener: OrgUnitUpdate) {
        this.orgUnitUpdateListeners.push(listener);
        console.log("Registerned listener: " + listener);
    }

    registerDrawAbleComponent(drawAble: DrawAble) {
        this.drawAbleComponents.push(drawAble);
    }

    getOrgUnits(query?: string): any {
        let apiUrl = `${this.serverUrl}/organisationUnits.json?paging=false&fields=:all`;
        if (query !== undefined && query.trim() !== "") {
            if (query.startsWith("&query")) {
                apiUrl += query;
            } else {
                apiUrl += "&query=" + query;
            }
        }
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

    search(term: string): OrgUnit[] {
        if (term.trim() === "") {
            return undefined;
        }
        this.getOrgUnits(term).subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOrgUnitUpdateListeners();
            this.callDrawDrawAbleComponents();
        });
       return this.orgUnits;
    }

    private handleError(error: any): any {
        console.error("An error occured", error);
    }

    private callOrgUnitUpdateListeners(): void {
        for (let listener of this.orgUnitUpdateListeners) {
            listener.onOrgUnitGet(this.orgUnits);
        }
    }

    private callDrawDrawAbleComponents(): void {
        for (let drawAble of this.drawAbleComponents) {
            drawAble.addPolygons(this.orgUnits);
        }
    }
}