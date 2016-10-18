import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }   from './app.component';
import { NavBarComponent} from './nav-bar.component';
import { OrgUnitSearchComponent } from './org-unit-search.component';
import { BodyLayoutComponent}   from './body-layout.component';
import { MapViewComponent }      from './map-view.component';
import { SideBarComponent }      from './side-bar.component';

import { OrgUnitService }       from './org-unit.service';


@NgModule({
  imports:[ 
    BrowserModule 
  ],
  declarations: [ 
    AppComponent,
    NavBarComponent,
    OrgUnitSearchComponent,
    BodyLayoutComponent,
    SideBarComponent,
    MapViewComponent,
  ],
  providers: [ OrgUnitService ],
  bootstrap:[ AppComponent ]
})
export class AppModule { }
