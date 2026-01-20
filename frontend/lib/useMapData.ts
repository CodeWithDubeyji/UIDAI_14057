/**
 * React Query hooks for map data fetching
 */
import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface StateMapData {
    state: string;
    enrolled: number;
    districts: number;
    pincodes: number;
}

export interface DistrictMapData {
    district: string;
    state: string;
    enrolled: number;
    age_0_5: number;
    age_5_17: number;
    age_18_plus: number;
    pincodes: number;
}

export interface PincodeMapData {
    pincode: string;
    district: string;
    state: string;
    enrolled: number;
    age_0_5: number;
    age_5_17: number;
    age_18_plus: number;
    lat: number;
    lng: number;
}

export interface ClusterMapData {
    pincode: string;
    district: string;
    state: string;
    enrolled: number;
    updates?: number;
    lat: number;
    lng: number;
}

// Fetch state-level enrollment data
export function useStateMapData() {
    return useQuery({
        queryKey: ['mapStates'],
        queryFn: async (): Promise<StateMapData[]> => {
            const res = await fetch(`${API_BASE}/map/states`);
            if (!res.ok) throw new Error('Failed to fetch state data');
            const json = await res.json();
            return json.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Fetch district-level data for a specific state
export function useDistrictMapData(state: string | null) {
    return useQuery({
        queryKey: ['mapDistricts', state],
        queryFn: async (): Promise<DistrictMapData[]> => {
            if (!state) return [];
            const res = await fetch(`${API_BASE}/map/districts/${encodeURIComponent(state)}`);
            if (!res.ok) throw new Error('Failed to fetch district data');
            const json = await res.json();
            return json.data;
        },
        enabled: !!state,
        staleTime: 5 * 60 * 1000,
    });
}

// Fetch pincode-level data for a specific district
export function usePincodeMapData(district: string | null) {
    return useQuery({
        queryKey: ['mapPincodes', district],
        queryFn: async (): Promise<PincodeMapData[]> => {
            if (!district) return [];
            const res = await fetch(`${API_BASE}/map/pincodes/${encodeURIComponent(district)}`);
            if (!res.ok) throw new Error('Failed to fetch pincode data');
            const json = await res.json();
            return json.data;
        },
        enabled: !!district,
        staleTime: 5 * 60 * 1000,
    });
}

// Fetch cluster data for visualization
export function useClusterMapData(clusterType: 'cold' | 'hot') {
    return useQuery({
        queryKey: ['mapClusters', clusterType],
        queryFn: async (): Promise<ClusterMapData[]> => {
            const res = await fetch(`${API_BASE}/map/clusters/${clusterType}`);
            if (!res.ok) throw new Error('Failed to fetch cluster data');
            const json = await res.json();
            return json.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

// Fetch India GeoJSON for state boundaries
export function useIndiaGeoJSON() {
    return useQuery({
        queryKey: ['indiaGeoJSON'],
        queryFn: async () => {
            const res = await fetch(
                'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson'
            );
            if (!res.ok) throw new Error('Failed to fetch GeoJSON');
            return res.json();
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours - GeoJSON doesn't change
    });
}
