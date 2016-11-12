import { Component, ElementRef, Renderer }  from "@angular/core";

import { OrgUnitService}                    from "../../services/org-unit.service";
import { SideBarService}                    from "../../services/side-bar.service";

import { OrgUnitGroupsUpdateInterface }     from "../../core/org-unit-groups-update.interface";

import { OrgUnit }                          from "../../core/org-unit.class";
import { Globals, OrganisationUnitGroup }   from "../../globals/globals.class";



@Component({
    selector: "org-unit-groups",
    template: require<any>("./org-unit-groups.component.html"),
    styles: [ require<any>("./org-unit-groups.component.less")]
})


export class OrgUnitGroupsComponent implements OrgUnitGroupsUpdateInterface {

    private orgUnitGroups: OrganisationUnitGroup[] = [];
    private orgUnits = [];
    private displayedOrgUnits = [];

    private openedId;
    private openedIndex;

    private listenFunc: Function;


    constructor(private orgUnitService: OrgUnitService,
                private sideBarService: SideBarService,
                private elementRef: ElementRef,
                private rendered: Renderer) {
        this.orgUnitService.registerOrgUnitGroupsListener(this);
        this.orgUnitService.registerOrgUnitGroups(this);

        let tmpThis = this;
        this.listenFunc = rendered.listen(elementRef.nativeElement, "click", (event) => {
            tmpThis.elementClicked(event);
        });
    }

    onOrgUnitGroupsUpdate(): void {
        this.orgUnitGroups = Globals.organisationUnitGroups;
    }

    toggleOrgUnitGroups(): void {
        this.showOrgUnitGroupsPanel();

        let tmpThis = this;
        $(".org-unit-groups-close").click(function() {
            tmpThis.onCancel(tmpThis);
        });

        window.onclick = function(event) {
            if (event.target === document.getElementById("orgUnitGroupsArea")) {
                tmpThis.onCancel(tmpThis);
            }
        };
    }

    showOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "block";
        this.sideBarService.hideSideBar();
    }

    hideOrgUnitGroupsPanel(): void {
        document.getElementById("orgUnitGroupsArea").style.display = "none";
        this.sideBarService.unHideSideBar();
    }

    onCancel(tmpThis = this): void {
        tmpThis.hideOrgUnitGroupsPanel();
    }

    getOrgUnits(orgUnitGroupId: string, orgUnitGroupIndex: number): void {
        this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray = [];

        for (let orgUnit of this.orgUnitGroups[orgUnitGroupIndex].organisationUnits) {
            this.orgUnitService.getOrgUnit(orgUnit.id).subscribe(
                res => {
                    this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray.push(res);
                },
                error => {
                    console.error(error);
                });
        }
    }

    orgUnitGroupOpened(orgUnitGroupId: string, orgUnitGroupIndex: number) {
        this.openedId = orgUnitGroupId;
        this.openedIndex = orgUnitGroupIndex;

        if (!this.orgUnitGroups[orgUnitGroupIndex].orgUnitArray) {
            this.getOrgUnits(orgUnitGroupId, orgUnitGroupIndex);
            this.getOrgUnitLevel1();
        }

        /*
        this.orgUnitService.getOrgUnitIcon("07.png").subscribe(
            res => {
                console.log(res);
            },
            error => {
                console.error(error);
            }
        );
        */
    }

    getOrgUnitLevel1(): void {
        this.orgUnitService.getOrgUnits("&level=1").subscribe(
            res => {
                this.orgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
                this.displayedOrgUnits = JSON.parse(JSON.stringify(res.organisationUnits));
            },
            error => {
                console.error(error);
            }
        )
    }

    elementClicked(event: any): void {
        let name = event.target.innerText;
        //console.log("Name: " + name + " | index: " + this.getIndexByName(name));

        if (this.getIndexByName(event.target.innerText) === -1) return;
        console.log(event);

        let spanContent = event.target.childNodes[0].innerText.split("|");
        let index = +spanContent[0];
        let parent = spanContent[1];


        console.log("Name: " + name + " | index: " + index + " | parent: " + parent);
        //console.log(event);

        //if (this.getIndexByName(name) === -1) return ;

        this.test(index, name);
    }

    getIndexByName(name: string): number {
        for (let i = 0; i < this.displayedOrgUnits.length; i++) {
            if (this.displayedOrgUnits[i].name === name) return i;
        }

        return -1;
    }

    getIdByName(name: string): string {
        for (let i = 0; i < this.displayedOrgUnits.length; i++) {
            if (this.displayedOrgUnits[i].name === name) return "" + this.displayedOrgUnits[i].id;
        }

        return "-1";
    }

    test(index: number, name: string): void {

        let tmpThis = this;
        this.orgUnitService.getOrgUnitWithChildren(this.getIdByName(name)).subscribe(
            res => {
                let units = res.organisationUnits

                    $("#" + this.openedId).find("li").each(function () {

                        let buildString = "<ul>";

                        let splitText = $(this).text().split("|");
                            console.log(splitText);
                        if (splitText.length >=3 && splitText[2].trim() === name) {
                            for (let i = 1; i < units.length; i++) {
                                let spanContent = `<span style="display: none;">${i}|${name}|</span>`;
                                buildString += "<li>" + spanContent + units[i].name + "</li>";
                                tmpThis.displayedOrgUnits.push(units[i]);
                                console.log("appending: " + units[i].name);
                            }

                            buildString += "</ul>";

                            if (units.length !== 1) {
                                $(this).append(buildString);
                                console.log("appending")
                                return;
                            }
                        }

                    });
                },
            error => {
                console.error(error);
            }
        );
    }



}