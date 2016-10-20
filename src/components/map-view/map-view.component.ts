import {Component, ViewChild, OnInit} from "@angular/core";
import {NavigatorComponent} from "../navigator/navigator.component";
import {MarkerComponent} from "../marker/marker.component";
import {MapService} from "../../services/map.service";
import {GeocodingService} from "../../services/geocoding.service";
import {Location} from "../../core/location.class";

@Component({
    selector: "map-view",
    template: require<any>("./map-view.component.html"),
    styles: [ require<any>("./map-view.component.less") ]
})

export class MapViewComponent implements OnInit {

    private map;
    //private bounds = L.latLngBounds(L.latLng(54.5, -5.8), L.latLng(56.1, -3.0));

    private bounds = [
        L.latLng(-11.3516,8.0819),
        L.latLng(-11.3553,8.0796),
        L.latLng(-11.3592,8.0779),
        L.latLng(-11.3615,8.0764),
        L.latLng(-11.3665,8.0724),
        L.latLng(-11.374,8.0686),
        L.latLng(-11.3765,8.0678),
        L.latLng(-11.3815,8.0666),
        L.latLng(-11.3859,8.0644),
        L.latLng(-11.3891,8.0631),
        L.latLng(-11.3934,8.0607),
        L.latLng(-11.3972,8.0589),
        L.latLng(-11.3994,8.0572),
        L.latLng(-11.4048,8.0523),
        L.latLng(-11.4075,8.0501),
        L.latLng(-11.4115,8.0482),
        L.latLng(-11.4144,8.0461),
        L.latLng(-11.4169,8.0434),
        L.latLng(-11.4184,8.0406),
        L.latLng(-11.4189,8.0384),
        L.latLng(-11.4192,8.0331),
        L.latLng(-11.42,8.0298),
        L.latLng(-11.4236,8.024),
        L.latLng(-11.4258,8.0228),
        L.latLng(-11.4339,8.0207),
        L.latLng(-11.4389,8.0222),
        L.latLng(-11.4417,8.0235),
        L.latLng(-11.4428,8.0253),
        L.latLng(-11.4461,8.0281),
        L.latLng(-11.448,8.0307),
        L.latLng(-11.449,8.0344),
        L.latLng(-11.4492,8.0454),
        L.latLng(-11.4494,8.0494),
        L.latLng(-11.4501,8.0522),
        L.latLng(-11.4521,8.0567),
        L.latLng(-11.4528,8.0595),
        L.latLng(-11.4531,8.0625),
        L.latLng(-11.4532,8.0677),
        L.latLng(-11.4527,8.0727),
        L.latLng(-11.4514,8.0786),
        L.latLng(-11.4527,8.0836),
        L.latLng(-11.4532,8.0874),
        L.latLng(-11.4535,8.0964),
        L.latLng(-11.4535,8.1033),
        L.latLng(-11.4529,8.1072),
        L.latLng(-11.4507,8.1126),
        L.latLng(-11.45,8.1163),
        L.latLng(-11.4502,8.1202),
        L.latLng(-11.4509,8.1229),
        L.latLng(-11.4532,8.1282),
        L.latLng(-11.4534,8.1325),
        L.latLng(-11.4524,8.1357),
        L.latLng(-11.4482,8.1423),
        L.latLng(-11.4442,8.1401),
        L.latLng(-11.442,8.14),
        L.latLng(-11.44,8.1409),
        L.latLng(-11.4369,8.1434),
        L.latLng(-11.434,8.145),
        L.latLng(-11.4298,8.1459),
        L.latLng(-11.4273,8.1468),
        L.latLng(-11.4206,8.1501),
        L.latLng(-11.4166,8.1532),
        L.latLng(-11.4096,8.1603),
        L.latLng(-11.4056,8.1634),
        L.latLng(-11.4026,8.1641),
        L.latLng(-11.3982,8.1636),
        L.latLng(-11.3938,8.1616),
        L.latLng(-11.3913,8.1609),
        L.latLng(-11.3859,8.1603),
        L.latLng(-11.3833,8.1597),
        L.latLng(-11.3779,8.1574),
        L.latLng(-11.3736,8.1564),
        L.latLng(-11.3695,8.1524),
        L.latLng(-11.3657,8.1475),
        L.latLng(-11.3638,8.1444),
        L.latLng(-11.3623,8.1407),
        L.latLng(-11.3589,8.1286),
        L.latLng(-11.3574,8.1218),
        L.latLng(-11.3525,8.1071),
        L.latLng(-11.3509,8.1012),
        L.latLng(-11.3505,8.0968),
        L.latLng(-11.3504,8.091),
        L.latLng(-11.3508,8.0868),
        L.latLng(-11.3516,8.0819)
        ];

