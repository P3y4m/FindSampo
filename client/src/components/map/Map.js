import React, { Component } from 'react';
import { connect } from 'react-redux';

import L from 'leaflet';
import 'leaflet.heat/dist/leaflet-heat.js';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.zoominfo/dist/L.Control.Zoominfo.js';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.min.js';
import 'leaflet.gridlayer.googlemutant/Leaflet.GoogleMutant.js';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.zoominfo/dist/L.Control.Zoominfo.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import 'leaflet-fullscreen/dist/fullscreen.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import {
  CircularProgress,
  Dialog, DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  DialogActions
} from '@material-ui/core';
import intl from 'react-intl-universal';
import { setCoordinates } from '../../actions/findNotification';
import { MapMode, Fha_Wfs_Layer, Colors } from '../../helpers/enum/enums';
import { getWMTSLayerKeyByValue, getWMTSLayerValueByKey, fetchWMTSData } from '../../helpers/functions/functions';


/**
 * Parameters
 * showCurrentLocation: If true user's current location is shown on the map
 * markerData: Marker points which will be shown on the map
 * location: The location where map component adds a marker
 */
class Map extends Component {
  state = {
    hasCurrentLocation: false,
    activeOverLays: [],
    isLoading: false,
    isDialogOpen: false
  }

  componentDidMount() {
    if (this.props.showCurrentLocation) {
      this.getGeoLocation();
    } else {
      this.renderMap();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.markerData !== this.props.markerData || this.props.mode) {
      this.clusterMap.clearLayers();
      this.heatMap.setLatLngs([]);
      this.showMarkersOnMap(this.props.markerData);
    }
  }

