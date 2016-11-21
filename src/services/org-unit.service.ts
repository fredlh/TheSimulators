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
import { AccordionGroupComponent }                              from "../components/accordion/accordion-group.component";
import { SideBarComponent }                                     from "../components/side-bar/side-bar.component";
import { OrgUnitGroupsComponent }                               from "../components/org-unit-groups/org-unit-groups.component";

import { OrgUnit }                                              from "../core/org-unit.class";
import { Globals, OrganisationUnitLevel, OrganisationUnitGroup} from "../globals/globals.class";

/*
 * This is a service for components/services which wishes to interact with the API.
 * It has get, delete, save and update for the following classes:
 * - Organisation Units
 *      - Also have the possibility to retrive a parent and all its children
 * - Organisation Unit Levels
 * - Organisation Unit Groups
 * 
 * This service also handles the orgUnitStack, which is a stack of all organisation units for the different levels
 * Makes it possible to traverse backwarse in the hierachy if you choses to view a orgUnits children
 * 
 * Since it's only two search fields in the app, and both providing the same functionality,
 * this service also handles the searchig
 */

@Injectable()
export class OrgUnitService {

    // Used during the API interaction
    private baseUrl = "http://localhost:8082/";
    private serverUrl = this.baseUrl + "api";
    private basicAuth = `Basic ${btoa("admin:district")}`;
    private headers = new Headers({"Content-Type": "application/json", "Authorization": this.basicAuth});

    // The orgUnit and the orgUnitStack
    private orgUnits: OrgUnit[] = [];
    private orgUnitStack: OrgUnit[][] = [];

    // Pointers to the various components the service need to interact with
    private sideBar: SideBarComponent;
    private accordion: AccordionComponent;
    private accordionGroup: AccordionGroupComponent;
    private orgUnitGroups: OrgUnitGroupsComponent;
    private orgUnitLevelsUpdateListeners: OrgUnitLevelsUpdateInterface[] = [];
    private orgUnitGroupsUpdateListeners: OrgUnitGroupsUpdateInterface[] = [];

    // Used to find the state of the last action
    // Needed for the back button
    private lastApiUrlCall: string = "";
    private lastApiSearch: string = null;


    constructor(private http: Http, private mapService: MapService) {
        // Get all the orgUnitLevels and orgUnitGroups from the API
        this.refreshOrganisationUniGroups();
        this.refreshOrganisationUnitLevels();
    }


    // Retrives all the orgUnitLevels from the API and sorts them based on level
    // Calls callOrgUnitLevelsUpdate() afterwards, which notfies all listeners of the update
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


    // Retrives all the orgUnitGroups from the API
    // Calls callOrgUnitGroupsUpdate() afterwards, which notifies all listeners of the update
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

    //
    // Register functions
    //

    // Register functions for the orgUnitLevels and orgUnitGroups listners
    // Every component which wishes to be notified can implement the interface and call the register function
    registerOrgUnitLevelsListener(listener: OrgUnitLevelsUpdateInterface) {
        this.orgUnitLevelsUpdateListeners.push(listener);
    }

    registerOrgUnitGroupsListener(listener: OrgUnitGroupsUpdateInterface) {
        this.orgUnitGroupsUpdateListeners.push(listener);
    }


    // The service needs to interact directly with some components
    // Those components will call the appropiate register function during initalization
    registerSideBar(sideBar: SideBarComponent) {
        this.sideBar = sideBar;
    }

    registerAccordion(accordion: AccordionComponent) {
        this.accordion = accordion;
    }

    registerGroupAccordion(groupAccordion: AccordionGroupComponent) {
        this.accordionGroup = groupAccordion;
    }

