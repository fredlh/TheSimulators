import { Injectable }       from "@angular/core";

import { SideBarComponent } from "../components/side-bar/side-bar.component";

@Injectable()
export class SideBarService {

    private sideBar: SideBarComponent;

    registerSideBar(sideBar: SideBarComponent): void {
        this.sideBar = sideBar;
    }

    hideSideBar(): void {
        this.sideBar.hideSideBar();
    }

    unHideSideBar(): void {
        this.sideBar.unHideSideBar();
    }

    appendParent(orgUnitId: string): void {
        this.sideBar.appendParent(orgUnitId);
    }

}