    private bounds2 = [L.latLng(-12.4644,8.0374),L.latLng(-12.4605,8.0338),L.latLng(-12.4245,8.0338),L.latLng(-12.4201,8.033),L.latLng(-12.4152,8.0309),L.latLng(-12.4093,8.0294),L.latLng(-12.4061,8.0276),L.latLng(-12.401,8.0237),L.latLng(-12.3926,8.0196),L.latLng(-12.389,8.0188),L.latLng(-12.386,8.0187),L.latLng(-12.3681,8.0188),L.latLng(-12.3642,8.0183),L.latLng(-12.3588,8.0161),L.latLng(-12.3534,8.0147),L.latLng(-12.3519,8.0139),L.latLng(-12.3487,8.0109),L.latLng(-12.3472,8.008),L.latLng(-12.3438,8.0046),L.latLng(-12.3363,8.001),L.latLng(-12.3298,7.9995),L.latLng(-12.3279,7.9985),L.latLng(-12.3257,7.9967),L.latLng(-12.323,7.9935),L.latLng(-12.3203,7.9888),L.latLng(-12.3187,7.987),L.latLng(-12.3168,7.986),L.latLng(-12.3146,7.9854),L.latLng(-12.3068,7.985),L.latLng(-12.3031,7.9844),L.latLng(-12.2977,7.9823),L.latLng(-12.2939,7.9817),L.latLng(-12.2879,7.9815),L.latLng(-12.2842,7.9809),L.latLng(-12.2788,7.9787),L.latLng(-12.2737,7.9773),L.latLng(-12.2658,7.9725),L.latLng(-12.2653,7.968),L.latLng(-12.265,7.9592),L.latLng(-12.2688,7.9567),L.latLng(-12.2715,7.9558),L.latLng(-12.2787,7.955),L.latLng(-12.2819,7.9534),L.latLng(-12.2831,7.9524),L.latLng(-12.2881,7.9475),L.latLng(-12.2895,7.9454),L.latLng(-12.2909,7.9417),L.latLng(-12.2912,7.9379),L.latLng(-12.291,7.9333),L.latLng(-12.2897,7.9293),L.latLng(-12.2863,7.9252),L.latLng(-12.283,7.9227),L.latLng(-12.2726,7.9181),L.latLng(-12.2702,7.9165),L.latLng(-12.2683,7.913),L.latLng(-12.2695,7.9082),L.latLng(-12.2729,7.9055),L.latLng(-12.2766,7.9022),L.latLng(-12.2806,7.8979),L.latLng(-12.2841,7.8933),L.latLng(-12.2913,7.8892),L.latLng(-12.2998,7.888),L.latLng(-12.3077,7.8852),L.latLng(-12.3119,7.8849),L.latLng(-12.3165,7.886),L.latLng(-12.3219,7.8899),L.latLng(-12.3242,7.8905),L.latLng(-12.3263,7.8901),L.latLng(-12.3314,7.8879),L.latLng(-12.3355,7.8855),L.latLng(-12.343,7.882),L.latLng(-12.346,7.8833),L.latLng(-12.3474,7.8883),L.latLng(-12.3521,7.8949),L.latLng(-12.3537,7.8957),L.latLng(-12.3587,7.8962),L.latLng(-12.3613,7.8969),L.latLng(-12.3637,7.8982),L.latLng(-12.3688,7.9022),L.latLng(-12.3771,7.9064),L.latLng(-12.381,7.9069),L.latLng(-12.3844,7.9063),L.latLng(-12.3884,7.9042),L.latLng(-12.3915,7.9028),L.latLng(-12.3958,7.9004),L.latLng(-12.3993,7.8988),L.latLng(-12.4005,7.898),L.latLng(-12.4053,7.8931),L.latLng(-12.4092,7.8855),L.latLng(-12.4102,7.882),L.latLng(-12.4102,7.8777),L.latLng(-12.4088,7.8745),L.latLng(-12.4031,7.8709),L.latLng(-12.3991,7.8693),L.latLng(-12.3954,7.8675),L.latLng(-12.3904,7.8647),L.latLng(-12.3878,7.8609),L.latLng(-12.3872,7.8568),L.latLng(-12.3872,7.8513),L.latLng(-12.3874,7.8466),L.latLng(-12.3883,7.8435),L.latLng(-12.3902,7.8399),L.latLng(-12.3915,7.8365),L.latLng(-12.394,7.8322),L.latLng(-12.3959,7.8283),L.latLng(-12.3984,7.8249),L.latLng(-12.4009,7.8223),L.latLng(-12.4053,7.8198),L.latLng(-12.4113,7.8209),L.latLng(-12.4145,7.8213),L.latLng(-12.4223,7.8215),L.latLng(-12.4278,7.8213),L.latLng(-12.4298,7.8211),L.latLng(-12.4374,7.8186),L.latLng(-12.444,7.8178),L.latLng(-12.4474,7.8167),L.latLng(-12.4496,7.8144),L.latLng(-12.4501,7.812),L.latLng(-12.4496,7.8096),L.latLng(-12.4476,7.8056),L.latLng(-12.4472,7.8016),L.latLng(-12.4486,7.7978),L.latLng(-12.4532,7.7917),L.latLng(-12.4535,7.7886),L.latLng(-12.452,7.7862),L.latLng(-12.4502,7.7846),L.latLng(-12.4463,7.7829),L.latLng(-12.4435,7.7807),L.latLng(-12.4379,7.7756),L.latLng(-12.4353,7.774),L.latLng(-12.4319,7.7731),L.latLng(-12.4268,7.7728),L.latLng(-12.4203,7.7729),L.latLng(-12.4247,7.7625),L.latLng(-12.4292,7.7541),L.latLng(-12.4366,7.7463),L.latLng(-12.4417,7.7433),L.latLng(-12.4446,7.7419),L.latLng(-12.4481,7.7415),L.latLng(-12.4571,7.7418),L.latLng(-12.4702,7.7443),L.latLng(-12.4814,7.7487),L.latLng(-12.4864,7.7495),L.latLng(-12.4944,7.7513),L.latLng(-12.4988,7.7505),L.latLng(-12.5041,7.7481),L.latLng(-12.5077,7.7454),L.latLng(-12.5146,7.7397),L.latLng(-12.5208,7.7351),L.latLng(-12.5248,7.7311),L.latLng(-12.5291,7.7246),L.latLng(-12.5323,7.7217),L.latLng(-12.5359,7.7197),L.latLng(-12.5527,7.7135),L.latLng(-12.5583,7.7085),L.latLng(-12.5655,7.7031),L.latLng(-12.5692,7.7011),L.latLng(-12.5807,7.6971),L.latLng(-12.5868,7.6963),L.latLng(-12.5928,7.6963),L.latLng(-12.5968,7.6973),L.latLng(-12.5972,7.6978),L.latLng(-12.5992,7.6998),L.latLng(-12.5997,7.7041),L.latLng(-12.6033,7.7119),L.latLng(-12.6064,7.7173),L.latLng(-12.6078,7.7207),L.latLng(-12.6103,7.7257),L.latLng(-12.6108,7.7313),L.latLng(-12.6103,7.7357),L.latLng(-12.6084,7.7401),L.latLng(-12.6066,7.7449),L.latLng(-12.6023,7.747),L.latLng(-12.597,7.7473),L.latLng(-12.5928,7.7469),L.latLng(-12.589,7.7462),L.latLng(-12.582,7.7436),L.latLng(-12.5755,7.7431),L.latLng(-12.5695,7.7431),L.latLng(-12.5657,7.7435),L.latLng(-12.5627,7.7453),L.latLng(-12.5592,7.7511),L.latLng(-12.5569,7.7619),L.latLng(-12.5583,7.7678),L.latLng(-12.5588,7.7729),L.latLng(-12.5591,7.7829),L.latLng(-12.5597,7.7872),L.latLng(-12.5635,7.7953),L.latLng(-12.5658,7.7995),L.latLng(-12.5677,7.8062),L.latLng(-12.5699,7.8105),L.latLng(-12.5737,7.8191),L.latLng(-12.575,7.8241),L.latLng(-12.5774,7.8293),L.latLng(-12.5782,7.8329),L.latLng(-12.5783,7.8358),L.latLng(-12.5784,7.8532),L.latLng(-12.5787,7.8593),L.latLng(-12.5794,7.8621),L.latLng(-12.5815,7.8667),L.latLng(-12.583,7.8725),L.latLng(-12.5854,7.8777),L.latLng(-12.5861,7.8815),L.latLng(-12.5865,7.8919),L.latLng(-12.587,7.8953),L.latLng(-12.5887,7.898),L.latLng(-12.5916,7.901),L.latLng(-12.5982,7.9051),L.latLng(-12.6007,7.9077),L.latLng(-12.6023,7.9102),L.latLng(-12.605,7.9131),L.latLng(-12.6082,7.9145),L.latLng(-12.6074,7.9191),L.latLng(-12.604,7.9239),L.latLng(-12.6024,7.9271),L.latLng(-12.6011,7.9321),L.latLng(-12.5974,7.9403),L.latLng(-12.5952,7.9447),L.latLng(-12.5945,7.9489),L.latLng(-12.5945,7.9579),L.latLng(-12.5953,7.9622),L.latLng(-12.5992,7.9702),L.latLng(-12.6017,7.9745),L.latLng(-12.6053,7.9818),L.latLng(-12.606,7.9854),L.latLng(-12.6067,7.9958),L.latLng(-12.6005,8.0018),L.latLng(-12.5975,8.004),L.latLng(-12.5961,8.0057),L.latLng(-12.5944,8.0105),L.latLng(-12.5917,8.0138),L.latLng(-12.5886,8.0149),L.latLng(-12.5824,8.0155),L.latLng(-12.5803,8.0161),L.latLng(-12.5763,8.018),L.latLng(-12.5731,8.0193),L.latLng(-12.5688,8.0219),L.latLng(-12.565,8.0236),L.latLng(-12.5623,8.0266),L.latLng(-12.5606,8.0303),L.latLng(-12.5586,8.0338),L.latLng(-12.5548,8.0425),L.latLng(-12.5544,8.0468),L.latLng(-12.5546,8.0494),L.latLng(-12.5552,8.0519),L.latLng(-12.5574,8.0563),L.latLng(-12.5592,8.0631),L.latLng(-12.5583,8.0597),L.latLng(-12.5509,8.0596),L.latLng(-12.5474,8.0589),L.latLng(-12.5429,8.0569),L.latLng(-12.5361,8.0551),L.latLng(-12.5308,8.0529),L.latLng(-12.5249,8.0514),L.latLng(-12.5195,8.0491),L.latLng(-12.5157,8.0486),L.latLng(-12.5128,8.0485),L.latLng(-12.493,8.0487),L.latLng(-12.4877,8.048),L.latLng(-12.484,8.0457),L.latLng(-12.4818,8.0437),L.latLng(-12.4768,8.0387),L.latLng(-12.4728,8.0355),L.latLng(-12.4689,8.0339),L.latLng(-12.4644,8.0374)];

