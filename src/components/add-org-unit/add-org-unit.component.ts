import { Component, OnInit } from "@angular/core";

import {OrgUnit} from "../../core/org-unit";

import {Constants} from "../../constants/constants";

import {OrgUnitService} from "../../services/org-unit.service";

declare var $: any;

@Component({
    selector: "add-org-unit",
    template: require<any>("./add-org-unit.component.html"),
    styles: [ require<any>("./add-org-unit.component.less") ]
})

export class AddOrgUnitComponent implements OnInit {

    private orgUnit: OrgUnit = new OrgUnit();
    private self = this;
    private constants = Constants;

    constructor(private orgUnitService: OrgUnitService) {}

    openAddOrgUnitForm(): void {
        let tmpThis = this;
        
        $("#addOrgUnitButton").click(function() {
            document.getElementById("addOrgUnitArea").style.display = "block";
            tmpThis.orgUnitService.closeSideBar();
        });

        $(".add-org-unit-close").click(function() {
            document.getElementById("addOrgUnitArea").style.display = "none";
            this.orgUnit = new OrgUnit();
            tmpThis.orgUnitService.endAddOrEditOrgUnit();
            tmpThis.orgUnitService.showSideBar();
        });

        window.onclick = function(event) {
            let options = document.getElementById("addOrgUnitArea");
            if (event.target === options) {
                options.style.display = "none";
                tmpThis.orgUnit = new OrgUnit();
                tmpThis.orgUnitService.endAddOrEditOrgUnit();
                tmpThis.orgUnitService.showSideBar();
            }
        };
    }

    ngOnInit(): void {
              
    }   

    onOpen(): void {
        document.getElementById("addOrgUnitArea").style.display = "block";
    }

    onSubmit(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        this.orgUnitService.endAddOrEditOrgUnit();
        this.orgUnitService.showSideBar();
        
    }

    onCancel(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
        this.orgUnit = new OrgUnit();
        this.orgUnitService.endAddOrEditOrgUnit();
        this.orgUnitService.showSideBar();
    }

    closePanel(): void {
        document.getElementById("addOrgUnitArea").style.display = "none";
    }

    drawOrgUnitPolygon(): void {
        this.closePanel();
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.orgUnitService.startEditMode("");
    }

    drawOrgUnitMarker(): void {

    }

    saveDrawnOrgUnit(): void {
        this.orgUnit.coordinates = this.orgUnitService.endEditMode(true);
        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.onOpen();
    }

    cancelDrawnOrgUnit(): void {
        this.orgUnitService.endEditMode(false);

        $("#drawOrgUnitPanelArea").slideToggle("fast");
        this.onOpen();
    }
}