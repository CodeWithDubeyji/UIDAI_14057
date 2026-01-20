"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2, ZoomIn, ZoomOut, Home, Layers } from "lucide-react";
import {
    useStateMapData,
    useDistrictMapData,
    usePincodeMapData,
    useClusterMapData,
    useIndiaGeoJSON,
    StateMapData,
    DistrictMapData,
    PincodeMapData,
    ClusterMapData,
} from "@/lib/useMapData";
import {
    getEnrollmentColor,
    getClusterColor,
    formatNumber,
    INDIA_BOUNDS,
} from "@/lib/mapUtils";

// Approximate state center coordinates for positioning district markers
const STATE_BOUNDS: Record<string, { lat: number; lng: number; spread: number }> = {
    "andhra pradesh": { lat: 15.9, lng: 79.7, spread: 1.5 },
    "arunachal pradesh": { lat: 28.2, lng: 94.7, spread: 1.0 },
    "assam": { lat: 26.2, lng: 92.9, spread: 1.2 },
    "bihar": { lat: 25.6, lng: 85.1, spread: 1.0 },
    "chhattisgarh": { lat: 21.3, lng: 81.6, spread: 1.5 },
    "goa": { lat: 15.3, lng: 74.0, spread: 0.3 },
    "gujarat": { lat: 22.3, lng: 71.2, spread: 1.8 },
    "haryana": { lat: 29.1, lng: 76.1, spread: 0.8 },
    "himachal pradesh": { lat: 31.1, lng: 77.2, spread: 1.0 },
    "jharkhand": { lat: 23.6, lng: 85.3, spread: 1.0 },
    "karnataka": { lat: 15.3, lng: 75.7, spread: 1.5 },
    "kerala": { lat: 10.9, lng: 76.3, spread: 1.2 },
    "madhya pradesh": { lat: 23.5, lng: 77.5, spread: 2.0 },
    "maharashtra": { lat: 19.8, lng: 75.3, spread: 2.0 },
    "manipur": { lat: 24.7, lng: 93.9, spread: 0.5 },
    "meghalaya": { lat: 25.5, lng: 91.4, spread: 0.5 },
    "mizoram": { lat: 23.2, lng: 92.9, spread: 0.5 },
    "nagaland": { lat: 26.2, lng: 94.6, spread: 0.5 },
    "odisha": { lat: 20.5, lng: 84.4, spread: 1.5 },
    "orissa": { lat: 20.5, lng: 84.4, spread: 1.5 }, // Alias for Odisha
    "punjab": { lat: 31.1, lng: 75.3, spread: 0.8 },
    "rajasthan": { lat: 27.0, lng: 74.2, spread: 2.5 },
    "sikkim": { lat: 27.5, lng: 88.5, spread: 0.3 },
    "tamil nadu": { lat: 11.1, lng: 78.7, spread: 1.5 },
    "telangana": { lat: 17.9, lng: 79.4, spread: 1.2 },
    "tripura": { lat: 23.9, lng: 91.9, spread: 0.4 },
    "uttar pradesh": { lat: 27.0, lng: 80.9, spread: 2.5 },
    "uttarakhand": { lat: 30.1, lng: 79.3, spread: 1.0 },
    "west bengal": { lat: 23.0, lng: 87.9, spread: 1.5 },
    "delhi": { lat: 28.7, lng: 77.1, spread: 0.3 },
    "jammu and kashmir": { lat: 33.8, lng: 75.0, spread: 1.5 },
    "ladakh": { lat: 34.2, lng: 77.6, spread: 1.0 },
    "puducherry": { lat: 11.9, lng: 79.8, spread: 0.2 },
    "chandigarh": { lat: 30.7, lng: 76.8, spread: 0.1 },
    "andaman and nicobar islands": { lat: 11.7, lng: 92.7, spread: 1.0 },
    "dadra and nagar haveli and daman and diu": { lat: 20.4, lng: 73.0, spread: 0.3 },
    "lakshadweep": { lat: 10.6, lng: 72.6, spread: 0.5 },
};

