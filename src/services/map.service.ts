import {Injectable} from "@angular/core";
import {Location} from "../core/location.class";
import {Map} from "leaflet";

@Injectable()
export class MapService {
    public map: Map;
    public baseMaps: any;

    constructor() {
        this.baseMaps = {
            OpenStreetMap: L.tileLayer("http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
                attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>`
            }),
            Esri: L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
                attribution: `Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community`
            }),
            CartoDB: L.tileLayer("http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
                attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>`
            })
        };
    }

    disableMouseEvent(elementId: string) {
        let element = <HTMLElement>document.getElementById(elementId);

        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
    };

    parsePolygonCoordinates(coordinatesAsString: string): any {
        /*
        let bracketsRemoved = coordinatesAsString.slice(4, coordinatesAsString.length - 4); // Remove brackets on each end (1)
        let subfigures = bracketsRemoved.split("]]],[[["); // Split into subfigures (2)

        let parsedCoordinates = [];

        // For each subfigure within the figure
        for (let subfig of subfigures) {

            let subfigureBuildup = [];
            let individualTuppels = subfig.split("],["); // Split into seperate x,y tuppels (3)

            // For each x,y tupple within the subfigure
            for (let tuppel of individualTuppels) {
                let individualNumbers = tuppel.split(","); // Split into seperate number values (4)

                let tuppelBuildup = [];
                tuppelBuildup.push(Number(individualNumbers[0])); // Interpret data as number and
                tuppelBuildup.push(Number(individualNumbers[1])); // create tupple (5)

                subfigureBuildup.push(tuppelBuildup); // Combine tuppels into subfigures (6)
            }

            parsedCoordinates.push(subfigureBuildup); // Combine subfigures to create final array (7)
        }
        */

        let parsedCoordinates = [];
        let polygons = JSON.parse(coordinatesAsString);

        for (let poly of polygons) {
            parsedCoordinates.push(poly[0]);
        }
        
        return parsedCoordinates;
    }

    createEditMarker(latlng): any {
        let coords = JSON.parse(JSON.stringify(latlng));
        return L.marker(coords, {
            icon: L.icon({
                iconUrl: require<any>("../../node_modules/leaflet/dist/images/marker-icon.png"),
                shadowUrl: require<any>("../../node_modules/leaflet/dist/images/marker-shadow.png")
            }),
            draggable: true
        })
        .bindPopup("current organisation unit marker", {
            offset: L.point(12, 6)
        });
    }

    createEditPolygon(latlngs): any {
        return L.polygon(JSON.parse(JSON.stringify(latlngs)), {
            color: "#f06eaa",
            weight: 4,
            opacity: 0.5,
            fill: true,
            fillColor: null,
            fillOpacity: 0.2,
        });
    }
}

