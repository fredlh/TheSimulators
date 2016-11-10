import { Injectable }                                           from "@angular/core";
import { Headers, Http, Response }                              from "@angular/http";
import { Observable }                                           from "rxjs/Observable";

import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/map";
import "rxjs/Rx";

import { MapService }                                           from "./map.service";

import { OrgUnitLevelsUpdateInterface}                          from "../core/org-unit-levels-update.interface";
import { OrgUnitGroupsUpdateInterface}                          from "../core/org-unit-groups-update.interface";

import { AccordionComponent }                                   from "../components/accordion/accordion.component";
import { SideBarComponent }                                     from "../components/side-bar/side-bar.component";
import { OrgUnit }                                              from "../core/org-unit.class";
import { Globals, OrganisationUnitLevel, OrganisationUnitGroup} from "../globals/globals.class";


@Injectable()
export class OrgUnitService {

    // private serverUrl = "http://localhost:8082/api/";
    private serverUrl = "https://play.dhis2.org/test/api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json", "Authorization": this.basicAuth});

    private orgUnits: OrgUnit[] = [];
    private orgUnitStack: OrgUnit[][] = [];

    private sideBar: SideBarComponent;
    private accordion: AccordionComponent;
    private orgUnitLevelsUpdateListeners: OrgUnitLevelsUpdateInterface[] = [];
    private orgUnitGroupsUpdateListeners: OrgUnitGroupsUpdateInterface[] = [];

    private lastApiUrlCall: string = "";
    private lastApiSearch: string = null;

    constructor(private http: Http, private mapService: MapService) {
        // Get all the organisation unit groups
        this.refreshOrganisationUniGroups();

         // Get all the organisation unit levels
        this.refreshOrganisationUnitLevels();
    }

    refreshOrganisationUnitLevels(): void {
        this.getOrganisationUnitLevels().subscribe(res => {

            let levels: OrganisationUnitLevel[] = res.organisationUnitLevels;
            levels = levels.sort((a, b) => (a.level - b.level));

            Globals.organisationUnitLevels = [];
            for (let level of levels) {
                Globals.organisationUnitLevels.push(level);
            }
            this.callOrgUnitLevelsUpdate();
        });
    }


    refreshOrganisationUniGroups(): void {
        this.getOrganisationUnitGroups().subscribe(res => {
            let groups: OrganisationUnitGroup[] = res.organisationUnitGroups;

            Globals.organisationUnitGroups = [];
            for (let group of groups) {
                Globals.organisationUnitGroups.push(group);
            }
            this.callOrgUnitGroupsUpdate();
        });
    }


    registerOrgUnitLevelsListener(listener: OrgUnitLevelsUpdateInterface) {
        this.orgUnitLevelsUpdateListeners.push(listener);
    }

    registerOrgUnitGroupsListener(listener: OrgUnitGroupsUpdateInterface) {
        this.orgUnitGroupsUpdateListeners.push(listener);
    }

    registerSideBar(sideBar: SideBarComponent) {
        this.sideBar = sideBar;
    }

    registerAccordion(accordion: AccordionComponent) {
        this.accordion = accordion;
    }

    // Retrieves all the organisation groups levels
    getOrganisationUnitLevels(): any {
        return this.getRequest(`organisationUnitLevels?fields=:all&paging=false`);
    }

    saveOrganisationUnitLevel(orgUnitLevel: OrganisationUnitLevel): any {
        return this.http
            .post(`${this.serverUrl}/organisationUnitLevels`, JSON.stringify(orgUnitLevel), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    deleteOrganisationUnitLevel(orgUnitLevelId: string): any {
        return this.http
            .delete(`${this.serverUrl}/organisationUnitLevels/${orgUnitLevelId}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    updateOrganisationUnitLevel(orgUnitLevel: OrganisationUnitLevel): any {
        return this.http
            .put(`${this.serverUrl}/organisationUnitLevels/${orgUnitLevel.id}`, JSON.stringify(orgUnitLevel), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    // Retrives all the organisation unit groups
    getOrganisationUnitGroups(): any {
        return this.getRequest(`organisationUnitGroups?fields=:all&paging=false`);
    }

    // Retrives the organisation unit with the given id
    getOrgUnit(orgUnitId: string): any {
        this.lastApiUrlCall = `getOrgUnit|${orgUnitId}`;
        return this.getRequest(`organisationUnits/${orgUnitId}?fields=:all&paging=false`);
    }

    getOrgUnitAsPromise(orgUnitId: string): Promise<any> {
        return this.http.
                get(`${this.serverUrl}/organisationUnits/${orgUnitId}?fields=:all&paging=false`, {headers: this.headers})
               .toPromise()
               .then(response => response.json() as OrgUnit)
               .catch(this.handleError);
    }

    // Retrives the organisation unit with the given id and all its children
    getOrgUnitWithChildren(orgUnitId: string): any {
        this.lastApiUrlCall = `getOrgUnitWithChildren|${orgUnitId}`;
        return this.getRequest(`organisationUnits/${orgUnitId}?includeChildren=true&fields=:all&paging=false`);
    }

    // Retrieves all the organisation units matching the given query
    getOrgUnits(query: string): any {
        this.lastApiUrlCall = `getOrgUnits|${query}`;
        this.lastApiSearch = query;
        return this.getRequest(`organisationUnits?paging=false&fields=:all${query}`);
    }

    // A general http.get request with a request parameter to retrieve a specific thing
    getRequest(request: string): any {
        return this.http
            .get(`${this.serverUrl}/${request}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    saveOrganisationUnit(orgUnit: OrgUnit): any {
        return this.http
            .post(`${this.serverUrl}/organisationUnits`, JSON.stringify(orgUnit), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    deleteOrganisationUnit(orgUnitId): any {
        return this.http
            .delete(`${this.serverUrl}/organisationUnits/${orgUnitId}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    saveOrganisationUnitGroup(orgUnitGroup): any {
        return this.http
            .post(`${this.serverUrl}/organisationUnitGroups`, JSON.stringify(orgUnitGroup), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    deleteOrganisationUnitGroup(orgUnitGroupId: string): any {
        return this.http
            .delete(`${this.serverUrl}/organisationUnitGroups/${orgUnitGroupId}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    updateOrganisationUnitGroup(orgUnitGroup: OrganisationUnitGroup): any {
        return this.http
            .put(`${this.serverUrl}/organisationUnitGroups/${orgUnitGroup.id}`, JSON.stringify(orgUnitGroup), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    getOrganisationUnitGroup(orgUnitId: string): any {
        return this.getRequest(`organisationUnitGroups/${orgUnitId}?fields=:all&paging=false`);
    }

    updateOrgUnit(orgUnit: OrgUnit): any {
        return this.http
            .put(`${this.serverUrl}/organisationUnits/${orgUnit.id}`, JSON.stringify(orgUnit), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
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
    getOrgUnitAndChildren(orgUnitID: string, pushToStack = true, checkForIdenticalArrays = false): void {
        this.getOrgUnitWithChildren(orgUnitID).subscribe(res => {

            if (checkForIdenticalArrays) {
                if (this.containsSameOrgUnits(this.orgUnits, res.organisationUnits)) {
                    pushToStack = false;
                }
            }

            if (pushToStack) this.orgUnitStack.push(this.orgUnits);

            this.orgUnits = res.organisationUnits;

            if (pushToStack) {
                this.mapService.draw(this.orgUnits, false);
                this.sideBar.updateList(this.orgUnits);
            }
        });
        return;
    }

    gotoOrgUnit(parentId: string, orgUnitId: string): void {
        this.mapService.endEditMode();
        this.getOrgUnitAndChildren(parentId, false);
        this.lastApiUrlCall = `getOrgUnitWithChildren|${parentId}`;
    }

    gotoParent(parentId: string): void {
        this.mapService.endEditMode();
        this.getOrgUnitAndChildren(parentId, false);
        this.lastApiUrlCall = `getOrgUnitWithChildren|${parentId}`;
    }

    returnToLastStackFrame(): void {
        let retValue = this.getPreviousStackFrame();

        if (retValue !== undefined) {
            this.orgUnits = retValue;

            this.mapService.draw(this.orgUnits, false);
            this.sideBar.updateList(this.orgUnits);
            this.lastApiUrlCall = "getOrgUnitWithChildren|" + this.orgUnits[0].id;
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
        this.mapService.draw(this.orgUnits, true);
    }

    mapGetChildren(orgUnitId: string): void {
        this.getOrgUnitAndChildren(orgUnitId);
    }

    callOrgUnitLevelsUpdate(): void {
        for (let listener of this.orgUnitLevelsUpdateListeners) {
            listener.onOrgUnitLevelsUpdate();
        }
    }

    callOrgUnitGroupsUpdate(): void {
        for (let listener of this.orgUnitGroupsUpdateListeners) {
            listener.onOrgUnitGroupsUpdate();
        }
    }


    refreshOrgUnits(): void {
        let lastCalls = this.lastApiUrlCall.split("|");
        let onSearch = false;


        if (lastCalls[0] === "getOrgUnitWithChildren" && this.orgUnitStack.length !== 0) {
            this.getOrgUnitAndChildren(lastCalls[1], false);
        }

        else if (this.orgUnitStack.length === 0) {
            this.getOrgUnits(this.lastApiSearch).subscribe(res => {
                this.orgUnits = res.organisationUnits;
                onSearch = true;
                this.sideBar.updateList(this.orgUnits);
                this.mapService.draw(this.orgUnits, onSearch);
            });
        }

        if (!onSearch) {
            this.sideBar.updateList(this.orgUnits);
            this.mapService.draw(this.orgUnits, onSearch);
        }
    }

    containsSameOrgUnits(a: OrgUnit[], b: OrgUnit[]): boolean {
        if (!a || !b) return false;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i++) {
            if (a[i].id !==  b[i].id) {
                return false;
            }
        }

        return true;
    }
}