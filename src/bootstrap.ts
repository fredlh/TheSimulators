import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {HttpModule} from "@angular/http";
import {NgModule} from "@angular/core";
import {FormsModule}   from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";

import {AppComponent} from "./components/app/app.component";
import {NavigatorComponent} from "./components/navigator/navigator.component";
import {MarkerComponent} from "./components/marker/marker.component";
import {MapViewComponent } from "./components/map-view/map-view.component";
import {NavBarComponent} from "./components/nav-bar/nav-bar.component";
import {OrgUnitSearchComponent} from "./components/org-unit-search/org-unit-search.component";
import {SideBarComponent} from "./components/side-bar/side-bar.component";

import {MapService} from "./services/map.service";
import {GeocodingService} from "./services/geocoding.service";
import {OrgUnitService} from "./services/org-unit.service";

@NgModule({
    imports: [HttpModule, FormsModule, BrowserModule],
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        NavigatorComponent,
        MarkerComponent,
        MapViewComponent,
        NavBarComponent,
        OrgUnitSearchComponent,
        SideBarComponent
    ],
    providers: [
        MapService,
        GeocodingService,
        OrgUnitService
    ],
})

export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