// Dynamic import for Leaflet (SSR issues)
const MapContainer = dynamic(
    () => import("react-leaflet").then((m) => m.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((m) => m.TileLayer),
    { ssr: false }
);
const GeoJSON = dynamic(
    () => import("react-leaflet").then((m) => m.GeoJSON),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import("react-leaflet").then((m) => m.CircleMarker),
    { ssr: false }
);
const Tooltip = dynamic(
    () => import("react-leaflet").then((m) => m.Tooltip),
    { ssr: false }
);

// Types
type ViewLevel = "national" | "state" | "district";
type MapMode = "dashboard" | "clusters";

interface IndiaMapProps {
    mode?: MapMode;
    clusterType?: "cold" | "hot";
    height?: string;
    onStateClick?: (state: string) => void;
    onDistrictClick?: (district: string) => void;
}

// Map controls component
function MapControls({
    onZoomIn,
    onZoomOut,
    onReset,
    viewLevel,
}: {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    viewLevel: ViewLevel;
}) {
    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
                onClick={onZoomIn}
                className="p-2 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-secondary transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button
                onClick={onZoomOut}
                className="p-2 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-secondary transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            {viewLevel !== "national" && (
                <button
                    onClick={onReset}
                    className="p-2 rounded-lg bg-card/90 backdrop-blur border border-border hover:bg-secondary transition-colors"
                    title="Reset to National View"
                >
                    <Home className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

// Breadcrumb navigation
function MapBreadcrumb({
    viewLevel,
    selectedState,
    selectedDistrict,
    onNavigate,
}: {
    viewLevel: ViewLevel;
    selectedState: string | null;
    selectedDistrict: string | null;
    onNavigate: (level: ViewLevel) => void;
}) {
    return (
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg bg-card/90 backdrop-blur border border-border text-sm">
            <button
                onClick={() => onNavigate("national")}
                className={`hover:text-primary transition-colors ${viewLevel === "national" ? "text-primary font-medium" : "text-muted-foreground"
                    }`}
            >
                India
            </button>
            {selectedState && (
                <>
                    <span className="text-muted-foreground">/</span>
                    <button
                        onClick={() => onNavigate("state")}
                        className={`hover:text-primary transition-colors ${viewLevel === "state" ? "text-primary font-medium" : "text-muted-foreground"
                            }`}
                    >
                        {selectedState}
                    </button>
                </>
            )}
            {selectedDistrict && (
                <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-primary font-medium">{selectedDistrict}</span>
                </>
            )}
        </div>
    );
}

// Legend component
function MapLegend({ mode, clusterType }: { mode: MapMode; clusterType?: "cold" | "hot" }) {
    if (mode === "clusters") {
        return (
            <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-lg bg-card/90 backdrop-blur border border-border text-xs">
                <div className="font-medium mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {clusterType === "cold" ? "Cold Clusters" : "Hot Clusters"}
                </div>
                <div className="text-muted-foreground">
                    {clusterType === "cold"
                        ? "Low enrollment regions"
                        : "High update activity"}
                </div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-lg bg-card/90 backdrop-blur border border-border text-xs">
            <div className="font-medium mb-2">Enrollment Intensity</div>
            <div className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: "#22c55e" }} />
                <div className="w-4 h-3 rounded" style={{ backgroundColor: "#84cc16" }} />
                <div className="w-4 h-3 rounded" style={{ backgroundColor: "#eab308" }} />
                <div className="w-4 h-3 rounded" style={{ backgroundColor: "#f97316" }} />
                <div className="w-4 h-3 rounded" style={{ backgroundColor: "#ef4444" }} />
            </div>
            <div className="flex justify-between mt-1 text-muted-foreground">
                <span>Low</span>
                <span>High</span>
            </div>
        </div>
    );
}

// Main component
export default function IndiaMap({
    mode = "dashboard",
    clusterType = "cold",
    height = "500px",
    onStateClick,
    onDistrictClick,
}: IndiaMapProps) {
    const [viewLevel, setViewLevel] = useState<ViewLevel>("national");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [mapKey, setMapKey] = useState(0);
    const [isClient, setIsClient] = useState(false);

    // Data fetching
    const { data: geoJSON, isLoading: loadingGeo } = useIndiaGeoJSON();
    const { data: stateData, isLoading: loadingStates } = useStateMapData();
    const { data: districtData, isLoading: loadingDistricts } = useDistrictMapData(selectedState);
    const { data: pincodeData, isLoading: loadingPincodes } = usePincodeMapData(selectedDistrict);
    const { data: clusterData, isLoading: loadingClusters } = useClusterMapData(clusterType);

    // Client-side only
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Create state lookup map with aliases for name variations
    const stateDataMap = useMemo(() => {
        const map: Record<string, StateMapData> = {};
        stateData?.forEach((s) => {
            const key = s.state.toLowerCase();
            map[key] = s;
            // Add aliases for states with name variations
            if (key === 'odisha') map['orissa'] = s;
            if (key === 'orissa') map['odisha'] = s;
        });
        return map;
    }, [stateData]);

    // Max enrollment for color scaling
    const maxEnrollment = useMemo(() => {
        if (!stateData) return 1;
        return Math.max(...stateData.map((s) => s.enrolled));
    }, [stateData]);

    // Handle state click
    const handleStateClick = useCallback(
        (stateName: string) => {
            setSelectedState(stateName);
            setViewLevel("state");
            setMapKey((k) => k + 1);
            onStateClick?.(stateName);
        },
        [onStateClick]
    );

    // Handle district click
    const handleDistrictClick = useCallback(
        (districtName: string) => {
            setSelectedDistrict(districtName);
            setViewLevel("district");
            setMapKey((k) => k + 1);
            onDistrictClick?.(districtName);
        },
        [onDistrictClick]
    );

    // Navigation
    const handleNavigate = useCallback((level: ViewLevel) => {
        if (level === "national") {
            setSelectedState(null);
            setSelectedDistrict(null);
        } else if (level === "state") {
            setSelectedDistrict(null);
        }
        setViewLevel(level);
        setMapKey((k) => k + 1);
    }, []);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        // Will be handled by map ref
    }, []);

    const handleZoomOut = useCallback(() => {
        // Will be handled by map ref
    }, []);

    // GeoJSON style function
    const getStateStyle = useCallback(
        (feature: any) => {
            const stateName = feature?.properties?.NAME_1?.toLowerCase() || "";
            const stateInfo = stateDataMap[stateName];
            const enrolled = stateInfo?.enrolled || 0;

            return {
                fillColor: getEnrollmentColor(enrolled, maxEnrollment),
                weight: 1,
                opacity: 1,
                color: "#1e293b",
                fillOpacity: 0.7,
            };
        },
        [stateDataMap, maxEnrollment]
    );

    // GeoJSON event handlers
    const onEachState = useCallback(
        (feature: any, layer: any) => {
            const stateName = feature?.properties?.NAME_1 || "Unknown";
            const stateInfo = stateDataMap[stateName.toLowerCase()];

            layer.bindTooltip(
                `<div class="font-medium">${stateName}</div>
                <div class="text-sm">Enrolled: ${formatNumber(stateInfo?.enrolled || 0)}</div>
                <div class="text-xs text-gray-400">${stateInfo?.districts || 0} districts</div>`,
                { sticky: true, className: "map-tooltip" }
            );

            layer.on({
                click: () => handleStateClick(stateName),
                mouseover: (e: any) => {
                    e.target.setStyle({ fillOpacity: 0.9, weight: 2 });
                },
                mouseout: (e: any) => {
                    e.target.setStyle({ fillOpacity: 0.7, weight: 1 });
                },
            });
        },
        [stateDataMap, handleStateClick]
    );

    // Loading state
    const isLoading = loadingGeo || loadingStates || (mode === "clusters" && loadingClusters);

    if (!isClient) {
        return (
            <div
                className="flex items-center justify-center bg-card rounded-xl border border-border"
                style={{ height }}
            >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                className="flex items-center justify-center bg-card rounded-xl border border-border"
                style={{ height }}
            >
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading map data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl overflow-hidden border border-border" style={{ height }}>
            {/* Import Leaflet CSS */}
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />

            <style jsx global>{`
                .map-tooltip {
                    background: rgba(20, 30, 50, 0.95) !important;
                    border: 1px solid rgba(136, 146, 166, 0.3) !important;
                    border-radius: 8px !important;
                    padding: 8px 12px !important;
                    color: #e8edf5 !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                }
                .map-tooltip::before {
                    border-top-color: rgba(20, 30, 50, 0.95) !important;
                }
                .leaflet-container {
                    background: #0a1628 !important;
                }
            `}</style>

            <MapContainer
                key={mapKey}
                center={INDIA_BOUNDS.center}
                zoom={INDIA_BOUNDS.zoom}
                minZoom={INDIA_BOUNDS.minZoom}
                maxZoom={INDIA_BOUNDS.maxZoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* National view - States choropleth */}
                {viewLevel === "national" && geoJSON && (
                    <GeoJSON
                        data={geoJSON}
                        style={getStateStyle}
                        onEachFeature={onEachState}
                    />
                )}

                {/* State view - District markers */}
                {viewLevel === "state" && districtData && selectedState && (() => {
                    const stateBounds = STATE_BOUNDS[selectedState.toLowerCase()] || { lat: 20.5, lng: 78.9, spread: 2.0 };
                    const maxDist = Math.max(...districtData.map((x) => x.enrolled), 1);

                    return districtData.map((d: DistrictMapData, i: number) => {
                        // Deterministic positioning based on district name hash
                        const hash = d.district.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                        const angle = (hash % 360) * (Math.PI / 180);
                        const radius = (hash % 100) / 100 * stateBounds.spread;
                        const lat = stateBounds.lat + Math.sin(angle) * radius;
                        const lng = stateBounds.lng + Math.cos(angle) * radius;

                        return (
                            <CircleMarker
                                key={`district-${d.district}-${d.state}-${i}`}
                                center={[lat, lng]}
                                radius={8 + (d.enrolled / maxDist) * 15}
                                pathOptions={{
                                    fillColor: getEnrollmentColor(d.enrolled, maxDist),
                                    fillOpacity: 0.8,
                                    color: "#1e293b",
                                    weight: 1,
                                }}
                                eventHandlers={{
                                    click: () => handleDistrictClick(d.district),
                                }}
                            >
                                <Tooltip>
                                    <div className="font-medium">{d.district}</div>
                                    <div className="text-sm">Enrolled: {formatNumber(d.enrolled)}</div>
                                    <div className="text-xs text-gray-400">{d.pincodes} pincodes</div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    });
                })()}

                {/* District view - Pincode markers */}
                {viewLevel === "district" && pincodeData && selectedState && (() => {
                    const stateBounds = STATE_BOUNDS[selectedState.toLowerCase()] || { lat: 20.5, lng: 78.9, spread: 1.5 };
                    const maxPin = Math.max(...pincodeData.map((x) => x.enrolled), 1);

                    return pincodeData.map((p: PincodeMapData, i: number) => {
                        // Use state bounds + pincode-based offset for positioning
                        const hash = String(p.pincode).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                        const angle = (hash % 360) * (Math.PI / 180);
                        const radius = (hash % 100) / 100 * stateBounds.spread * 0.8;
                        const lat = stateBounds.lat + Math.sin(angle) * radius;
                        const lng = stateBounds.lng + Math.cos(angle) * radius;

                        return (
                            <CircleMarker
                                key={`pincode-${p.pincode}-${p.district}-${i}`}
                                center={[lat, lng]}
                                radius={4 + (p.enrolled / maxPin) * 10}
                                pathOptions={{
                                    fillColor: getEnrollmentColor(p.enrolled, maxPin),
                                    fillOpacity: 0.7,
                                    color: "#1e293b",
                                    weight: 1,
                                }}
                            >
                                <Tooltip>
                                    <div className="font-medium">PIN: {p.pincode}</div>
                                    <div className="text-sm">Enrolled: {formatNumber(p.enrolled)}</div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    });
                })()}

                {/* Cluster mode - Show cluster points */}
                {mode === "clusters" && clusterData && clusterData.map((c: ClusterMapData, i: number) => (
                    <CircleMarker
                        key={`${c.pincode}-${i}`}
                        center={[c.lat, c.lng]}
                        radius={6}
                        pathOptions={{
                            fillColor: clusterType === "cold" ? "#3b82f6" : "#ef4444",
                            fillOpacity: 0.7,
                            color: "#1e293b",
                            weight: 1,
                        }}
                    >
                        <Tooltip>
                            <div className="font-medium">PIN: {c.pincode}</div>
                            <div className="text-sm">{c.district}, {c.state}</div>
                            <div className="text-xs">
                                {clusterType === "cold"
                                    ? `Enrolled: ${formatNumber(c.enrolled)}`
                                    : `Updates: ${formatNumber(c.updates || 0)}`}
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Controls */}
            <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={() => handleNavigate("national")}
                viewLevel={viewLevel}
            />

            {/* Breadcrumb */}
            {mode === "dashboard" && (
                <MapBreadcrumb
                    viewLevel={viewLevel}
                    selectedState={selectedState}
                    selectedDistrict={selectedDistrict}
                    onNavigate={handleNavigate}
                />
            )}

            {/* Legend */}
            <MapLegend mode={mode} clusterType={clusterType} />
        </div>
    );
}
