import { Injectable }   from "@angular/core";
import { Headers, Http} from "@angular/http";
import { Observable } from 'rxjs/Observable';

import "rxjs/add/operator/toPromise";
import 'rxjs/add/operator/map';
import 'rxjs/Rx';


import { OrgUnit }  from "../core/org-unit";


@Injectable()
export class OrgUnitService {

    private serverUrl = "https://play.dhis2.org/demo/api";
    private basicAuth = `Basic ${btoa('admin:district')}`;
    private headers = new Headers({'Content-Type': 'application/json'});

    private orgUnits: OrgUnit[];

    constructor(private http: Http) {}

    
    getOrgUnits(): any {
        this.headers.append('Authorization', "Basic " + btoa("admin:district"));
        return Observable.create(observer => {
          this.http
            .get(`${this.serverUrl}/organisationUnits.json?paging=false&level=2`, {headers: this.headers})
            .map(res => res.json())
            .subscribe((data) => {
             observer.next(data);
             observer.complete();
          });
        });
    }


    setOrgUnits(orgUnits: OrgUnit[]): void {
        this.orgUnits = orgUnits;
    }

    getSavedOrgUnits(): OrgUnit[] {
        return this.orgUnits;
    }


    private handleError(error: any): any {
        console.error("An error occured", error);
    }
}