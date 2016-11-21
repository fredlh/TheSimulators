INF5750 Group Project - Fall 2016 - TheSimulators
=================================================

How to download and run:
------------------------
-	Clone the git
-	Change to the wanted branch
-	npm install
-	typings install
-	npm run build
-	npm run start



We've used the following open source projects in our application:
-----------------------------------------------------------------
#### angular2-leaflet-starter
[angular2-leaflet-staret] (https://github.com/haoliangyu/angular2-leaflet-starter) is a basic starter pack
for angular2, leaflet and webpack which we've used as a base.

#### ng2-accordin
[ng2-accordin] (https://github.com/pleerock/ng2-accordion) is a toggable accordin for angular 2.
We've downloaded a local copy and modified for our needs, such as adding hover color and calling various
services when an element is selected.

#### angular-2-dropdown-multiselect
[angular-2-dropdown-multiselect] (https://github.com/softsimon/angular-2-dropdown-multiselect) is
a customizable multiple select for angular 2.
We've down loaded a local copy and modified it for our needs.


API struggles during development:
---------------------------------
We've had quite a few API struggles during the creation of this application

- Organisation Unit Groups
..* No easy to find documentation on the relation between Organisation Units and Organisation Unit Groups.
..* Have to find out yourself that to add or remove a group from an organisation unit, you need to edit the organisation unit group.

- Organisation Unit Levels
..* Why is Organisation Unit Levels only a reference/lookup-table, while Organisation Unit Groups contain every organisation Unit of its group?
..* Why can there be for example an Organisation Unit with level 5, while there are only Level 1 - 4 in Organisation Unit Levels?

- Delete Organisation Units
..* If you try to delete an Organisation Unit Level which is premade, you can an error that it references "Data value", which isn't exactly clear
as there is no "Data value" attributt in an Organisation Unit

- Parent of an Organisation Unit
..* Why is it an object instead of a string? From what we can see, there can only be a single parent.
..* If there is no parent, why not have an object with an empty id, rather than undefined? Would require less checking

- No documentation
..* Found no documentation expaining where one could find the symbols for the Organisation Unit Groups