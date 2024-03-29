import { platformBrowserDynamic }     from "@angular/platform-browser-dynamic";
import { CommonModule }               from "@angular/common";
import { HttpModule }                 from "@angular/http";
import { NgModule }                   from "@angular/core";
import { FormsModule }                from "@angular/forms";
import { BrowserModule }              from "@angular/platform-browser";
import { MultiselectDropdownModule }  from "./modules/multiselect-dropdown";

import { AppComponent }               from "./components/app/app.component";
import { MapViewComponent }           from "./components/map-view/map-view.component";
import { MapEditComponent }           from "./components/map-edit/map-edit.component";
import { OrgUnitSearchComponent }     from "./components/org-unit-search/org-unit-search.component";
import { SideBarComponent }           from "./components/side-bar/side-bar.component";
import { OptionsComponent }           from "./components/options/options.component";
import { AddOrgUnitComponent }        from "./components/add-org-unit/add-org-unit.component";
import { OrgUnitGroupsComponent }     from "./components/org-unit-groups/org-unit-groups.component";
import { OrgUnitLevelsComponent }     from "./components/org-unit-levels/org-unit-levels.component";
import { AccordionComponent }         from "./components/accordion/accordion.component";
import { AccordionGroupComponent }    from "./components/accordion/accordion-group.component";
import { AccordionToggleComponent }   from "./components/accordion/accordion-toggle.component";
import { AccordionHeadingComponent }  from "./components/accordion/accordion-heading.component";

import { MapService }                 from "./services/map.service";
import { GeocodingService }           from "./services/geocoding.service";
import { OrgUnitService }             from "./services/org-unit.service";
import { SideBarService }             from "./services/side-bar.service";


@NgModule({
    imports: [
        HttpModule,
        FormsModule,
        BrowserModule,
        CommonModule,
        MultiselectDropdownModule
    ],
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        MapViewComponent,
        MapEditComponent,
        OrgUnitSearchComponent,
        SideBarComponent,
        AccordionComponent,
        AccordionGroupComponent,
        AccordionToggleComponent,
        AccordionHeadingComponent,
        OptionsComponent,
        AddOrgUnitComponent,
        OrgUnitGroupsComponent,
        OrgUnitLevelsComponent
    ],
    providers: [
        MapService,
        GeocodingService,
        OrgUnitService,
        SideBarService
    ],
    exports: [
        AccordionComponent,
        AccordionGroupComponent,
        AccordionToggleComponent,
        AccordionHeadingComponent
    ]
})

export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
