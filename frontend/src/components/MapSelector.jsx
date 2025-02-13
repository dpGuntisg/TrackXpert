import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, FeatureGroup, useMapEvents, GeoJSON } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MapSelector = ({ position, onPositionChange, onFeaturesChange }) => {
  const [features, setFeatures] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const featureGroupRef = useRef();

  const handleCreate = (e) => {
    const { layerType, layer } = e;
    const feature = {
      type: 'Feature',
      geometry: layer.toGeoJSON().geometry,
      properties: {}
    };
    
    setFeatures(prev => {
      const updatedFeatures = [...prev, feature];
      onFeaturesChange(updatedFeatures);
      return updatedFeatures;
    });
    setIsDrawing(false);
  };

  const handleEdit = (e) => {
    const { layers } = e;
    const updatedFeatures = layers.getLayers().map(layer => ({
      type: 'Feature',
      geometry: layer.toGeoJSON().geometry,
      properties: {}
    }));
    setFeatures(updatedFeatures);
    onFeaturesChange(updatedFeatures);
  };

  const handleDelete = (e) => {
    const { layers } = e;
    layers.eachLayer(layer => {
      setFeatures(prev => {
        const updatedFeatures = prev.filter(f => 
          JSON.stringify(f.geometry) !== JSON.stringify(layer.toGeoJSON().geometry)
        );
        onFeaturesChange(updatedFeatures);
        return updatedFeatures;
      });
    });
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (!isDrawing) {
          onPositionChange([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <FeatureGroup ref={featureGroupRef}>
        <EditControl
          position="topright"
          onCreated={handleCreate}
          onEdited={handleEdit}
          onDeleted={handleDelete}
          onDrawStart={() => setIsDrawing(true)}
          onDrawStop={() => setIsDrawing(false)}
          draw={{
            polygon: true,
            polyline: true,
            rectangle: true,
            circle: true,
            marker: false,
            circlemarker: false
          }}
          edit={{
            edit: true,
            remove: true
          }}
        />
        {features.map((feature, idx) => (
          <GeoJSON key={idx} data={feature} />
        ))}
      </FeatureGroup>

      <MapClickHandler />
      {position && <Marker position={position} />}
    </MapContainer>
  );
};