import { Component, OnInit, AfterViewInit, OnChanges, AfterContentChecked }    from "@angular/core";

import { OrgUnit }  from "../../core/org-unit";

import { OrgUnitService } from "../../services/org-unit.service";

import { SideBarInterface } from "../../core/side-bar.interface";

import { Constants} from "../../constants/constants";

declare var $: any;

@Component({
    selector: "side-bar",
    template: require<any>("./side-bar.component.html"),
    styles: [ require<any>("./side-bar.component.less") ]
})

export class SideBarComponent implements SideBarInterface, OnInit {
    private orgUnits: OrgUnit[] = null;
    private displayedOrgUnits = null;
    private sideBarVisible = false;
    private levelToNameMap: String[] = Constants.nameToLevelMapping;

    private filterAreaVisible: boolean = false;

    private filterApplied:boolean = false;

    private selectedOrgUnit: OrgUnit = new OrgUnit();

    constructor(private orgUnitService: OrgUnitService) {}

    updateList(orgUnits: OrgUnit[]): void {
        if (orgUnits.length === 0) {
            this.orgUnits = null;
        } else {
            this.orgUnits = orgUnits;
        }

        this.displayedOrgUnits = [];
        if (this.orgUnits !== null) {
            for (let o of this.orgUnits) {
                this.displayedOrgUnits.push(JSON.parse(JSON.stringify(o)));
            }
        }

        this.toggleSideBar(true);
        $("#toggleSideBar").show();
        this.filterApplied = false;
        $("filterArea").hide();
    }

    scrollToOrgUnit(orgUnitId: string) {
        setTimeout(function() {
            $("#sideBar").animate({
                scrollTop: $("#" + orgUnitId).position().top + $("#sideBar").scrollTop() - 40
            }, 500);
        }, 100);
    }

    ngOnInit(): void {
        this.orgUnitService.registerSideBar(this);

    }

    toggleSideBar(show?: Boolean): void {
        if (show === undefined) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;
        }

        if (show === true && this.sideBarVisible !== true) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;

        } else if (show === false && this.sideBarVisible !== false) {
            $("#sideBar").toggle("show");
            this.sideBarVisible = !this.sideBarVisible;
        }

        if (!this.sideBarVisible && this.filterAreaVisible) {
            $("#filterArea").toggle();   
        } else if (this.sideBarVisible && this.filterAreaVisible) {
            $("#filterArea").toggle();   

        }
    }

    getChildren(orgUnitId: string) {
        this.orgUnitService.getOrgUnitAndChildren(orgUnitId);
    }

    goToPreviousOrgUnits(): void {
        this.orgUnitService.returnToLastStackFrame();
    }

    hasPreviousStackFrame(): boolean {
        return this.orgUnitService.hasPreviousStackFrame();
    }

    editOrgUnit(orgUnitId: string) {
        this.showEditOrgUnitPanel();
        this.closeSideBar();
        
        this.selectedOrgUnit = this.getOrgUnitById(orgUnitId);

        let tmpThis = this;
        
        $(".edit-org-unit-close").click(function() {
            document.getElementById("editOrgUnitArea").style.display = "none";
            $("#sideBar").show();
            $("#toggleSideBar").show();
            if (this.filterAreaVisible) {
                $("#filterArea").show();
            }
            tmpThis.orgUnitService.endAddOrEditOrgUnit();
        });

        window.onclick = function(event) {
            let options = document.getElementById("editOrgUnitArea");
            if (event.target === options) {
                options.style.display = "none";
                $("#sideBar").show();
                $("#toggleSideBar").show();
                if (tmpThis.filterAreaVisible) {
                    $("#filterArea").show();
                }
                tmpThis.orgUnitService.endAddOrEditOrgUnit();
            }
        };
    }

    deleteOrgUnit(orgUnitId: string) {
        console.log("Delete: " + orgUnitId);
    }

    closeSideBar(): void {
        $("#sideBar").hide();
        $("#toggleSideBar").hide();
        $("#filterArea").hide();
    }

    showSideBar(): void {
        if (this.sideBarVisible) {
            $("#sideBar").show();
            $("#toggleSideBar").show();
        }

        if (this.filterAreaVisible) {
            $("#filterArea").show();
        }
    }

    onSubmit(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
        this.showSideBar();
        this.orgUnitService.endAddOrEditOrgUnit();
    }

    onCancel(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
        $("#sideBar").show();
        $("#toggleSideBar").show();
        if (this.filterAreaVisible) {
            $("#filterArea").show();
        }
        this.orgUnitService.endAddOrEditOrgUnit();
    }

    closeEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "none";
    }

    showEditOrgUnitPanel(): void {
        document.getElementById("editOrgUnitArea").style.display = "block";
    }

    drawOrgUnitPolygon(): void {
        this.closeSideBar();
        this.closeEditOrgUnitPanel();

        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.orgUnitService.startEditMode(this.selectedOrgUnit.id);
    }


    drawOrgUnitMarker(): void {

    }

    saveDrawnOrgUnit(): void {
        this.selectedOrgUnit.coordinates = this.orgUnitService.endEditMode(true);
        $("#editOrgUnitPanelArea").slideToggle("fast");
        this.editOrgUnit(this.selectedOrgUnit.id);
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);
        $("#editOrgUnitPanelArea").slideToggle("fast");

        this.editOrgUnit(this.selectedOrgUnit.id);
    }



    getOrgUnitById(orgUnitId: string): OrgUnit {
        for (let o of this.orgUnits) {
            if (o.id === orgUnitId) return o;
        }
        return null;
    }




    toggleFilter(): void {
        $("#filterArea").slideToggle("fast");
        this.filterAreaVisible = !this.filterAreaVisible;
    }

    applyFilter(name: string, nameFilter: string, level: string): void {
        console.log("name: " + name + " | filter: " + nameFilter + " | level: " + level);

        this.displayedOrgUnits = this.orgUnits.filter(function(orgUnit){
            if (nameFilter === "startsWith" && orgUnit.displayName.startsWith(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "endsWith" && orgUnit.displayName.endsWith(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "includes" && orgUnit.displayName.includes(name)) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }

            else if (nameFilter === "equals" && orgUnit.displayName === name) {
                if (level !== "All") {
                    if (+level === orgUnit.level) return true;
                    else return false;
                } else {
                    return true;
                }
            }
        });

        this.filterApplied = true;
        this.orgUnitService.onFilter(this.displayedOrgUnits);
    }

    clearFilter(): void {
        this.displayedOrgUnits = [];
        for (let o of this.orgUnits) {
            this.displayedOrgUnits.push(JSON.parse(JSON.stringify(o)));
        }
        this.filterApplied = false;
        this.orgUnitService.onFilter(this.displayedOrgUnits);
    }
}