  render() {
    {
      return (
        (this.props.showCurrentLocation && this.state.hasCurrentLocation) ||
          this.props.markerData ||
          this.props.location ? (
            <div id="map">
              {
                this.state.isLoading &&
                <CircularProgress className="map__data-loader-spiner" size="5rem" />
              }
              <Dialog
                open={this.state.isDialogOpen}
                onClose={this.onDialogClosedPressed}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {intl.get('nearByPage.map.alert.zoomAlertTitle')}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {intl.get('nearByPage.map.alert.zoomAlertContent')}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.onDialogClosedPressed} color="primary" autoFocus>
                    {intl.get('nearByPage.map.alert.zoomAlertConfirmation')}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          ) : (
            <CircularProgress className="answer-options__progress" size="5rem" />
          )
      );
    }
  }

  onDialogClosedPressed = () => {
    this.setState((prevState) => ({ isDialogOpen: !prevState.isDialogOpen }));
  }


  /**
   * Initialise map and its settings
   */
  renderMap = (position) => {
    this.initialiseIcon();
    this.initialiseMap();
    this.initialiseMarkers(position);
  }

  /**
   * Initialise icon settings for leaflet
  */
  initialiseIcon = () => {
    let DefaultIcon = L.icon({
      iconUrl: icon,
      shadowUrl: iconShadow,
      iconAnchor: [12, 36]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }

  /**
   * Initialise map settings for leaflet
   */
  initialiseMap = () => {
    // Map Layers
    const nationalSurveyOfFinland = L.tileLayer('/api/v1/nlsof?z={z}&x={x}&y={y}&type=taustakartta', {
      maxZoom: 18,
    });

    const nationalSurveyOfFinlandTopographical = L.tileLayer('/api/v1/nlsof?z={z}&x={x}&y={y}&type=maastokartta', {
      maxZoom: 18,
    });

    const googleMaps = L.gridLayer.googleMutant({
      type: 'roadmap'
    });

    // Create a layergroup for adding markers
    this.findsLayer = L.layerGroup();
    const archaeologicalPlacesAreaLayer = L.layerGroup();
    const archaeologicalPlacesPointLayer = L.layerGroup();
    const worldHeritageSiteAreaLayer = L.layerGroup();
    const worldHeritageSitePointLayer = L.layerGroup();
    const archaeologicalHeritageAreaLayer = L.layerGroup();
    const archaeologicalHeritagePointLayer = L.layerGroup();
    const archaeologicalSublacesPointLayer = L.layerGroup();
    const rkyAreaLayer = L.layerGroup();
    const rkyPointLayer = L.layerGroup();
    const rkyLineLayer = L.layerGroup();

    // Base maps 
    const baseMaps = {
      [intl.get('nearByPage.map.mapLayers.backGroundMap')]: nationalSurveyOfFinland,
      [intl.get('nearByPage.map.mapLayers.topographicalMap')]: nationalSurveyOfFinlandTopographical,
      [intl.get('nearByPage.map.mapLayers.googleMaps')]: googleMaps
    };

    // Overlay Maps
    const overlayLayers = {
      [intl.get('nearByPage.map.overLays.arkeologiset_loydot')]: this.findsLayer,
      [intl.get('nearByPage.map.overLays.arkeologiset_kohteet_alue')]: archaeologicalPlacesAreaLayer,
      [intl.get('nearByPage.map.overLays.arkeologiset_kohteet_piste')]: archaeologicalPlacesPointLayer,
      [intl.get('nearByPage.map.overLays.maailmanperinto_alue')]: worldHeritageSiteAreaLayer,
      [intl.get('nearByPage.map.overLays.maailmanperinto_piste')]: worldHeritageSitePointLayer,
      [intl.get('nearByPage.map.overLays.rakennusperinto_alue')]: archaeologicalHeritageAreaLayer,
      [intl.get('nearByPage.map.overLays.rakennusperinto_piste')]: archaeologicalHeritagePointLayer,
      [intl.get('nearByPage.map.overLays.arkeologisten_kohteiden_alakohteet_piste')]: archaeologicalSublacesPointLayer,
      [intl.get('nearByPage.map.overLays.rky_alue')]: rkyAreaLayer,
      [intl.get('nearByPage.map.overLays.rky_piste')]: rkyPointLayer,
      [intl.get('nearByPage.map.overLays.rky_viiva')]: rkyLineLayer,
    };

    this.map = L.map('map', {
      center: [64.9, 26.0],
      zoom: 5,
      zoomControl: false,
      zoominfoControl: true,
      fullscreenControl: true,
      layers: [nationalSurveyOfFinland]
    });

    // Add overlay layers to map
    L.control.layers(baseMaps, overlayLayers).addTo(this.map);
    // Active overlay layer
    this.findsLayer.addTo(this.map);

    // Add a click listener which is setted only if user's current location is viewed
    if (this.props.showCurrentLocation && this.state.hasCurrentLocation) {
      this.map.addEventListener('click', this.onMapTapped);
    }

    // Listen for changes
    this.initialiseMapListeners(overlayLayers);
  }


  getAncientMonument = async (layer, bounds, mapLayer) => {
    const features = await fetchWMTSData(layer, bounds);

    if (features) {
      L.geoJSON(features, {
        pointToLayer: (feature, latlng) => {
          return this.createPointToLayer(latlng, this.getOverlayColor(layer));
        },
        style: {
          cursor: 'pointer',
          color: this.getOverlayColor(layer),
          dashArray: '3, 5'
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(this.generateFeaturePopup(feature.properties));
        }
      }).addTo(mapLayer).addTo(this.map);

      this.setState({ isLoading: false });
    }
  }

  createStripePattern = (color) => {
    // Create a new
    var stripePattern = new L.StripePattern({
      angle: 45,
      weight: 2,
      color: color,
      opacity: 0.2,
    });
    stripePattern.addTo(this.map);

    return stripePattern;
  }

  createPointToLayer = (latlng, color) => {
    const geojsonMarkerOptions = {
      radius: 8,
      fillColor: color,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  initialiseMarkers = (position) => {
    // If markerData is provided show them
    if (this.props.markerData && this.props.markerData.length > 0) {
      this.showMarkersOnMap(this.props.markerData);
    }
    // If current location is provided show it
    if (position) {
      this.setLocation(position.coords.latitude, position.coords.longitude);
    }
    // If a location is given
    if (this.props.location) {
      this.setLocation(this.props.location.lat, this.props.location.lng);
    }
  }

  /**
   * Gets users current location and renders the map
   */
  getGeoLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({ hasCurrentLocation: true });
      this.renderMap(position);
      // On fail
    }, () => {
      // TODO Add error handler
      console.log('Getting current location is failed');
    });
  }

  /**
   * Clears current markers on the map and sets users current location
   */
  onMapTapped = (e) => {
    this.clearAllMarkers();
    this.setLocation(e.latlng.lat, e.latlng.lng);
  }

  /**
   * Sets a location on the map
   */
  setLocation = (lat, lng) => {
    L.marker(new L.LatLng(lat, lng)).addTo(this.findsLayer);
    this.props.setCoordinates({ lat, lng });
  }

  /**
   * Clears all markers on the map
   */
  clearAllMarkers = () => {
    this.findsLayer.clearLayers();
  }

  /**
   * Shows the markers on the map
   */
  showMarkersOnMap = (markerData) => {
    // Cluster Mode
    this.clusterMap = L.markerClusterGroup();
    const latLngs = [];

    for (let marker of markerData) {
      if (marker.lat && marker.long && !isNaN(marker.lat.value) && !isNaN(marker.long.value)) {
        const popupText = this.generateMarkerPopup(marker);
        const location = new L.LatLng(marker.lat.value, marker.long.value);
        const markerToMap = new L.marker(location).bindPopup(popupText);
        latLngs.push(location);
        this.clusterMap.addLayer(markerToMap);
      }
    }
    // HeatMap Mode
    this.heatMap = this.initialiseHeatMap(latLngs);

    // Show the current mode layer
    if (this.props.mode && this.props.mode === MapMode.HEATMAP) {
      this.map.addLayer(this.heatMap);
    } else {
      this.findsLayer.addLayer(this.clusterMap);
    }
  }

  initialiseHeatMap = (latLngs) => {
    const heatLayer = L.heatLayer(latLngs, {
      radius: 15,
      minOpacity: 1.0,
      blur: 25,
      maxZoom: 13,
      // Google maps gradient settings is used as default
      gradient: {
        0: '#66ff00',
        0.1: '#66ff00',
        0.2: '#93ff00',
        0.3: '#c1ff00',
        0.4: '#eeff00',
        0.5: '#f4e300',
        0.6: '#f9c600',
        0.7: '#ffaa00',
        0.8: '#ff7100',
        0.9: '#ff3900',
        1: '#ff0000'
      }
    });

    return heatLayer;
  }

  /**
   *  Sets listeners for loading data of overlay layers
   */
  initialiseMapListeners = (overlayLayers) => {
    // The data layhers below can be fetched without zoom level restrictions
    const smallDataLayers = [
      Fha_Wfs_Layer.RKY_LINES,
      Fha_Wfs_Layer.RKY_POINTS,
      Fha_Wfs_Layer.ARCHITECTURAL_HERITAGE_AREAS,
      Fha_Wfs_Layer.WORLD_HERITAGE_SITE_AREAS,
      Fha_Wfs_Layer.WORLD_HERITAGE_SITE_POINT
    ];
    // Fired when an overlay is selected through the layer control
    this.map.on('overlayadd', (eo) => {
      const layerName = getWMTSLayerKeyByValue(eo.name);
      if (layerName !== Fha_Wfs_Layer.ARCHEOLOGICAL_FINDS) {
        this.state.activeOverLays.push(layerName);
        if (this.map.getZoom() < 10 && !smallDataLayers.includes(layerName)) {
          this.setState({ isDialogOpen: true });
        } else {
          this.setState({ isLoading: true });
          this.getAncientMonument(layerName, this.map.getBounds(), overlayLayers[eo.name]);
        }
      }
    });

    //Fired when an overlay is deselected through the layer control
    this.map.on('overlayremove', (eo) => {
      const layerName = getWMTSLayerKeyByValue(eo.name);
      if (layerName !== Fha_Wfs_Layer.ARCHEOLOGICAL_FINDS) {
        const activeOverLays = this.state.activeOverLays.filter((name) => name !== layerName);
        this.setState({ activeOverLays });
      }
    });

    // Fired when the map has changed, after any animations
    this.map.on('zoomend', () => {
      if (this.map.getZoom() >= 10 && this.state.activeOverLays.length > 0) {
        this.state.activeOverLays.forEach((element) => {
          this.setState({ isLoading: true });
          this.getAncientMonument(element, this.map.getBounds(), overlayLayers[getWMTSLayerValueByKey(element)]);
        });
      }
    });

    //Fired when the center of the map stops changing
    this.map.on('moveend', () => {
      if (this.map.getZoom() >= 10 && this.state.activeOverLays.length > 0) {
        this.state.activeOverLays.forEach((element) => {
          this.setState({ isLoading: true });
          this.getAncientMonument(element, this.map.getBounds(), overlayLayers[getWMTSLayerValueByKey(element)]);
        });
      }
    });
  }

  /**
   * Returs default color of the selected overlay
   */
  getOverlayColor = (overlay) => {
    switch (overlay) {
      case Fha_Wfs_Layer.ARCHEOLOGICAL_PLACES_AREAS:
        return Colors.PINK;
      case Fha_Wfs_Layer.ARCHEOLOGICAL_PLACES_POINT:
        return Colors.LIME;
      case Fha_Wfs_Layer.WORLD_HERITAGE_SITE_AREAS:
        return Colors.DEEP_PURPLE;
      case Fha_Wfs_Layer.WORLD_HERITAGE_SITE_POINT:
        return Colors.BLUE;
      case Fha_Wfs_Layer.ARCHITECTURAL_HERITAGE_AREAS:
        return Colors.CYAN;
      case Fha_Wfs_Layer.ARCHITECTURAL_HERITAGE_POINT:
        return Colors.TEAL;
      case Fha_Wfs_Layer.ARCHEOLOGICAL_SUBPLACES_POINT:
        return Colors.GREEN;
      case Fha_Wfs_Layer.RKY_AREAS:
        return Colors.BROWN;
      case Fha_Wfs_Layer.RKY_POINTS:
        return Colors.YELLOW;
      case Fha_Wfs_Layer.RKY_LINES:
        return Colors.ORANGE;
    }
  }

  /**
   * Generates marker popup
   */
  generateFeaturePopup = (feature) => {
    let popupText = '';
    const placeName = feature.kohdenimi ? `<h3 class="leaflet-popup-content__text-container__title">Kohdenimi: ${feature.kohdenimi}</h3>` : '';
    const typeName = feature.laji ? `<h3 class="leaflet-popup-content__text-container__title">Laji: ${feature.laji}</h3>` : '';
    const townName = feature.kunta ? `<h3 class="leaflet-popup-content__text-container__title">Kunta: ${feature.kunta}</h3>` : '';

    popupText += `
                  <div class="leaflet-popup-content__text-container">
                  ${placeName}
                  ${typeName}
                  ${townName}
                  </div>
                  `;

    return popupText;
  }

  /**
   * Generates marker popup
   */
  generateMarkerPopup = (marker) => {
    let popupText = '';
    const image = marker.image_url ? `<img class="leaflet-popup-content__image" src=${marker.image_url.value} />` : '';
    const title = marker.title ? `<h2 class="leaflet-popup-content__text-container__title">${marker.title.value}</h2>` : '';
    const description = marker.description ? `<p class="leaflet-popup-content__text-container__description">${marker.description.value}</p>` : '';

    popupText += `${image}
                  <div class="leaflet-popup-content__text-container">
                  ${title} 
                  ${description}
                  </div>
                  `;

    return popupText;
  }
}

const mapDispatchToProps = (dispatch) => ({
  setCoordinates: (coords) => dispatch(setCoordinates(coords)),
});

export default connect(undefined, mapDispatchToProps)(Map);