    @ViewChild(MarkerComponent) markerComponent: MarkerComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService) {
    }

    ngOnInit(): void {
        let map = this.map;
        map = L.map("map", {
            zoomControl: false,
            center: L.latLng(40.731253, -73.996139),
            zoom: 12,
            minZoom: 4,
            maxZoom: 19,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });

        L.control.zoom({ position: "topright" }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);
        L.control.scale().addTo(map);

        this.mapService.map = map;
        this.geocoder.getCurrentLocation()
            .subscribe(
                location => map.panTo([location.latitude, location.longitude]),
                err => console.error(err)
            );

        // define rectangle geographical bounds
        //var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
        
        let bounds = this.bounds;
        
        // create an orange rectangle
        //L.rectangle(bounds, {color: "blue", weight: 1, fillOpacity: 0.1, fillColor: "orange"}).addTo(map);

        L.polygon(bounds, {color: "blue", weight: 1}).addTo(map);

        // zoom the map to the rectangle bounds
        map.fitBounds(bounds);


        let bounds2 = this.bounds2;

        let pop = L.popup(`
        Who is Frederich
        Why he is an awesome douchebag
        And he says hello
        `);

        L.polygon(bounds2, {color: "red", weight: 1})
        /*
        .bindPopup(`
        Who: Fredrik<br>
        To: Everyone<br>
        Message: Hellu<br>
        `)
        */
        .addEventListener("mouseover", function(e) {
            this.setStyle({color: "black", weight: 5});
        })
        .addEventListener("mouseout", function(e) {
            this.setStyle({color: "red", weight: 1});
            
        })
        .addEventListener("click", function(e) {
            //map.setView(bounds2[0]);
            //map.setZoom(5);
            map.flyToBounds(bounds2, {padding: [10, 10]});
        })
        .addEventListener("contextmenu", function(e: MouseEvent) {
            map.openPopup(`
        Who is Frederich
        Why he is an awesome douchebag
        And he says hello
        `, e.latlng);
        })
        .addTo(map);

        // zoom the map to the rectangle bounds
        map.fitBounds(bounds2);
    }

    ngAfterViewInit(): void {
        this.markerComponent.Initialize();
    }
}
