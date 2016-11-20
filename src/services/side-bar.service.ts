import { Injectable }       from "@angular/core";

import { SideBarComponent } from "../components/side-bar/side-bar.component";

/*
 * This is a service for components/services which wishes to interact with the sideBar component.
 * It offers functions for hiding, showing and appending the orgUnits parent name in the orgUnit info
 */

@Injectable()
export class SideBarService {

    private sideBar: SideBarComponent;

    // The sideBar needs to register in the service during initialization
    registerSideBar(sideBar: SideBarComponent): void {
        this.sideBar = sideBar;
    }

    hideSideBar(): void {
        this.sideBar.hideSideBar();
    }

    unHideSideBar(): void {
        this.sideBar.unHideSideBar();
    }

    // Appends the name of the parent in the info-section
    // of the sideBar of the current selected orgUnit
    appendParent(orgUnitId: string): void {
        this.sideBar.appendParent(orgUnitId);
    }
}