    registerOrgUnitGroups(orgUnitGroups: OrgUnitGroupsComponent) {
        this.orgUnitGroups = orgUnitGroups;
    }

    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        this.orgUnitGroups.orgUnitGroupOpened(orgUnitGroupId, orgUnitGroupIndex);
    }


    //
    // API functions
    //

    // A general http.get request used in all get functions
    // - request: the request, including API and all paramters
    getRequest(request: string): any {
        return this.http
            .get(`${this.serverUrl}/${request}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

    // A generic http.post request used in all save functions
    // - api: the api to use, either organisationUnits, organisationUnitLevels or organisationUnitGroups
    // - unit: the orgUnit, orgUnitLevel or orgUnitGroup to save
    saveRequest(api: string, unit: OrgUnit | OrganisationUnitGroup | OrganisationUnitLevel): any {
        return this.http
            .post(`${this.serverUrl}/${api}`, JSON.stringify(unit), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }

     // A generic http.put request used in all update functions
    // - api: the api to use, either organisationUnits, organisationUnitLevels or organisationUnitGroups
    // - unit: the orgUnit, orgUnitLevel or orgUnitGroup to update
    updateRequest(api: string, unit: OrgUnit | OrganisationUnitGroup | OrganisationUnitLevel): any {
        return this.http
            .put(`${this.serverUrl}/${api}/${unit.id}`, JSON.stringify(unit), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }


    // A generic http.delete request used in all delete functions
    // - api: the api to use, either organisationUnits, organisationUnitLevels or organisationUnitGroups
    // - id: the id of the unit, group or level to delete
    deleteRequest(api: string, id: string): any {
        return this.http
            .delete(`${this.serverUrl}/${api}/${id}`, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error));
    }


    // Organisation Units
    getOrgUnit(orgUnitId: string): any {
        this.lastApiUrlCall = `getOrgUnit|${orgUnitId}`;
        return this.getRequest(`organisationUnits/${orgUnitId}?fields=:all&paging=false`);
    }

    getOrgUnitAsPromise(orgUnitId: string): Promise<any> {
        return this.http.
                get(`${this.serverUrl}/organisationUnits/${orgUnitId}?fields=:all&paging=false`, {headers: this.headers})
               .toPromise()
               .then(response => response.json() as OrgUnit)
               .catch((error: any) => Promise.reject(new Error("Unable to find orgUnit")));
    }

    getOrgUnitWithChildren(orgUnitId: string): any {
        this.lastApiUrlCall = `getOrgUnitWithChildren|${orgUnitId}`;
        return this.getRequest(`organisationUnits/${orgUnitId}?includeChildren=true&fields=:all&paging=false`);
    }

    getOrgUnits(query: string): any {
        this.lastApiUrlCall = `getOrgUnits|${query}`;
        this.lastApiSearch = query;
        return this.getRequest(`organisationUnits?paging=false&fields=:all${query}`);
    }

    saveOrganisationUnit(orgUnit: OrgUnit): any {
        return this.saveRequest("organisationUnits", orgUnit);
    }

    updateOrgUnit(orgUnit: OrgUnit): any {
        return this.updateRequest("organisationUnits", orgUnit);
    }

    deleteOrganisationUnit(orgUnitId): any {
        return this.deleteRequest("organisationUnits", orgUnitId);
    }


    // Organisation Unit Levels
    getOrganisationUnitLevels(): any {
        return this.getRequest(`organisationUnitLevels?fields=:all&paging=false`);
    }

    saveOrganisationUnitLevel(orgUnitLevel: OrganisationUnitLevel): any {
        return this.saveRequest("organisationUnitLevels", orgUnitLevel);
    }

    updateOrganisationUnitLevel(orgUnitLevel: OrganisationUnitLevel): any {
        return this.updateRequest("organisationUnitLevels", orgUnitLevel);
    }

    deleteOrganisationUnitLevel(orgUnitLevelId: string): any {
        return this.deleteRequest("organisationUnitLevels", orgUnitLevelId);
    }


    // Organisation Unit Groups
    getOrganisationUnitGroups(): any {
        return this.getRequest(`organisationUnitGroups?fields=:all&paging=false`);
    }

    getOrganisationUnitGroup(orgUnitId: string): any {
        return this.getRequest(`organisationUnitGroups/${orgUnitId}?fields=:all&paging=false`);
    }

    saveOrganisationUnitGroup(orgUnitGroup): any {
        return this.saveRequest("organisationUnitGroups", orgUnitGroup);
    }

    updateOrganisationUnitGroup(orgUnitGroup: OrganisationUnitGroup): any {
        return this.updateRequest("organisationUnitGroups", orgUnitGroup);
    }

    deleteOrganisationUnitGroup(orgUnitGroupId: string): any {
        return this.deleteRequest("organisationUnitGroups", orgUnitGroupId);
    }


    // Returns an array with the parent at index 0 and all its children afterwards
    // - pushToStack: Whether to push the search result to the stack or notfies
    // - checkForIdenticalArrays: Whether to perform a sarch for identical orgUnits
    //                            If true, and identical units found, result will not get pushed to the stack 
    getOrgUnitAndChildren(orgUnitID: string, pushToStack = true, checkForIdenticalArrays = false): void {
        this.getOrgUnitWithChildren(orgUnitID).subscribe(res => {

            // Checks for identical arrays by comparing every element in both arrays
            // If found to be identical, the result won't get pushed to the stack
            if (checkForIdenticalArrays) {
                if (this.containsSameOrgUnits(this.orgUnits, res.organisationUnits)) {
                    pushToStack = false;
                }
            }

            // Push the previous orgUnits to the stack before assigning the new one
            if (pushToStack) this.orgUnitStack.push(this.orgUnits);

            // Assign the new orgUnits
            this.orgUnits = res.organisationUnits;

            // Only call sideBar and mapService if there's any new data to display
            if (pushToStack) {
                this.mapService.draw(this.orgUnits, false);
                this.sideBar.updateList(this.orgUnits);
            }
        });

        return;
    }


    // Called when the user wants to search for an orgUnit
    // Can specify a term to query for, a level and a mexLevel
    search(term = "", level = "", maxLevel = ""): OrgUnit[] {
        // Ignore an empty search
        if (term.trim() === "") {
            return undefined;
        }

        // Build the search url with the given arguments
        let searchUrl = "&query=" + term;
        if (level !== "All") searchUrl += "&level=" + level;
        if (maxLevel !== "None") searchUrl += "&maxLevel=" + maxLevel;

        // A search resets the stack
        this.orgUnitStack = [];

        // Retrieve the orgUnits an call the listeners for onSearch
        this.getOrgUnits(searchUrl).subscribe(res => {
            this.orgUnits = res.organisationUnits;
            this.callOnSearch();
        });

       return this.orgUnits;
    }

    // Notifies the sideBar and the mapService with the new data
    private callOnSearch(): void {
        this.sideBar.updateList(this.orgUnits);
        this.mapService.draw(this.orgUnits, true);
    }


    // Returns to the last view, which is the view before retrieving the last orgUnits children
    returnToLastStackFrame(): void {
        let retValue = this.getPreviousStackFrame();

        // A previous view was found
        // Update orgUnits and call the mapService and sideBar with the new data
        if (retValue) {
            this.orgUnits = retValue;

            this.mapService.draw(this.orgUnits, false);
            this.sideBar.updateList(this.orgUnits);
            this.lastApiUrlCall = "getOrgUnitWithChildren|" + this.orgUnits[0].id;
        }
    }

    // Returns whether the stack has a previous view or not
    hasPreviousStackFrame(): boolean {
        return (this.orgUnitStack.length > 0 ? true : false);
    }

    // Returns the previous view
    private getPreviousStackFrame(): OrgUnit[] {
        return this.orgUnitStack.pop();
    }


    // The user has double-clicked on the map to retrieve children
    mapGetChildren(orgUnitId: string): void {
        this.getOrgUnitAndChildren(orgUnitId, true, true);
    }


    // Notifies all listeners of an orgUnitLevels update
    private callOrgUnitLevelsUpdate(): void {
        for (let listener of this.orgUnitLevelsUpdateListeners) {
            listener.onOrgUnitLevelsUpdate();
        }
    }

    // Notifies all listeners of an orgUnitGroups update
    private callOrgUnitGroupsUpdate(): void {
        for (let listener of this.orgUnitGroupsUpdateListeners) {
            listener.onOrgUnitGroupsUpdate();
        }
    }


    // Refreshes the current orgUnits seen in the sideBar and on the map
    refreshOrgUnits(): void {
        // Get the last API call to figure out the previous state
        let lastCalls = this.lastApiUrlCall.split("|");
        let onSearch = false;

        // If it was get children, get the children of the same orgUnit
        if (lastCalls[0] === "getOrgUnitWithChildren" && this.orgUnitStack.length !== 0) {
            this.getOrgUnitAndChildren(lastCalls[1], false);
        }

        // If the stack is empty, the last action was a search
        // Perform a search with the same query, and notify the sideBar and mapService
        else if (this.orgUnitStack.length === 0) {
            this.getOrgUnits(this.lastApiSearch).subscribe(res => {
                this.orgUnits = res.organisationUnits;
                onSearch = true;
                this.sideBar.updateList(this.orgUnits);
                this.mapService.draw(this.orgUnits, onSearch);
            });
        }

        // The search notifies the sideBar and mapService when complete,
        // so only notify them here if it wasn't a search
        if (!onSearch) {
            this.sideBar.updateList(this.orgUnits);
            this.mapService.draw(this.orgUnits, onSearch);
        }
    }

    // Returns whether two arrays contain the same orgUnits or not
    private containsSameOrgUnits(a: OrgUnit[], b: OrgUnit[]): boolean {
        if (!a || !b) return false;
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i++) {
            if (a[i].id !==  b[i].id) {
                return false;
            }
        }

        return true;
    }


    getSymbolUrl(): string {
        return this.baseUrl + "images/orgunitgroup/";
    }
}